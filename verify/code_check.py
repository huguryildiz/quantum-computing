#!/usr/bin/env python3
"""Run every program on a code page (build/src/7?_code_m*.js) in both of its
forms, the Qiskit listing and the NumPy version, and compare what each prints
with the entry's `out`.

The NumPy half runs with the project venv. The Qiskit half needs an interpreter
with Qiskit installed; it is found through $QISKIT_PYTHON or `.venv-qiskit/`
in the repository root (built from the arm64 Homebrew Python with
`pip install qiskit`). If neither exists, the Qiskit half is reported as SKIP.
Optional arguments name key prefixes; only those entries are run."""
import glob, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = sorted(glob.glob(os.path.join(ROOT, 'build', 'src', '7?_code_m*.js')))

def load(path):
    js = ("const fs=require('fs');const src=fs.readFileSync(process.argv[1],'utf8');"
          "const name=src.match(/const (CODE_M\\d+)/)[1];"
          "console.log(JSON.stringify(eval(src+';'+name)));")
    return json.loads(subprocess.check_output(['node', '-e', js, path]))

def qiskit_python():
    if os.environ.get('QISKIT_PYTHON'): return os.environ['QISKIT_PYTHON']
    p = os.path.join(ROOT, '.venv-qiskit', 'bin', 'python')
    return p if os.path.exists(p) else None

P, F, S = [], [], []
def chk(name, got, want):
    ok = got.strip() == want.strip()
    (P if ok else F).append(name)
    print(("PASS  " if ok else "FAIL  ") + name + ("" if ok else f"\n      want: {want!r}\n      got:  {got!r}"))

def run(py, src):
    r = subprocess.run([py, '-c', src], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else r.stdout + r.stderr

ONLY = sys.argv[1:]
QK = qiskit_python()
for f in FILES:
    for sid, e in load(f).items():
        if ONLY and not any(sid.startswith(p) for p in ONLY): continue
        n = max(len(e['py'].splitlines()), len(e['qk'].splitlines()))
        if not 10 <= n <= 21: F.append(sid); print(f"FAIL  {sid} · {n} lines, outside 10 to 21")
        chk(f"{sid} · NumPy", run(sys.executable, e['py']), e['out'])
        if not QK:
            S.append(sid); print(f"SKIP  {sid} · Qiskit (no interpreter with Qiskit)"); continue
        chk(f"{sid} · Qiskit", run(QK, e['qk']), e['out'])

print(f"\n{len(P)} passed, {len(F)} failed, {len(S)} skipped")
sys.exit(1 if F else 0)
