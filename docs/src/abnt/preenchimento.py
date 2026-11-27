# Mostra, para cada página do PDF, até onde vai o texto (0% = vazia, 100% = cheia até a margem inferior)
import sys, re, subprocess
pdf = sys.argv[1]
x = subprocess.run(['pdftotext', '-bbox', pdf, '-'], capture_output=True, text=True).stdout
pages = re.findall(r'<page width="([\d.]+)" height="([\d.]+)">(.*?)</page>', x, re.S)
for i, (w, h, body) in enumerate(pages, 1):
    ys = [(float(a), float(b), t) for a, b, t in re.findall(r'yMin="([\d.]+)" xMax="[\d.]+" yMax="([\d.]+)">([^<]*)<', body)]
    ys = [y for y in ys if y[0] > 80]  # ignora o número da página
    if not ys: print(i, 'vazia'); continue
    bottom = max(b for _, b, _ in ys); top_word = min(ys)[2]
    fill = (bottom - 85) / (float(h) - 57 - 85)
    print(f'{i:2d} {fill:4.0%} começa com: {top_word}')
