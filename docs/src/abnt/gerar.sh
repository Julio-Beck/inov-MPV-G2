#!/usr/bin/env bash
# Gera o Plano de Negócios no padrão ABNT (Word e PDF) em docs/entrega/.
# Requer python-docx, LibreOffice e a fonte Times New Roman instalada (sem ela o PDF sai com fonte substituta).
# Mede as páginas e compacta só as seções que transbordam poucas linhas, até a paginação ficar estável.
cd "$(dirname "$0")"
T=$(mktemp -d)
FONTE="${1:-Times New Roman}"
echo '{}' > "$T/pg.json"
for i in 1 2 3 4 5 6; do
  python3 gerar_plano_abnt.py plano_conteudo.docx "$T/Plano.docx" "$T/pg.json" roadmap.png "$FONTE" >/dev/null || exit 1
  soffice --headless --convert-to pdf --outdir "$T" "$T/Plano.docx" >/dev/null 2>&1
  python3 paginas.py "$T/Plano.pdf" > "$T/novo.json" 2>/dev/null
  python3 - "$T" <<'PY' && break
import json, sys, subprocess, re
d = sys.argv[1]
old = json.load(open(f'{d}/pg.json')); new = json.load(open(f'{d}/novo.json'))
fill = subprocess.run(['python3', 'preenchimento.py', f'{d}/Plano.pdf'], capture_output=True, text=True).stdout.splitlines()
secs = sorted((v, int(k[1:])) for k, v in new.items() if re.match(r'S\d+$', k))
compact = set(old.get('compact', []))
for line in fill:
    m = re.match(r'\s*(\d+)\s+(\d+)%', line)
    if not m: continue
    pg, pct = int(m.group(1)) - 1, int(m.group(2))
    if pct < 30 and secs and secs[0][0] < pg < new.get('REF', 999) and not any(p == pg for p, _ in secs):
        compact.add(max(s for p, s in secs if p <= pg))
new['compact'] = sorted(compact)
json.dump(new, open(f'{d}/pg.json', 'w'))
sys.exit(0 if old == new else 3)
PY
done
cp "$T/Plano.docx" ../../entrega/1_Plano_de_Negocios_Oportuniza_Rede.docx
cp "$T/Plano.pdf" ../../entrega/1_Plano_de_Negocios_Oportuniza_Rede.pdf
echo "Pronto: docs/entrega/1_Plano_de_Negocios_Oportuniza_Rede.(docx|pdf) — $(pdfinfo "$T/Plano.pdf" | grep Pages)"
