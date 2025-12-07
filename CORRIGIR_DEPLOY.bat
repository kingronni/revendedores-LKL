@echo off
echo ===================================================
echo   CORRECAO DE DEPLOY - FORCAR ENVIO
echo ===================================================
echo.
echo Tentando corrigir erro de push...
echo.

cd /d "%~dp0"

:: Garante que o git esta iniciado
if not exist .git (
    git init
)

:: Adiciona tudo
git add .
git commit -m "Force Deploy Fix"

:: Configura remote do zero
git branch -M main
git remote remove origin 2>NUL
git remote add origin https://github.com/kingronni/revendedores-LKL.git

echo.
echo ===================================================
echo TENTANDO FORCAR O ENVIO (FORCE PUSH)...
echo ===================================================
echo Se pedir senha, use seu TOKEN.
echo.

git push -u origin main --force

echo.
echo ===================================================
echo   SE APARECEU "SUCCESS" OU URLs ACIMA, DEU CERTO!
echo ===================================================
echo.
pause
