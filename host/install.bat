:: Copyright 2014 The Chromium Authors. All rights reserved.
:: Use of this source code is governed by a BSD-style license that can be
:: found in the LICENSE file.

:: Change HKCU to HKLM if you want to install globally.
:: %~dp0 is the directory containing this bat script and ends with a backslash.
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\br.com.orquidariobahia.companion" /ve /t REG_SZ /d "%~dp0manifest.json" /f
REG ADD "HKLM\Software\Google\Chrome\NativeMessagingHosts\br.com.orquidariobahia.companion" /ve /t REG_SZ /d "%~dp0manifest.json" /f
REG ADD "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "QZ Tray" /d "java -Xms1024m -Xmx1024m -jar \"%PROGRAMFILES%\QZ Tray\qz-tray.jar\"" /f
REG ADD "HKLM\Software\Microsoft\Windows\CurrentVersion\Run" /v "QZ Tray" /d "java -Xms1024m -Xmx1024m -jar \"%PROGRAMFILES%\QZ Tray\qz-tray.jar\"" /f
