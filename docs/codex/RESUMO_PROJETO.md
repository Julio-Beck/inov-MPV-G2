# Oportuniza Rede — resumo do projeto

## O que é
A central de carreiras e estágios das faculdades, conectada a uma rede nacional de empresas.
Plataforma B2B2C para o ensino superior brasileiro:

- **Faculdade (cliente que decide):** adota a plataforma com a própria marca (portal white label), assina os termos de estágio digitalmente, acompanha relatórios semestrais e tem indicadores de empregabilidade para o MEC/INEP. Planos: Essencial (gratuito) e Gestão (R$ 1 por aluno/mês, mínimo R$ 1.500).
- **Empresa (quem paga):** publica vagas para toda a rede de faculdades, recebe candidatos compatíveis e paga R$ 40 por estagiário ativo por mês.
- **Aluno (quem usa, de graça):** vê só vagas compatíveis com curso, semestre e horário de aula, candidata-se e assina o termo de estágio pelo celular.

**Problema:** o processo de estágio no Brasil é burocrático (papel, agentes de integração tradicionais como o CIEE), a faculdade não tem dados de empregabilidade dos alunos e o aluno de faculdade pequena, fora dos grandes centros, depende de sorte para conseguir a primeira chance.

**Proposta de valor:** estágio regular dentro da Lei 11.788/2008 (limites de jornada, termo tripartite, relatórios), menos trabalho para a central de carreiras, dados para a avaliação do INEP e acesso a empresas de outras cidades.

**Público-alvo inicial:** faculdades privadas pequenas e médias (interior, região Sul primeiro). Plano: 3 pilotos em 2027, 12 faculdades em 2028, 40 em 2029.

**Tom da marca:** confiável, institucional e humano, sem cara de "startup genérica". Lema: "A primeira chance não pode depender de sorte."

## O MVP (este repositório)
Demonstração interativa usada no pitch. Dados fictícios, assinaturas simuladas, tudo salvo no `localStorage` do navegador.

- **Stack:** HTML + CSS + JavaScript puro (módulos ES), sem framework, sem build e sem dependências. Servidor local mínimo em Node (`npm start` → http://localhost:4173). Testes das regras com `node --test` (`npm test`).
- **Arquivos:**
  - `dist/index.html` — página única
  - `dist/app.js` — telas, navegação, formulários e diálogos (renderização por template string; eventos delegados por `data-action`, `data-change`, `data-filter`, `data-form`, `data-id`, `data-party`, `data-plan`, `data-student`)
  - `dist/styles.css` — visual responsivo (tokens em `:root`: fundo creme `#f6f2e9`, verde `#245847`, lima `#d6eeab`, títulos em serifa e corpo em sans do sistema)
  - `dist/domain.mjs` — regras de negócio e dados de exemplo (não é parte do design)
  - `tests/domain.test.mjs` — 11 testes das regras
- **Perfis e telas (seletor de perfil no topo):**
  - *Faculdade:* Painel (pendências, métricas, indicadores), Estágios (termos e relatórios), Talentos (alunos, exportar CSV), Empresas parceiras, Portal (marca e plano/fatura)
  - *Empresa:* Painel, Vagas (publicar/pausar), Candidatos (funil até "Contratar e gerar termo"), Estagiários; seletor de empresa no topo
  - *Aluno:* Vagas compatíveis, detalhe da vaga, Candidaturas, Meu estágio (assinar termo, enviar relatório), Perfil
  - *Roteiro e ajuda:* passo a passo da demo e botão para restaurar os dados
- **Dados de exemplo:** 6 faculdades em 6 estados, 14 empresas, 32 vagas, 435 alunos.
- **Roteiro de demo (3 min):** faculdade assina pendência e cobra relatório → empresa publica vaga (40 h é bloqueado pela lei) → aluno Lucas se candidata → empresa contrata → aluno e faculdade assinam → "Estagiando agora" sobe e a fatura aumenta R$ 40.

## Materiais de apoio (`docs/`)
BMC, Persona da faculdade, Validação da proposta de valor, Plano de Negócios (PDF/Word) e o deck do pitch (`docs/pitch/`).
