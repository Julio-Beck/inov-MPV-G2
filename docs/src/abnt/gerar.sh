#!/usr/bin/env bash
# Gera o Plano de Negócios no padrão ABNT (Word e PDF) em docs/entrega/. Requer python-docx e LibreOffice.
set -euo pipefail
cd "$(dirname "$0")"
T=$(mktemp -d)
python3 gerar_plano_abnt.py plano_conteudo.docx "$T/p1.docx" '' roadmap.png
soffice --headless --convert-to pdf --outdir "$T" "$T/p1.docx" >/dev/null
python3 paginas.py "$T/p1.pdf" > "$T/paginas.json"
python3 gerar_plano_abnt.py plano_conteudo.docx "$T/Plano.docx" "$T/paginas.json" roadmap.png
soffice --headless --convert-to pdf --outdir "$T" "$T/Plano.docx" >/dev/null
cp "$T/Plano.docx" ../../entrega/1_Plano_de_Negocios_Oportuniza_Rede.docx
cp "$T/Plano.pdf" ../../entrega/1_Plano_de_Negocios_Oportuniza_Rede.pdf
echo "Pronto: docs/entrega/1_Plano_de_Negocios_Oportuniza_Rede.(docx|pdf)"
