@echo off
echo ===================================================
echo   DEPLOY AUTOMATICO - PAINEL REVENDEDOR LKL
echo ===================================================
echo.
echo Preparando arquivos...

cd /d "%~dp0"

if not exist .git (
    git init
)

git add .
git commit -m "Update Automatico Painel Revendedor"

echo.
echo Configurando repositorio remoto (revendedores-LKL)...
git branch -M main
git remote remove origin 2>NUL
git remote add origin https://github.com/kingronni/revendedores-LKL.git

echo.
echo ===================================================
echo ATENCAO: O GIT VAI PEDIR SUAS CREDENCIAIS AGORA
echo ===================================================
echo 1. Se abrir uma janela popup, faca login nela.
echo 2. Se pedir 'Username' e 'Password' aqui no terminal:
echo    - Username: Seu usuario do GitHub
echo    - Password: Seu TOKEN de acesso (ou senha)
echo ===================================================
echo.
echo Enviando para o GitHub...
git push -u origin main --force

echo.
echo ===================================================
echo   PROCESSO FINALIZADO
echo ===================================================
echo Verifique acima se apareceu "Success" ou "100%".
echo Se deu tudo certo, a Vercel vai atualizar o site em 1 minuto.
echo.
pause
