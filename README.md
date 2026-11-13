# Oportuniza Rede — MVP

Rede de carreiras que conecta **estudantes**, **empresas** e **instituições de ensino**.
É uma demonstração interativa: todas as pessoas, empresas e vagas são fictícias, e os dados ficam salvos só no navegador de quem está usando.

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

## Roteiro de teste (5 minutos)

1. **Aluno:** busque "design", abra *Estágio em UI/UX Design*, salve e candidate-se. Tente se candidatar de novo: não deixa.
2. **Empresa:** em *Minhas vagas → Publicar vaga*, crie um estágio só para a Vale do Recanto. Tente 40 horas ou deixe sem supervisor: o formulário recusa.
3. **Aluno:** encontre a nova vaga e candidate-se. Troque a instituição no topo para *Horizonte*: a vaga não aparece lá.
4. **Instituição:** em *Talentos*, indique um estudante para a vaga. Em *Portal*, mude o nome e a cor.
5. **Empresa:** em *Candidatos*, a indicação aparece no cartão. Avance até *Contratado*.
6. **Instituição:** em *Estágios*, acompanhe o termo e o relatório (simulados).
7. Recarregue a página: tudo continua salvo. Em *Ajuda*, dá para restaurar os dados de exemplo.

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

O MVP original foi recuperado de um backup em que faltavam `dist/app.js`, `dist/styles.css` e `tests/domain.test.mjs`.
Esses três arquivos foram reconstruídos a partir da especificação em `specs/001-oportuniza-rede/`. O `dist/domain.mjs` original foi mantido e ganhou as operações que a especificação pedia (salvar vagas, encerrar/reabrir, editar perfil, personalizar o portal e acompanhar estágios).
