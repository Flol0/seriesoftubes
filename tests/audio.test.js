const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

test('sound recovers suspended, interrupted and closed contexts and previews unmute', () => {
  const { ev, dom, errors } = load();
  ev(`window.made=0;window.resumes=0;window.tones=0;
    window.AudioContext=class {
      constructor(){made++;this.state='suspended';this.currentTime=0;this.destination={};}
      resume(){resumes++;this.state='running';return Promise.resolve();}
      createOscillator(){return {frequency:{value:0},connect(){return {connect(){}}},start(){tones++},stop(){}};}
      createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}};}
    };
    audioInit();`);
  assert.equal(ev('made'), 1);
  assert.equal(ev('resumes'), 1);
  ev("audioInit();AC.state='interrupted';audioInit()");
  assert.equal(ev('made'), 1);
  assert.equal(ev('resumes'), 2);
  ev("AC.state='closed';audioInit()");
  assert.equal(ev('made'), 2);
  ev("UI.muted=true;ACT.soundSet({v:'on'})");
  assert.equal(ev('tones'), 1);
  assert.equal(dom.window.localStorage.getItem('sot-mute'), '0');
  ev("ACT.soundSet({v:'off'});sfx('click')");
  assert.equal(ev('tones'), 1, 'muted effects stay silent');
  ev('ACT.mute()');
  assert.equal(ev('tones'), 2);
  ev("AC.state='suspended';AC.resume=()=>Promise.reject(new Error('blocked'));audioInit()");
  assert.deepEqual(errors, []);
  dom.window.close();
});
