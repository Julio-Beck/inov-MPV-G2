# Gera o Plano de Negócios da Oportuniza Rede no padrão ABNT (NBR 14724, 6023, 6024, 6027, 6028, 10520)
# a partir do Word exportado do documento original. Uso: python3 build.py SRC.docx OUT.docx [paginas.json]
import sys, re, json, copy
import docx
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT, WD_TAB_LEADER, WD_BREAK
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

SRC, OUT = sys.argv[1], sys.argv[2]
PAGES = json.load(open(sys.argv[3])) if len(sys.argv) > 3 and sys.argv[3] else {}
FONT = sys.argv[5] if len(sys.argv) > 5 else 'Times New Roman'
AUTORES = ['DOUGLAS', 'JÉSSICA', 'JÚLIO', 'THALES']
INST = 'ANTONIO MENEGHETTI FACULDADE'
CURSO = 'CURSO DE SISTEMAS DE INFORMAÇÃO'
CIDADE, ANO = 'RESTINGA SÊCA', '2026'
ACESSO = 'Acesso em: 27 nov. 2026.'

src = Document(SRC)
doc = Document()

# ---------- estilos ----------
def set_font(style_or_run, size=12, bold=None):
    f = style_or_run.font
    f.name = FONT; f.size = Pt(size); f.color.rgb = RGBColor(0, 0, 0)
    if bold is not None: f.bold = bold
    rpr = style_or_run.element.get_or_add_rPr()
    rf = rpr.find(qn('w:rFonts'))
    if rf is None: rf = OxmlElement('w:rFonts'); rpr.append(rf)
    for k in ('w:ascii', 'w:hAnsi', 'w:cs', 'w:eastAsia'): rf.set(qn(k), FONT)

st = doc.styles['Normal']; set_font(st)
pf = st.paragraph_format; pf.space_before = Pt(0); pf.space_after = Pt(0); pf.line_spacing = 1.5
for name in ('Heading 1', 'Title'):
    h = doc.styles[name]; set_font(h, 12, True); h.font.italic = False
    h.paragraph_format.space_before = Pt(0); h.paragraph_format.space_after = Pt(18)
    h.paragraph_format.line_spacing = 1.5; h.paragraph_format.keep_with_next = True

sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.top_margin, sec.left_margin, sec.bottom_margin, sec.right_margin = Cm(3), Cm(3), Cm(2), Cm(2)
sec.header_distance = Cm(2); sec.footer_distance = Cm(1.25)
TEXTW = 16.0  # cm

# ---------- auxiliares ----------
def para(text='', size=12, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True, spacing=1.5, after=0, before=0, keep=False, caps=False):
    p = doc.add_paragraph()
    f = p.paragraph_format; f.alignment = align; f.line_spacing = spacing
    f.space_after = Pt(after); f.space_before = Pt(before); f.keep_with_next = keep
    f.first_line_indent = Cm(1.25) if indent else Cm(0)
    if text:
        r = p.add_run(text.upper() if caps else text); set_font(r, size, bold)
    return p

def add_runs(p, runs, size=12):
    for text, bold in runs:
        r = p.add_run(text); set_font(r, size, bold)

def page_break():
    p = doc.add_paragraph(); p.add_run().add_break(WD_BREAK.PAGE)

def blank(n=1, spacing=1.5):
    for _ in range(n): para('', spacing=spacing, indent=False)

def heading(text, centered=False):
    p = doc.add_paragraph(style='Heading 1')
    p.paragraph_format.page_break_before = True
    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER if centered else WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run(text); set_font(r, 12, True)
    return p

def field(run, instr):
    for kind, val in (('begin', None), ('instr', instr), ('separate', None), ('text', '1'), ('end', None)):
        if kind == 'instr':
            e = OxmlElement('w:instrText'); e.set(qn('xml:space'), 'preserve'); e.text = val; run._r.append(e)
        elif kind == 'text':
            e = OxmlElement('w:t'); e.text = val; run._r.append(e)
        else:
            e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), kind); run._r.append(e)

def new_section(start_at=None):
    s = doc.add_section(WD_SECTION.NEW_PAGE)
    s.header.is_linked_to_previous = False
    if start_at is not None:
        pg = OxmlElement('w:pgNumType'); pg.set(qn('w:start'), str(start_at)); s._sectPr.append(pg)
    return s

def borders(tbl, quadro, header_rows=1):
    tblPr = tbl._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for side in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{side}')
        on = quadro or side in ('top', 'bottom')
        e.set(qn('w:val'), 'single' if on else 'nil'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), '000000')
        b.append(e)
    tblPr.append(b)
    if not quadro:  # tabela: linha sob o cabeçalho
        for c in tbl.rows[header_rows - 1].cells:
            tcPr = c._tc.get_or_add_tcPr(); tb = OxmlElement('w:tcBorders'); e = OxmlElement('w:bottom')
            e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), '000000'); tb.append(e); tcPr.append(tb)

# ---------- numeração de seções e citações ----------
def shift_secoes(t):
    def f(m):
        a = int(m.group(2)) + 1
        s = f'seç{m.group(1)} {a}'
        if m.group(4): s += f' e {int(m.group(4)) + 1}'
        return s
    return re.sub(r'seç(ão|ões) (\d+)( e (\d+))?', f, t)

REPL = [  # (trecho do original, substituto) — citações no texto (NBR 10520:2023)
    ('desemprego de 18 a 24 anos no dobro da média nacional', 'desemprego de 18 a 24 anos no dobro da média nacional (Vargas, 2024)'),
    ('controla a jornada máxima de 30 horas semanais', 'controla a jornada máxima de 30 horas semanais (Brasil, 2008)'),
    ('(repositório)', '(Oportuniza Rede, 2026)'),
]
used = {k: 0 for k, _ in REPL}
def fix_text(t):
    t = shift_secoes(t)
    for a, b in REPL:
        if a in t: t = t.replace(a, b); used[a] += 1
    return t

# ---------- quadros, tabelas e figura ----------
EL = '(Elaborado pelos autores, 2026)'
CAP = {  # índice da tabela no original -> (tipo, título, frase de chamada, fonte)
    0: ('Quadro', 'Resumo do plano de negócios', 'O Quadro {n} resume o plano.', 'Elaborado pelos autores (2026), com base em INEP (2026), Almeida (2026) e Vargas (2024).'),
    1: ('Quadro', 'Dados da empresa', 'O Quadro {n} apresenta a forma jurídica e os dados de registro previstos.', 'Elaborado pelos autores (2026).'),
    2: ('Quadro', 'Papéis na sociedade', 'O Quadro {n} apresenta os papéis na sociedade.', 'Elaborado pelos autores (2026).'),
    3: ('Quadro', 'Produtos e serviços por perfil e situação no MVP', 'O Quadro {n} detalha o que a plataforma entrega a cada perfil e o que já está no MVP.', 'Elaborado pelos autores (2026).'),
    4: ('Quadro', 'O que a faculdade ganha com a plataforma', 'O Quadro {n} resume o que a faculdade ganha e o dado que sustenta cada ponto.', 'Elaborado pelos autores (2026), com base em Brasil (2008), O Sinaes... ([20--]) e Estágio... (2025).'),
    5: ('Tabela', 'Preço por estagiário ativo por mês: referências de mercado', 'A Tabela {n} compara o preço com essas referências.', 'Elaborado pelos autores (2026), com base em CIEE/PR ([2026]), Quanto... (2025), Santa Catarina (2026), Conselho Federal de Enfermagem (2026) e Tribunal Regional Eleitoral de Rondônia (2025).'),
    6: ('Tabela', 'Efeito do preço por estagiário no ponto de equilíbrio', 'A Tabela {n} mostra como o preço muda o número de faculdades necessárias para o equilíbrio.', 'Elaborado pelos autores (2026).'),
    7: ('Quadro', 'Segmentos de clientes', 'O Quadro {n} apresenta os segmentos de clientes.', 'Elaborado pelos autores (2026), com base em INEP (2026), Vargas (2024) e Ensino... (2026).'),
    8: ('Tabela', 'Tamanho de mercado com os preços da seção 4', 'A Tabela {n} apresenta o tamanho de mercado.', 'Elaborado pelos autores (2026), com base em INEP (2026) e Vargas (2024).'),
    9: ('Quadro', 'Principais concorrentes', 'O Quadro {n} compara os principais concorrentes.', 'Elaborado pelos autores (2026), com base em Retenção... (2026), Super... (2025), Peçanha (2018) e Brazilian... (2025).'),
    10: ('Quadro', 'Composto de marketing (4 Ps)', 'O Quadro {n} apresenta a estratégia para cada um dos 4 Ps.', 'Elaborado pelos autores (2026).'),
    11: ('Tabela', 'Metas comerciais de 2027 a 2029', 'A Tabela {n} apresenta as metas comerciais.', 'Elaborado pelos autores (2026).'),
    12: ('Quadro', 'Tecnologia e segurança', 'O Quadro {n} resume as decisões de tecnologia e segurança.', 'Elaborado pelos autores (2026), com base em Brasil (2018).'),
    13: ('Quadro', 'Capacidade e equipe de 2027 a 2029', 'O Quadro {n} apresenta a evolução da equipe. A premissa de capacidade é que uma pessoa de sucesso do cliente atende até 20 faculdades, hipótese a medir no piloto.', 'Elaborado pelos autores (2026).'),
    14: ('Tabela', 'Demonstração do resultado projetada de 2027 a 2029 (R$ mil)', 'A Tabela {n} apresenta a demonstração do resultado projetada.', 'Elaborado pelos autores (2026).'),
    15: ('Tabela', 'Uso do investimento de R$ 600 mil, por etapa (R$ mil)', 'A Tabela {n} mostra onde entra cada real do investimento, em cada etapa.', 'Elaborado pelos autores (2026), com base na Tabela 5 e no Quadro 10.'),
    16: ('Quadro', 'Indicadores financeiros estimados (hipóteses)', 'O Quadro {n} apresenta os indicadores financeiros estimados.', 'Elaborado pelos autores (2026).'),
    17: ('Quadro', 'Cenários para o fim de 2029', 'O Quadro {n} compara três cenários.', 'Elaborado pelos autores (2026).'),
    18: ('Quadro', 'Riscos principais e respostas', 'O Quadro {n} apresenta os riscos principais e as respostas previstas.', 'Elaborado pelos autores (2026).'),
    19: ('Tabela', 'Investimento do piloto em 2027 (R$ mil)', 'A Tabela {n} detalha o investimento do piloto e o que cada valor paga.', 'Elaborado pelos autores (2026).'),
}
# parágrafos-rótulo do original que viram título de quadro/tabela (são descartados)
LABELS = ('Papéis na sociedade', 'Clientes:', 'Tamanho de mercado', 'Concorrentes:', 'Os 4 Ps:', 'Metas comerciais:',
          'Tecnologia e segurança:', 'Capacidade e equipe:', 'DRE projetado', 'Investimento necessário: R$ 600 mil',
          'Premissa de capacidade:', 'Indicadores (hipóteses):', 'Riscos principais:', 'Investimento do piloto', 'Roadmap 2027–2029:', 'roadmap 2027–2029 ·')
counters = {'Quadro': 0, 'Tabela': 0, 'Figura': 0}
captions = []  # (tipo, n, título)

LAST = {'p': None}
CUR = {'sec': 0}
COMPACT = set(PAGES.get('compact', []))  # último parágrafo de texto corrido, se foi o último elemento escrito

def caption_block(kind, title, call, fonte):
    counters[kind] += 1; n = counters[kind]
    captions.append((kind, n, title))
    if LAST['p'] is not None:  # a chamada entra no fim do parágrafo anterior (economiza linhas)
        r = LAST['p'].add_run(' ' + call.format(n=n)); set_font(r, 12, False)
        # parágrafo longo não desce inteiro junto com o quadro (evita página com espaço em branco)
        LAST['p'].paragraph_format.keep_with_next = len(LAST['p'].text) < 200
    else:
        para(call.format(n=n), keep=True)
    LAST['p'] = None
    para(f'{kind} {n} – {title}', size=10, align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, spacing=1.0, before=4 if CUR['sec'] in COMPACT else 8, after=3, keep=True)
    return n

def fonte_line(text):
    para(f'Fonte: {text}', size=10, align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, spacing=1.0, before=3, after=8)
    LAST['p'] = None

def copy_table(src_tbl, kind):
    rows = len(src_tbl.rows); cols = len(src_tbl.columns)
    t = doc.add_table(rows=rows, cols=cols)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    lens = [0.0] * cols
    for row in src_tbl.rows:
        for j, c in enumerate(row.cells):
            lens[j] += min(len(c.text), 120) / rows
    lens = [max(l, 6) ** 0.8 for l in lens]
    # mínimo: a maior palavra da coluna cabe inteira (Arial 10 negrito ≈ 0,21 cm por caractere + margens)
    mins = []
    for j in range(cols):
        longest = max((len(w) for row in src_tbl.rows for w in row.cells[j].text.split()), default=4)
        mins.append(min(6.0, longest * 0.21 + 0.45))
    widths = list(mins); rest = TEXTW - sum(mins)
    if rest > 0:
        tot = sum(lens); widths = [m + rest * l / tot for m, l in zip(mins, lens)]
    else:
        k = TEXTW / sum(widths); widths = [w * k for w in widths]
    grid = t._tbl.tblGrid
    for j, gc in enumerate(grid.findall(qn('w:gridCol'))): gc.set(qn('w:w'), str(int(widths[j] / 2.54 * 1440)))
    for j, col in enumerate(t.columns): col.width = Cm(widths[j])
    tblW = t._tbl.tblPr.find(qn('w:tblW'))
    if tblW is None: tblW = OxmlElement('w:tblW'); t._tbl.tblPr.append(tblW)
    tblW.set(qn('w:w'), str(int(TEXTW / 2.54 * 1440))); tblW.set(qn('w:type'), 'dxa')
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed'); t._tbl.tblPr.append(lay)
    for i, row in enumerate(src_tbl.rows):
        for j, c in enumerate(row.cells):
            cell = t.cell(i, j); cell.width = Cm(widths[j])
            cell.paragraphs[0].text = ''
            first = True
            for sp in c.paragraphs:
                p = cell.paragraphs[0] if first else cell.add_paragraph(); first = False
                f = p.paragraph_format; f.line_spacing = 1.0; f.space_after = Pt(0); f.first_line_indent = Cm(0)
                f.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for r in sp.runs:
                    rr = p.add_run(fix_text(r.text)); set_font(rr, 10, True if i == 0 else bool(r.bold))
        if i == 0:
            trPr = t.rows[0]._tr.get_or_add_trPr(); h = OxmlElement('w:tblHeader'); h.set(qn('w:val'), 'true'); trPr.append(h)
    borders(t, kind == 'Quadro')
    mar = OxmlElement('w:tblCellMar')  # respiro interno das células
    tb_pad = 10 if CUR['sec'] in COMPACT else 45
    for side, v in (('top', tb_pad), ('bottom', tb_pad), ('left', 100), ('right', 100)):
        e = OxmlElement(f'w:{side}'); e.set(qn('w:w'), str(v)); e.set(qn('w:type'), 'dxa'); mar.append(e)
    t._tbl.tblPr.append(mar)
    for i, row in enumerate(t.rows):  # linhas não se partem; quadros pequenos ficam inteiros na mesma página
        trPr = row._tr.get_or_add_trPr(); cs = OxmlElement('w:cantSplit'); cs.set(qn('w:val'), 'true'); trPr.append(cs)
        if rows <= 12:  # inclusive a última linha, que fica presa à linha de fonte
            for c in row.cells:
                for cp in c.paragraphs: cp.paragraph_format.keep_with_next = True
    return t

# ---------- CAPA ----------
for line in (INST, CURSO): para(line, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
blank(3)
for a in AUTORES: para(a, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
blank(7)
para('OPORTUNIZA REDE: PLANO DE NEGÓCIOS', bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
blank(12)
para(CIDADE, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
para(ANO, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)

# ---------- FOLHA DE ROSTO (seção 2: contada a partir daqui, sem número visível) ----------
new_section(start_at=1)
for a in AUTORES: para(a, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
blank(8)
para('OPORTUNIZA REDE: PLANO DE NEGÓCIOS', bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
blank(3)
p = para('Plano de negócios apresentado à disciplina de Inovação e empreendedorismo do Curso de Sistemas de Informação da Antonio Meneghetti Faculdade, como requisito parcial para aprovação na disciplina.',
         align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, spacing=1.0)
p.paragraph_format.left_indent = Cm(8)
blank(9)
para(CIDADE, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)
para(ANO, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, indent=False)

# ---------- RESUMO e ABSTRACT ----------
RESUMO = ('Este trabalho apresenta o plano de negócios da Oportuniza Rede, plataforma web que funciona como central de carreiras e estágios das instituições de ensino superior, com a marca de cada faculdade, conectada a uma rede nacional de empresas. '
          'A solução atende três públicos: a faculdade, que adota a plataforma e acompanha termos de estágio, relatórios e indicadores de empregabilidade; a empresa, que publica vagas para várias faculdades e paga R$ 40 por estagiário ativo por mês; e o aluno, que usa a plataforma de graça e vê apenas vagas compatíveis com o curso, o semestre e o horário de aula. '
          'O plano analisa o mercado, estimado em cerca de R$ 445 milhões por ano com base em dados públicos, como o Censo da Educação Superior 2025, que registrou 10,6 milhões de matrículas, e descreve o modelo de negócio, a operação, as projeções financeiras, os riscos e um piloto em 3 faculdades do Rio Grande do Sul em 2027. '
          'As projeções indicam equilíbrio com cerca de 30 faculdades ativas no fim de 2029, com investimento de R$ 600 mil captado em duas etapas. Os números são hipóteses a validar no piloto.')
ABSTRACT = ('This paper presents the business plan of Oportuniza Rede, a web platform that works as the career and internship center of higher education institutions, branded for each college and connected to a national network of companies. '
            'The solution serves three audiences: the college, which adopts the platform and tracks internship agreements, reports and employability indicators; the company, which posts openings to several colleges and pays R$ 40 per active intern per month; and the student, who uses the platform for free and sees only openings compatible with their program, semester and class schedule. '
            'The plan analyzes the market, estimated at about R$ 445 million per year based on public data such as the 2025 Higher Education Census, which recorded 10.6 million enrollments, and describes the business model, operations, financial projections, risks and a pilot in 3 colleges in Rio Grande do Sul in 2027. '
            'The projections point to break-even with about 30 active colleges by the end of 2029, with an investment of R$ 600 thousand raised in two stages. The figures are hypotheses to be validated in the pilot.')
for titulo, texto, kw_label, kw in (('RESUMO', RESUMO, 'Palavras-chave: ', 'estágio; empregabilidade; ensino superior; plano de negócios; plataforma digital.'),
                                     ('ABSTRACT', ABSTRACT, 'Keywords: ', 'internship; employability; higher education; business plan; digital platform.')):
    heading(titulo, centered=True)
    para(texto, indent=False)
    blank()
    p = para('', indent=False); add_runs(p, [(kw_label, True), (kw, False)])

# ---------- LISTAS e SUMÁRIO (números de página vindos da 1ª passada) ----------
def toc_line(left_runs, page, indent_cm=0):
    p = doc.add_paragraph()
    f = p.paragraph_format; f.line_spacing = 1.5; f.alignment = WD_ALIGN_PARAGRAPH.LEFT
    f.left_indent = Cm(indent_cm); f.first_line_indent = Cm(-indent_cm) if indent_cm else Cm(0)
    f.tab_stops.add_tab_stop(Cm(TEXTW), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    for text, bold in left_runs:
        r = p.add_run(text); set_font(r, 12, bold)
    r = p.add_run('\t' + str(page)); set_font(r, 12, False)

heading('LISTA DE ILUSTRAÇÕES', centered=True)
PLAN_CAPS = [('Quadro', i + 1, CAP[k][1]) for i, k in enumerate([k for k in CAP if CAP[k][0] == 'Quadro'])] + [('Figura', 1, 'Roadmap de 2027 a 2029')]
for kind, n, title in PLAN_CAPS:
    toc_line([(f'{kind} {n} – {title}', False)], PAGES.get(f'{kind} {n}', '00'), indent_cm=0)
heading('LISTA DE TABELAS', centered=True)
for i, k in enumerate([k for k in CAP if CAP[k][0] == 'Tabela']):
    toc_line([(f'Tabela {i + 1} – {CAP[k][1]}', False)], PAGES.get(f'Tabela {i + 1}', '00'))

SECOES = []  # preenchido abaixo, na mesma ordem do texto
for p in src.paragraphs:
    if p.style.name == 'Heading 2' and re.match(r'\d+\.', p.text.strip()):
        SECOES.append(re.sub(r'^\d+\.\s*', '', p.text.strip()))
SECOES = ['Introdução'] + SECOES + ['Considerações finais']
heading('SUMÁRIO', centered=True)
for i, s in enumerate(SECOES, 1):
    toc_line([(f'{i} {s.upper()}', True)], PAGES.get(f'S{i}', '00'))
toc_line([('REFERÊNCIAS', True)], PAGES.get('REF', '00'))

# ---------- PARTE TEXTUAL (seção 3: número visível no canto superior direito) ----------
s3 = new_section(start_at=PAGES.get('S1'))
hp = s3.header.paragraphs[0]; hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r = hp.add_run(); set_font(r, 10); field(r, 'PAGE')
first_text_heading = True

def sec_heading(num, title):
    global first_text_heading
    LAST['p'] = None
    CUR['sec'] = num
    p = heading(f'{num} {title.upper()}')
    if first_text_heading:  # a seção nova já começa em página nova
        p.paragraph_format.page_break_before = False; first_text_heading = False

sec_heading(1, 'Introdução')
for t in ('Este plano de negócios apresenta a Oportuniza Rede, plataforma de carreiras e estágios para instituições de ensino superior, conectada a uma rede nacional de empresas. O trabalho foi desenvolvido na disciplina de Inovação e empreendedorismo do Curso de Sistemas de Informação da Antonio Meneghetti Faculdade.',
          'O objetivo é demonstrar a viabilidade do negócio: o problema que ele resolve, o mercado, o modelo de receita, a operação, as projeções financeiras, os riscos e o piloto previsto para 2027. Os dados de mercado vêm de fontes secundárias públicas, consultadas em novembro de 2026, e os números financeiros são projeções a validar no piloto.',
          'Após esta introdução, o documento apresenta o sumário executivo, a empresa, o produto e os serviços, a análise de mercado, o plano de marketing e vendas, o plano operacional, o plano financeiro, os cenários e riscos, o piloto e o roadmap e, por fim, as considerações finais.'):
    para(t)

secnum = 1
body = list(src.element.body.iterchildren())
tbl_i = -1
skip_until_end = False
items = []  # alíneas pendentes

def flush_items():
    global items
    letters = 'abcdefghijklmnopqrstuvwxyz'
    for k, runs in enumerate(items):
        txt0 = runs[0][0]
        if txt0 and not (len(txt0) > 1 and txt0[1].isupper()):
            runs[0] = (txt0[0].lower() + txt0[1:], runs[0][1])
        last = runs[-1][0].rstrip()
        end = '.' if k == len(items) - 1 else ';'
        runs[-1] = ((last[:-1] if last.endswith(('.', ';')) else last) + end, runs[-1][1])
        p = para('', indent=False); p.paragraph_format.left_indent = Cm(1.9); p.paragraph_format.first_line_indent = Cm(-0.65)
        add_runs(p, [(f'{letters[k]}) ', False)] + runs)
        LAST['p'] = None
    items = []

for el in body:
    tag = el.tag.split('}')[1]
    if tag == 'tbl':
        flush_items(); tbl_i += 1
        kind, title, call, fonte = CAP[tbl_i]
        caption_block(kind, title, call, fonte)
        copy_table(docx.table.Table(el, src), kind)
        fonte_line(fonte)
        continue
    if tag != 'p': continue
    p = docx.text.paragraph.Paragraph(el, src)
    text = p.text.strip()
    style = p.style.name
    if style == 'Heading 1' or text.startswith('Douglas, Jéssica'): continue
    if style == 'Heading 2':
        flush_items()
        if text == 'Fontes': skip_until_end = True; continue
        secnum += 1; sec_heading(secnum, re.sub(r'^\d+\.\s*', '', text)); continue
    if skip_until_end: continue
    if el.findall('.//' + qn('w:drawing')):
        flush_items()
        caption_block('Figura', 'Roadmap de 2027 a 2029', 'A Figura {n} apresenta o roadmap de 2027 a 2029, com as metas que liberam cada fase.', '')
        ip = doc.add_paragraph(); ip.alignment = WD_ALIGN_PARAGRAPH.CENTER; ip.paragraph_format.first_line_indent = Cm(0)
        ip.paragraph_format.line_spacing = 1.0; ip.paragraph_format.keep_with_next = True
        ip.add_run().add_picture(sys.argv[4] if len(sys.argv) > 4 else 'src/word/media/image1.png', width=Cm(16))
        fonte_line('Elaborado pelos autores (2026).')
        continue
    if not text: continue
    if any(text.startswith(l) for l in LABELS): continue
    runs = [(fix_text(r.text), bool(r.bold)) for r in p.runs if r.text]
    # hiperlinks (texto fora de runs comuns)
    if not runs or ''.join(t for t, _ in runs).strip() != fix_text(text):
        runs = [(fix_text(text), False)]
    if style == 'List Paragraph':
        items.append(runs); continue
    flush_items()
    q = para(''); add_runs(q, runs); LAST['p'] = q
flush_items()

secnum += 1
sec_heading(secnum, 'Considerações finais')
for t in ('A Oportuniza Rede se apoia em uma obrigação que já existe: toda faculdade participa do estágio de seus alunos, conforme a Lei nº 11.788/2008 (Brasil, 2008). A proposta transforma essa obrigação em um serviço digital que reduz o trabalho da coordenação, protege a empresa de estágios irregulares e amplia as oportunidades do aluno.',
          'As projeções indicam equilíbrio com cerca de 30 faculdades ativas no fim de 2029, com investimento de R$ 600 mil captado em duas etapas. As hipóteses que ainda precisam ser provadas são a disposição das faculdades pequenas e médias de pagar pelo plano Gestão e a adesão das empresas à rede. O piloto de 2027, em 3 faculdades do Rio Grande do Sul, foi desenhado para testá-las antes da segunda captação.'):
    para(t)

# ---------- REFERÊNCIAS (NBR 6023:2018) ----------
heading('REFERÊNCIAS', centered=True)
REFS = [
    [('ALMEIDA, Daniella. Brasil atinge recorde de 10,6 milhões de matrículas no ensino superior. ', False), ('Agência Brasil', True), (', Brasília, DF, 26 nov. 2026. Disponível em: https://agenciabrasil.ebc.com.br/educacao/noticia/2026-11/brasil-atinge-recorde-de-106-milhoes-de-matriculas-no-ensino-superior. ' + ACESSO, False)],
    [('BRASIL. ', False), ('Lei nº 11.788, de 25 de setembro de 2008', True), ('. Dispõe sobre o estágio de estudantes. Brasília, DF: Presidência da República, 2008. Texto atualizado disponível em: https://www2.camara.leg.br/legin/fed/lei/2008/lei-11788-25-setembro-2008-581200-normaatualizada-pl.html. ' + ACESSO, False)],
    [('BRASIL. ', False), ('Lei nº 13.709, de 14 de agosto de 2018', True), ('. Lei Geral de Proteção de Dados Pessoais (LGPD). Brasília, DF: Presidência da República, 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. ' + ACESSO, False)],
    [('BRAZILIAN fintech Pravaler buys edtech Workalove and increases solutions for education. ', False), ('LatamFintech', True), (', [S. l.], 3 jun. 2025. Disponível em: https://www.latamfintech.co/articles/brazilian-fintech-pravaler-buys-edtech-workalove-and-increases-solutions-for-education. ' + ACESSO, False)],
    [('CENTRO DE INTEGRAÇÃO EMPRESA-ESCOLA DO PARANÁ (CIEE/PR). ', False), ('Perguntas e respostas', True), (': unidades concedentes. Curitiba: CIEE/PR, [2026]. Disponível em: https://autoweb.cieepr.org.br/AutoWeb/frmPERGUNTARESPOSTA.ASPX?tipo=UC. ' + ACESSO, False)],
    [('CONSELHO FEDERAL DE ENFERMAGEM (COFEN). ', False), ('Termo de julgamento', True), (': Pregão Eletrônico nº 90.001/2026. Brasília, DF: Cofen, 2026. Disponível em: https://www.portalcofen.gov.br/wp-content/uploads/2026/03/Termo-de-Julgamento-Pregao-Eletronico-no-90.001-2026.pdf. ' + ACESSO, False)],
    [('ENSINO superior: mega mantenedoras concentram 47,1% das matrículas de graduação. ', False), ('PEBSP', True), (', [S. l.], 28 abr. 2026. Disponível em: https://www.pebsp.com/?p=47100. ' + ACESSO, False)],
    [('ESTÁGIO define faculdade para 75% dos estudantes, mostra pesquisa. ', False), ('Educa Mais Brasil', True), (', [S. l.], 2025. Disponível em: https://www.educamaisbrasil.com.br/educacao/noticias/estagio-define-faculdade-para-75-dos-estudantes-mostra-pesquisa. ' + ACESSO, False)],
    [('FUNDAÇÃO DE AMPARO À PESQUISA DO ESTADO DO RIO GRANDE DO SUL (FAPERGS). ', False), ('Programa Centelha RS', True), (': edital da 2ª edição. Porto Alegre: FAPERGS, 2021. Disponível em: https://programacentelha.com.br/wp-content/uploads/2021/09/RS-Edital-Centelha-2-1.pdf. ' + ACESSO, False)],
    [('FUNDAÇÃO DE AMPARO À PESQUISA DO ESTADO DO RIO GRANDE DO SUL (FAPERGS). ', False), ('Edital FAPERGS 07/2025', True), (': Programa Centelha 3 RS. Porto Alegre: FAPERGS, 2025. Disponível em: https://programacentelha.com.br/wp-content/uploads/2025/10/Edital-Centelha-3-RS-31-10-2025.pdf. ' + ACESSO, False)],
    [('INSTITUTO NACIONAL DE ESTUDOS E PESQUISAS EDUCACIONAIS ANÍSIO TEIXEIRA (INEP). ', False), ('Brasil tem recorde de estudantes na graduação', True), ('. Brasília, DF: Inep, 26 nov. 2026. Disponível em: https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/censo-da-educacao-superior/brasil-tem-recorde-de-estudantes-na-graduacao. ' + ACESSO, False)],
    [('O SINAES e os parâmetros avaliativos do relacionamento com egressos. ', False), ('Sempre UFMG', True), (', Belo Horizonte, [20--]. Disponível em: https://www.ufmg.br/copi/sempreufmg/o-sinaes-e-os-parametros-avaliativos-do-relacionamento-com-egressos/. ' + ACESSO, False)],
    [('OPORTUNIZA REDE. ', False), ('inov-MPV-G2', True), (': MVP da plataforma Oportuniza Rede. [S. l.]: GitHub, 2026. Disponível em: https://github.com/Julio-Beck/inov-MPV-G2. ' + ACESSO, False)],
    [('PEÇANHA, Laryssa. Nube: plataforma de vagas para estágio. Saiba como funciona. ', False), ('B2B Stack', True), (', [S. l.], 11 jan. 2018. Disponível em: https://www.b2bstack.com.br/product/nube. ' + ACESSO, False)],
    [('QUANTO ganha um estagiário? ', False), ('IstoÉ Dinheiro', True), (', São Paulo, 4 maio 2025. Disponível em: https://istoedinheiro.com.br/quanto-ganha-um-estagiario. ' + ACESSO, False)],
    [('RETENÇÃO de estagiários nas empresas [título atribuído]. ', False), ('Economic News Brasil', True), (', [S. l.], 9 fev. 2026. Disponível em: https://economicnewsbrasil.com.br/2026/02/09/retencao-de-estagiarios-empresas/. ' + ACESSO, False)],
    [('SANTA CATARINA. ', False), ('Contrato nº 01/2026', True), (': Centro de Integração Empresa-Escola (CIEE). Florianópolis, 2026. Disponível em: https://simaecao.sc.gov.br/pdfs/cont_012026_ciee_assinado.pdf. ' + ACESSO, False)],
    [('SUPER Estágios atinge R$ 164 milhões e prevê 100 unidades até 2025. ', False), ('Mercado&Consumo', True), (', São Paulo, 10 jan. 2025. Disponível em: https://mercadoeconsumo.com.br/10/01/2025/gestao/super-estagios-atinge-r-164-milhoes-e-preve-100-unidades-ate-2025. ' + ACESSO, False)],
    [('TRIBUNAL REGIONAL ELEITORAL DE RONDÔNIA (TRE-RO). ', False), ('Termo aditivo nº 2', True), (': contrato decorrente do Pregão Eletrônico nº 90002/2024 (agente de integração de estágio). Porto Velho: TRE-RO, 2025. Disponível em: https://www.tre-ro.jus.br/transparencia-e-prestacao-de-contas/licitacoes-e-contratos/integra-dos-termos-aditivos/arquivos-1/tre-ro-t-a-02-pe90002-2024-ct16-20224-public-dje-pncp. ' + ACESSO, False)],
    [('VARGAS, Mônica. ', False), ('Cenário da juventude', True), ('. Apresentação em audiência pública da Comissão de Educação da Câmara dos Deputados. Brasília, DF, 20 jun. 2024. Disponível em: https://www2.camara.leg.br/atividade-legislativa/comissoes/comissoes-permanentes/ce/arquivos/eventos-2024/20-06-2024-apresentacao-monica-vargas-14h. ' + ACESSO, False)],
]
for runs in REFS:
    p = para('', align=WD_ALIGN_PARAGRAPH.LEFT, indent=False, spacing=1.0, after=12); add_runs(p, runs)

doc.save(OUT)
missing = [k for k, v in used.items() if v == 0]
print('citações inseridas:', {k[:30]: v for k, v in used.items()}, '| faltando:', missing)
print('quadros/tabelas/figuras:', counters)
