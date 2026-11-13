@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado neste computador.
  echo Instale a versao LTS em https://nodejs.org e execute este arquivo de novo.
  start "" https://nodejs.org
  pause
  exit /b 1
)
echo Iniciando a Oportuniza Rede em http://localhost:4173 ...
echo Para parar, feche esta janela.
start "" http://localhost:4173
node server.mjs
pause
