import json,subprocess,tempfile,shutil
from pathlib import Path
script=Path(__file__).resolve().parents[1]/'scripts'/'sync-upstream.py'
root=Path(tempfile.mkdtemp(prefix='tubes-sync-'))
def run(p,*a,ok=True):return subprocess.run(a,cwd=p,text=True,capture_output=True,check=ok)
def git(p,*a):return run(p,'git',*a)
def put(p,f,s):
 q=p/f;q.parent.mkdir(parents=True,exist_ok=True);q.write_text(s)
u=root/'upstream';u.mkdir();git(u,'init','-b','main');git(u,'config','user.name','Test');git(u,'config','user.email','test@example.com')
for f,s in {'package.json':json.dumps({'version':'1.0.0'}),'package-lock.json':json.dumps({'version':'1.0.0','packages':{'':{'version':'1.0.0'}}}),'CHANGELOG.md':'## [Unreleased]\n\n## [1.0.0]\n\n- Base.\n','site/CNAME':'upstream.example\n','site/index.html':'base\n','.github/workflows/ci.yml':'upstream\n','.github/workflows/perf.yml':'old upstream perf\n'}.items():put(u,f,s)
git(u,'add','.');git(u,'commit','-m','base')
p=root/'fork';git(root,'clone',str(u),str(p));git(p,'config','user.name','Test');git(p,'config','user.email','test@example.com');git(p,'config',f'url.{u}.insteadOf','https://github.com/fjaeckel/seriesoftubes.git')
git(p,'rm','.github/workflows/perf.yml');put(p,'site/CNAME','fork.example\n');put(p,'.github/workflows/ci.yml','fork\n');git(p,'add','.');git(p,'commit','-m','fork settings')
r=run(p,'python3',str(script));assert 'changed=false' in r.stdout
put(u,'.github/workflows/perf.yml','changed upstream perf\n');put(u,'.github/workflows/new.yml','new workflow\n');put(u,'site/new.html','new feature\n');put(u,'.github/workflows/ci.yml','new upstream\n');put(u,'package.json',json.dumps({'version':'1.1.0'}));git(u,'add','.');git(u,'commit','-m','feature')
r=run(p,'python3',str(script));assert 'changed=true' in r.stdout;assert json.loads((p/'package.json').read_text())['version']=='1.1.0-qol.1';assert (p/'site/new.html').exists();assert not (p/'.github/workflows/perf.yml').exists();assert not (p/'.github/workflows/new.yml').exists();assert (p/'site/CNAME').read_text()=='fork.example\n';assert (p/'.github/workflows/ci.yml').read_text()=='fork\n';git(p,'add','.');git(p,'commit','-m','sync')
put(p,'site/index.html','fork code\n');git(p,'add','.');git(p,'commit','-m','fork code');put(u,'site/index.html','upstream code\n');git(u,'add','.');git(u,'commit','-m','upstream code');before=git(p,'rev-parse','HEAD').stdout
r=run(p,'python3',str(script),ok=False);assert r.returncode and 'Manual merge required' in r.stderr;assert git(p,'rev-parse','HEAD').stdout==before;assert not git(p,'status','--porcelain').stdout
print('PASS: no-change, clean sync, version bump, fork settings, conflict abort without publication')
shutil.rmtree(root)
