# Design do MVP — Oportuniza Rede

Redesign feito com os 13 princípios da palestra "Como tirar essa cara de IA?" (Profª Rafaela Maicá e Prof. Gustavo Florêncio, AMF).
Os valores ficam como variáveis no topo de `dist/styles.css`.

## Identidade: Kiki nos painéis, Bouba no aluno (80/20)

| Área | Identidade | Forma |
|---|---|---|
| Faculdade e empresa (dados, termos, prazos) | Kiki | Cantos retos, divisórias finas, grade densa, transições de 100 ms |
| Aluno (acolhimento, primeira chance) | Bouba | Cards com 24 px de raio, botões em pílula, transições de 300 ms |

A troca é feita pelo atributo `data-area` no `<body>`: os tokens `--radius`, `--radius-ctl`, `--radius-chip`, `--dur` e `--ease` mudam e todos os componentes acompanham.

## Cores 60-30-10

| Papel | Tokens | Uso |
|---|---|---|
| 60% base | `--bg` `#f5f3ee`, `--surface` `#fff`, `--line` | Fundos, cards e divisórias |
| 30% secundária | `--ink` `#17201b`, `--ink-2`, `--muted` | Títulos, navegação ativa, ícones, barras dos gráficos, números |
| 10% destaque | `--accent` (verde `#245847` ou a cor da faculdade) | Só nos pontos de decisão: assinar termo, candidatar-me, contratar, publicar vaga, salvar |
| Significado | `--ok`, `--warn`, `--bad`, `--info` | Status: ativo, aguardando/prazo, atrasado, compatível |

## Tipografia

- Uma família: Inter, salva em `dist/fonts/` (funciona sem internet).
- Escala: texto 16 px, h3 18 px, h2 24 px, h1 até 46 px, número de destaque 48 px.
- Peso 700 nos títulos e 400 no texto; números com `tabular-nums`; `text-wrap: balance` nos títulos e `pretty` nos parágrafos.

## O que mudou, tela a tela

| Tela | Mudança | Princípio |
|---|---|---|
| Topo | Seletor de perfil em grafite; verde só nos botões de ação | Cores 60-30-10 |
| Celular | Navegação por abas embaixo, com ícones, perto do polegar | UX funcional (mobile) |
| Painel da faculdade | Indicadores numa faixa única, com "Estagiando agora" maior e primeiro | Hierarquia |
| Pendências | Linhas com divisória (sem caixa dentro de caixa); ícone vermelho para atraso, âmbar para prazo; contador no título | Proximidade, cores |
| Estágios | Lista única em colunas: quem, quando/relatório, situação e ações; assinaturas só aparecem quando falta alguém | Alinhamento, menos é mais |
| Candidatos | Card compacto: o botão de avançar é a ação principal, a etapa vira um seletor discreto; 5 por coluna com "Mostrar mais"; mais recentes primeiro | Hierarquia, equilíbrio |
| Planos | Gestão (o plano que queremos vender) com borda de destaque e selo "Recomendado"; preço maior que o nome | Repetição (tabela de planos) |
| Vagas do aluno | Topo sem enfeite; à direita, o perfil usado para combinar as vagas; vagas em lista (sem buracos), etiquetas viraram uma linha de texto | Vícios de IA, equilíbrio |
| Detalhe da vaga | Sem etiquetas repetidas; no celular, preço e "Candidatar-me" ficam fixos embaixo | UX funcional |
| Ajuda | "Restaurar dados" em contorno vermelho (ação destrutiva, com confirmação) | Padrões aprendidos |

## Checklist final

- Intenção: cada tela tem uma ação principal clara, a única em verde.
- Organizar: uma família de fonte, título cerca de 3× o texto, nada justificado, margens em todas as bordas.
- Destacar: no máximo 3 blocos disputando atenção por tela; contraste de texto AA.
- Harmonizar: listas, botões, chips e indicadores com o mesmo formato em todas as telas.
- Função: barra inferior no celular, feedback (toast) em toda ação, confirmação antes de apagar dados.
