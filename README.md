# Oportuniza Rede — MVP

A central de carreiras e estágios das faculdades, conectada a uma rede nacional de empresas.
A **faculdade** adota (portal com a sua marca, termos de estágio digitais e indicadores de empregabilidade), a **empresa** paga por estagiário ativo e o **aluno** usa de graça.

É uma demonstração interativa: faculdades, empresas e pessoas são fictícias, assinaturas são simuladas e os dados ficam salvos só no navegador.

## Como rodar no seu computador

Você só precisa do **Node.js**. O projeto não tem outras dependências e não precisa de `npm install`.

### 1. Instale o Node.js (uma vez só)

Baixe a versão **LTS** em <https://nodejs.org> e instale com as opções padrão.
Para conferir, abra o terminal (no Windows: tecla Windows → digite `cmd` → Enter) e rode:

```bash
node --version
```

Deve aparecer algo como `v22.x.x` (qualquer versão 18 ou mais nova serve).

### 2. Baixe o projeto

Escolha uma das opções:

- **Sem Git:** no GitHub, clique em **Code → Download ZIP** e extraia a pasta.
- **Com Git:**

```bash
git clone https://github.com/Julio-Beck/inov-MPV-G2.git
```

### 3. Inicie

- **Windows (mais fácil):** dê dois cliques em `iniciar.bat`. O navegador abre sozinho em <http://localhost:4173>.
  Se o Windows perguntar sobre o firewall, pode permitir em "redes privadas".
- **Qualquer sistema (terminal):** dentro da pasta do projeto, rode:

```bash
npm start
```

Depois abra <http://localhost:4173>. Para parar o servidor, use `Ctrl + C` (ou feche a janela).

> Abrir o `dist/index.html` direto com dois cliques **não funciona**: o navegador bloqueia os módulos JavaScript fora de um servidor. Use sempre o `iniciar.bat` ou o `npm start`.

Se a porta 4173 já estiver ocupada, escolha outra (exemplo no Windows: `set PORT=4174 && npm start`).

## Roteiro de demonstração (3 minutos)

1. **Faculdade:** abre no painel da Vale Verde. Veja as pendências e assine o termo que está esperando; cobre o relatório atrasado; exporte o relatório de empregabilidade (CSV).
2. **Empresa:** publique um estágio para toda a rede. Tente 40 horas: a Lei do Estágio não deixa.
3. **Aluno (Lucas, Sistemas de Informação, 3º semestre, aula à noite):** só aparecem vagas compatíveis com curso, semestre e horário. Candidate-se à vaga nova.
4. **Empresa:** em Candidatos, avance o Lucas até “Contratar e gerar termo”.
5. **Aluno:** em Meu estágio, assine o termo.
6. **Faculdade:** assine nas pendências. “Estagiando agora” sobe e a fatura da empresa aumenta R$ 40.

A rede de exemplo tem 6 faculdades em 6 estados, 14 empresas, 32 vagas e 435 alunos. Troque a faculdade no topo para ver outro portal (Serra Azul e Cerrado Vivo estão no plano gratuito); no perfil Empresa, troque a empresa para ver outro painel. Em *Roteiro e ajuda* dá para restaurar os dados de exemplo.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `dist/index.html` | Página única do app |
| `dist/app.js` | Telas, navegação, formulários e diálogos |
| `dist/styles.css` | Visual responsivo (celular e desktop) |
| `dist/domain.mjs` | Regras de negócio e dados de exemplo |
| `server.mjs` | Servidor local mínimo (porta 4173) |
| `tests/domain.test.mjs` | Testes das regras (`npm test`) |
| `specs/001-oportuniza-rede/` | Especificação, plano e tarefas originais |

## Testes

```bash
npm test
```

## Observação sobre a recuperação

A primeira versão foi recuperada de um backup incompleto e reconstruída a partir de `specs/001-oportuniza-rede/`.
A versão atual (v2) reflete o novo modelo de negócio: rede nacional de faculdades, termo de estágio tripartite, relatórios semestrais, indicadores para a faculdade e cobrança por estagiário ativo.
Os documentos de entrega ficam em `docs/entrega/`: Plano de Negócios (PDF e Word), Business Model Canvas e apresentação do pitch (PDF). A versão anterior do visual do MVP está na branch `design-antigo`.
