@echo off
chcp 65001 >nul
echo ============================================
echo   DEMARRAGE DU SERVEUR PLANNING
echo ============================================
echo.

REM Vérifier si MySQL est en cours d'exécution
echo [1/3] Vérification de MySQL...
netstat -an | find "3306" >nul
if %errorlevel% equ 0 (
    echo    [OK] MySQL est en cours d'execution
) else (
    echo    [ATTENTION] MySQL ne semble pas être démarré !
    echo    Veuillez démarrer XAMPP MySQL avant de continuer.
    echo.
    pause
    exit /b 1
)

REM Vérifier si PM2 est installé
echo [2/3] Vérification de PM2...
npm list -g pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] PM2 est installé
) else (
    echo    [INFO] PM2 n'est pas installé, installation en cours...
    npm install -g pm2
    if %errorlevel% neq 0 (
        echo    [ERREUR] Erreur lors de l'installation de PM2
        pause
        exit /b 1
    )
    echo    [OK] PM2 installé avec succès
)

REM Démarrer le backend et Expo dans des fenêtres séparées
echo [3/3] Démarrage du backend et d'Expo...

REM Lancer le backend (node server.js) sur PORT=8082
start "Backend" cmd /k "cd /d %~dp0 && set PORT=8082 && node server.js"

REM Lancer Expo (UI) dans un autre terminal
start "Expo" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ============================================
echo   SERVEUR ET UI DEMARRÉS
echo ============================================
echo URL du backend: http://localhost:8082
echo Expo (web) : http://localhost:8083
echo.
echo Astuce: fermez les fenêtres 'Backend' ou 'Expo' pour arrêter les services.
echo.
pause

