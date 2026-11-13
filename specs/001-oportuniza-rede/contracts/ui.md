# UI and state contract
Routes: #/aluno/vagas, #/aluno/salvas, #/aluno/candidaturas, #/aluno/perfil;
#/empresa/painel, #/empresa/vagas, #/empresa/candidatos;
#/instituicao/painel, #/instituicao/talentos, #/instituicao/estagios, #/instituicao/portal; #/ajuda.
Detail route: #/aluno/vaga/{id}. Unknown routes redirect to the current persona's home.
Persona selection changes navigation; institution selection changes current student and institutional scope.
Every mutation goes through domain functions, persists once, rerenders and announces status.
Only active employer vacancies are editable in the candidate and vacancy panels.
Dialogs: native dialog, labeled title, Escape/close support, focus restoration.
Forms: native required constraints plus domain checks; never interpolate raw input into HTML.
Storage key: oportuniza-rede-v1. Cross-tab storage changes refresh the visible workspace.
