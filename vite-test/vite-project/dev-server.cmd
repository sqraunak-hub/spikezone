@echo off
REM Node was installed after this shell session started, so its PATH entry is
REM not inherited. Prepend it explicitly before handing off to Vite.
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
call npm run dev -- --port 5175 --strictPort
