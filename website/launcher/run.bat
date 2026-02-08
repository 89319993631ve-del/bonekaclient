@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist boneka-launcher.jar (
    echo Файл boneka-launcher.jar не найден в этой папке.
    pause
    exit /b 1
)
java -jar boneka-launcher.jar
if errorlevel 1 pause
