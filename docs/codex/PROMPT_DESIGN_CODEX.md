# Prompt para o Codex — revisão e melhoria de design

Você vai revisar e melhorar o design do MVP **Oportuniza Rede**, que está neste repositório.

## Antes de começar
1. Leia `docs/codex/RESUMO_PROJETO.md` para entender o produto, os três perfis (faculdade, empresa, aluno) e o roteiro da demo.
2. Leia **inteiro** o documento de design em anexo. Ele é a referência principal: toda mudança deve seguir os princípios dele. Se algo do documento conflitar com este prompt, o documento vence, exceto nas restrições técnicas abaixo.
3. Use as skills de design disponíveis no seu ambiente (UI/UX, acessibilidade, revisão visual, frontend design). Carregue-as antes de analisar e aplique os critérios delas junto com o documento.
4. Rode o app (`npm start`, abre em http://localhost:4173) e navegue por **todas** as telas dos três perfis e pela ajuda, em desktop (1440 px) e celular (390 px). Tire capturas de tela de antes.

## Etapa 1 — Análise e validação (entregue antes de mudar código)
Crie `docs/codex/AUDITORIA_DESIGN.md` com:
- Uma tabela com cada princípio/regra do documento em anexo: **atende / atende em parte / não atende**, a evidência (tela e elemento) e a correção proposta.
- Problemas encontrados pelas skills de design que o documento não cobre (acessibilidade, contraste, hierarquia, espaçamento, estados vazios, carregamento, erro, foco de teclado, toque no celular, consistência de componentes).
- Prioridade de cada item (alta, média, baixa) e o que **não** vale mudar, com o motivo.

## Etapa 2 — Melhorias
Aplique as correções de prioridade alta e média, seguindo o documento:
- Comece pelos tokens em `:root` de `dist/styles.css` (cores, tipografia, espaçamento, raios, sombras) e depois pelos componentes.
- Mantenha a identidade da marca: confiável, institucional e humana, sem cara de template genérico ou "feito por IA". Se o documento pedir mudança de paleta ou fonte, justifique na auditoria.
- A demo é apresentada num pitch: o painel da faculdade, a tela de vagas do aluno no celular e o fluxo de contratação precisam ser os mais caprichados.
- Textos da interface em português do Brasil, curtos e diretos. Pode reescrever textos que o documento indicar, sem mudar regras de negócio.

## Restrições técnicas (não quebrar)
- Sem framework, sem build, sem dependências novas, sem CDN: continua HTML + CSS + JS puro em `dist/`, rodando com `npm start` e com o `iniciar.bat`.
- **Não altere `dist/domain.mjs`** (regras e dados) nem os testes, a menos que seja indispensável; se for, explique.
- Preserve todos os atributos `data-action`, `data-change`, `data-filter`, `data-form`, `data-id`, `data-party`, `data-plan` e `data-student` e os `name` dos campos dos formulários: a navegação e os eventos dependem deles.
- Mantenha a chave do `localStorage` (`oportuniza-rede-v2`) e o comportamento de restaurar dados.
- Responsivo de 360 px a 1440 px, sem rolagem horizontal; contraste mínimo WCAG AA; foco visível; respeitar `prefers-reduced-motion`.

## Verificação no final
1. `npm test` passando (11 testes).
2. Rode o roteiro de demo completo do `README.md` (6 passos) e confirme que tudo funciona igual.
3. Tire capturas de tela de depois, nas mesmas telas e larguras, e salve antes/depois em `docs/codex/capturas/`.
4. Atualize `docs/codex/AUDITORIA_DESIGN.md` com o que foi feito, o que ficou de fora e por quê.
5. Faça commits pequenos e descritivos, um por grupo de mudanças (tokens, layout, componentes, telas, textos).
