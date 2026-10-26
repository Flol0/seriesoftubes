#!/usr/bin/env python3
"""Prepare a tested upstream merge; never resolve game-code conflicts automatically."""
import json
import os
from pathlib import Path
import re
import subprocess
from datetime import datetime, timezone


def git(*args, check=True):
    result = subprocess.run(['git', *args], text=True, capture_output=True)
    if check and result.returncode:
        raise SystemExit(result.stderr or result.stdout or f'git {args} failed')
    return result


def output(name, value):
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as f:
            f.write(f'{name}={value}\n')
    print(f'{name}={value}')


if git('status', '--porcelain').stdout.strip():
    raise SystemExit('Working tree is dirty; refusing to update.')
git('fetch', 'https://github.com/fjaeckel/seriesoftubes.git', 'main')
upstream = git('rev-parse', 'FETCH_HEAD').stdout.strip()
if git('merge-base', '--is-ancestor', upstream, 'HEAD', check=False).returncode == 0:
    output('changed', 'false')
    raise SystemExit(0)
old = json.loads(Path('package.json').read_text())['version']
old_notes = Path('CHANGELOG.md').read_text()
merged = git('merge', '--no-commit', '--no-ff', upstream, check=False)
if merged.returncode and git('rev-parse', '--verify', 'MERGE_HEAD', check=False).returncode:
    raise SystemExit(merged.stderr)
# Upstream workflow changes must not replace the fork's automation or publishing settings.
protected = ('.github/workflows', 'site/CNAME')
kept = git('ls-tree', '-r', '--name-only', 'HEAD', '--', *protected).stdout.splitlines()
indexed = set(git('ls-files', '--', *protected).stdout.splitlines())
removed = sorted(indexed - set(kept))
# restore cannot remove an unmerged file absent from HEAD (modify/delete conflict).
if removed:
    git('rm', '-f', '--ignore-unmatch', '--', *removed)
if kept:
    git('restore', '--source=HEAD', '--staged', '--worktree', '--', *kept)
conflicts = git('diff', '--name-only', '--diff-filter=U').stdout.splitlines()
managed = {'package.json', 'package-lock.json', 'CHANGELOG.md'}
if set(conflicts) - managed:
    git('merge', '--abort')
    raise SystemExit('Manual merge required: ' + ', '.join(sorted(set(conflicts) - managed)))
# Release metadata can be rebuilt deterministically; code and translations cannot.
for name in ('package.json', 'package-lock.json', 'CHANGELOG.md'):
    if name in conflicts:
        Path(name).write_text(git('show', f'{upstream}:{name}').stdout)
base = json.loads(git('show', f'{upstream}:package.json').stdout)['version']
match = re.fullmatch(re.escape(base) + r'-qol\.(\d+)', old)
version = base + '-qol.' + str(int(match[1]) + 1 if match else 1)
for name in ('package.json', 'package-lock.json'):
    p = Path(name)
    data = json.loads(p.read_text())
    data['version'] = version
    if name == 'package-lock.json':
        data['packages']['']['version'] = version
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
notes = Path('CHANGELOG.md').read_text()
entry = f"\n\n## [{version}] — {datetime.now(timezone.utc):%Y-%m-%d}\n\n- Synced upstream main ({upstream[:7]}), including unreleased changes, while retaining the fork’s QoL improvements.\n"
if '## [Unreleased]' not in notes:
    git('merge', '--abort')
    raise SystemExit('Missing Unreleased changelog heading.')
notes = notes.replace('## [Unreleased]', '## [Unreleased]' + entry, 1)
# Keep prior fork release history when the changelog itself conflicted.
for section in re.findall(r'^## \[[^\]]+-qol\.[^\]]+\].*?(?=^## |\Z)', old_notes, re.M | re.S):
    heading = section.splitlines()[0]
    if heading not in notes:
        notes += '\n' + section.rstrip() + '\n'
Path('CHANGELOG.md').write_text(notes)
git('add', 'package.json', 'package-lock.json', 'CHANGELOG.md')
output('changed', 'true')
output('version', version)
