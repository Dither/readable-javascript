// ==UserScript==
// @include *.js*
// ==/UserScript==

function s2b(s) { return s === 'true' ? true : false; }

function trim_comments(str)
{
   var lines = str.split('\n'), tmp = '';
   for (var i = 0; i < lines.length; i++) tmp += lines[i].replace(/([^\x2f]*)\x2f\x2f.*$/, '$1');
   lines = tmp.split('*/');
   tmp = '';
   for (var i = 0; i < lines.length; i++) tmp += lines[i].replace(/(.*)\x2f\x2a(.*)$/g, '$1 ');
   tmp = tmp.replace(/^\s+/g, '');
   return tmp;
}

String.prototype.escapeHTMLforJS = function () {                                        
  return(                                                                 
    this.replace(/>/g,'&gt;').
         replace(/</g,'&lt;')
  );
};
  
function unpacker_filter(source)
{
  var stripped_source = trim_comments(source);
  var unpacked = '';
 
  if (P_A_C_K_E_R.detect(stripped_source)) {
      unpacked = P_A_C_K_E_R.unpack(stripped_source);
      if (unpacked !== stripped_source) {
          return unpacker_filter(unpacked);
      }
  }

  if (EscapedBookmarklet.detect(source)) {
      unpacked = EscapedBookmarklet.unpack(source);
      if (unpacked !== stripped_source) {
          return unpacker_filter(unpacked);
      }
  }

  if (JavascriptObfuscator.detect(stripped_source)) {
      unpacked = JavascriptObfuscator.unpack(stripped_source);
      if (unpacked !== stripped_source) {
          return unpacker_filter(unpacked);
      }
  }
  
  if (MyObfuscate.detect(stripped_source)) {
  unpacked = MyObfuscate.unpack(stripped_source);
      if (unpacked !== stripped_source) {
          return unpacker_filter(unpacked);
      }
  }
  return source;
}
