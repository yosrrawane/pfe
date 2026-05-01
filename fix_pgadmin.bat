@echo off
echo Fermeture de pgAdmin...
taskkill /F /IM pgadmin4.exe /T >nul 2>&1

echo Renommage de pgadmin4.db...
ren "C:\Users\Yosr\AppData\Roaming\pgAdmin\pgadmin4.db" "pgadmin4.db.corrupted" >nul 2>&1
ren "C:\Users\Yosr\AppData\Roaming\pgAdmin\pgadmin4.db.prev.bak" "pgadmin4.db.prev.bak.corrupted" >nul 2>&1

echo Fini !
