// Reads and writes the dictionaries: English in src/i18n/en.js, translations in site/i18n/<lang>.js.
// Each maps a label to its text, or for plurals to {"one": …, "other": …}.
//
// Every dictionary is kept in one canonical layout: the header comment, then one `"label":"Text",`
// entry per line, sorted by label. Sorted entries spread new strings across the file instead of
// piling them up at the end, so two pull requests that each add strings rarely touch the same lines.
// `npm run i18n:check` reports a dictionary that is out of order; `npm run i18n:fix` puts it back.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// English lives with the source (it is inlined into the page); translations are static files in site/i18n/.
const DIR = path.join(__dirname, '..', '..', 'site', 'i18n');
const EN = path.join(__dirname, '..', '..', 'src', 'i18n', 'en.js');
const fileOf = (lang) => (lang === 'en' ? EN : path.join(DIR, `${lang}.js`));
const langs = () => fs.readdirSync(DIR).filter((f) => f.endsWith('.js')).map((f) => path.basename(f, '.js')).sort();

// Plain code-unit order: the same on every machine, whatever its locale.
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function parse(text, lang) {
  const window = {};
  vm.runInNewContext(text, { window });
  return (window.I18N || {})[lang] || {};
}

function read(lang) {
  const text = fs.readFileSync(fileOf(lang), 'utf8');
  const open = text.indexOf(`(window.I18N=window.I18N||{}).${lang}={`);
  if (open < 0) throw new Error(`${lang}.js: missing the (window.I18N=window.I18N||{}).${lang}={ line`);
  return { text, header: text.slice(0, open), dict: parse(text, lang) };
}

function format(lang, header, dict) {
  const keys = Object.keys(dict).sort(cmp);
  return `${header}(window.I18N=window.I18N||{}).${lang}={\n${keys.map((k) => `${JSON.stringify(k)}:${JSON.stringify(dict[k])},\n`).join('')}};\n`;
}

// True when the file is already in the canonical layout.
function tidy(lang) {
  const { text, header, dict } = read(lang);
  return text === format(lang, header, dict);
}

function write(lang, dict, header = read(lang).header) {
  fs.writeFileSync(fileOf(lang), format(lang, header, dict));
}

module.exports = { DIR, EN, fileOf, langs, read, write, format, tidy, parse, cmp };
