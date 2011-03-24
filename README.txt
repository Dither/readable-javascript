Readable JavaScript for Opera
=============

Extension for auto-formatting of JavaScript code. 

Extension for auto-formatting of JavaScript code. It is triggered by clicking
yellow popup on top of page if file has .js extension in its URL. Also you can
call simple formatter using toolbar button.

From the preferences page it is possible to:
 - disable confirmation popup and auto-format all javascripts;
 - toggle JavaScript formatter button in toolbar (effective after Opera restart);
 - set carry over opening braces to their own lines;
 - set preservation of empty lines in code;
 - toggle packer detection (supported packers: P_A_C_K_E_R, escaped bookmarklets, javascriptobfuscator.com);
 - set method for array indentation;
 - set number of indentation spaces or indentation using Tab character;
 - toggle syntax highlighting;
 - toggle debug output for showing parsing progress status in the console.

This extension supports optional syntax highlighting based on Google's PrettyPrint
parser but it is very slow and sometimes hurts my eyes with strange guessing
so personally I don't recommend to enable it.

There is known speedwise incompatibility with scripts that actively and regardlessly
meddle with DOM processing. It can result impairment of highlighting performance to a great extent.

Based on the folowing projects:
JS PrettyPrint // Copyright (C) 2006 Google Inc.
JS-Beautify // Copyanywhere (?) Einar Lielmanis, <einar@jsbeautifier.org>

 
