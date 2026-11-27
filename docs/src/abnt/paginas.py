# Lê o PDF gerado e devolve, em JSON, a página ABNT de cada seção, quadro, tabela e figura
import sys, re, json, subprocess
pdf = sys.argv[1]
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
pages = [subprocess.run(['pdftotext', '-layout', '-f', str(i), '-l', str(i), pdf, '-'], capture_output=True, text=True).stdout for i in range(1, n + 1)]
out = {}
start = None
for i, t in enumerate(pages):
    lines = [l.strip() for l in t.splitlines() if l.strip()]
    if lines and lines[0].isdigit(): lines = lines[1:]
    if start is None:
        if lines and re.match(r'^1\s+INTRODUÇÃO$', lines[0]): start = i
        else: continue
    for l in lines:
        m = re.match(r'^(\d+)\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ ,]+)$', l)
        if m and l == lines[0] and f'S{m.group(1)}' not in out: out[f'S{m.group(1)}'] = i  # pdf idx 0-based = página ABNT (capa não conta)
        m = re.match(r'^(Quadro|Tabela|Figura) (\d+) –', l)
        if m and f'{m.group(1)} {m.group(2)}' not in out: out[f'{m.group(1)} {m.group(2)}'] = i
        if l == 'REFERÊNCIAS' and 'REF' not in out: out['REF'] = i
print(json.dumps(out, ensure_ascii=False))
print('total de páginas:', n, file=sys.stderr)
