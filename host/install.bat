REM --add the following to the top of your bat file--


@echo off

:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"

REM --> If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params = %*:"=""
    echo UAC.ShellExecute "cmd.exe", "/c %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------

:: Copyright 2014 The Chromium Authors. All rights reserved.
:: Use of this source code is governed by a BSD-style license that can be
:: found in the LICENSE file.

:: Change HKCU to HKLM if you want to install globally.
:: %~dp0 is the directory containing this bat script and ends with a backslash.
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\br.com.orquidariobahia.companion" /ve /t REG_SZ /d "%~dp0manifest.json" /f
REG ADD "HKLM\Software\Google\Chrome\NativeMessagingHosts\br.com.orquidariobahia.companion" /ve /t REG_SZ /d "%~dp0manifest.json" /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "QZ Tray" /d "java -Xms1024m -Xmx1024m -jar \"%PROGRAMFILES%\QZ Tray\qz-tray.jar\"" /f
REG ADD "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" /v "QZ Tray" /d "java -Xms1024m -Xmx1024m -jar \"%PROGRAMFILES%\QZ Tray\qz-tray.jar\"" /f
