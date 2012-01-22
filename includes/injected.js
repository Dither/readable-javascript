// ==UserScript==
// @include *.js*
// ==/UserScript==

(function () {
    // current versions of Opera doesn't set title unless it's error response
    if (!window.location.href.match(/\.js(?:\?|$)/) || typeof document == undefined || document.getElementsByTagName('TITLE')[0] || !document.body) return;

    var storage = widget.preferences;

    function log() {
        if (s2b(storage['debug_output'])) opera.postError('[Readable JavaScript]: ' + Array.prototype.slice.call(arguments))
    }
    
    ///////////////////////////////////// STYLES AND TRANSLATION /////////////////////////////////////////

    var READABLEJS_STRINGS = (function (locale) {
        var lang = window.navigator.language.slice(0, 2);
        return locale[lang] || locale["en"];
    })({
        ru: {
            hint: "\u0424\u0430\u0439\u043b \u043f\u043e\u0445\u043e\u0436 \u043d\u0430 JavaScript. \u041a\u043b\u0438\u043a\u043d\u0438\u0442\u0435 \u043d\u0430 \u044d\u0442\u043e\u043c \u0432\u0441\u043f\u043b\u044b\u0432\u0430\u044e\u0449\u0435\u043c \u043e\u043a\u043e\u0448\u043a\u0435 \u0434\u043b\u044f \u0435\u0433\u043e \u0444\u043e\u0440\u043c\u0430\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f. \u0410\u0432\u0442\u043e\u0437\u0430\u043a\u0440\u044b\u0442\u0438\u0435 \u0447\u0435\u0440\u0435\u0437 ",
            sec: "\u0441\u0435\u043a.",
        },
        en: {
            hint: 'This file looks like a JavaScript. Click this popup to format it. It will close in ',
            sec: 'sec.',
        }
    });

    var cssinfo = '/** CSS for bar mode */\
#jsb4c-bar {\
  display: none;\
  height: 22px;\
  position: fixed;\
  top: -40px;\
  left: 0px;\
  width: 100%;\
  cursor: pointer;\
  background-image: -o-linear-gradient( top, rgb(250,233,167) 0%, rgb(254,243,197) 100% );\
  border-bottom: 1px solid #8e8e8e;\
  background-color: #FEF3C5;\
  padding-top: 6px;\
  padding-left: 12px;\
  font-family: "Helvetica", "Arial", sans-serif;\
  font-size: 12px;\
  vertical-align: middle;\
  z-index: 21474;\
  \
  -o-transition-property: top;\
  -o-transition-duration: 0.6s;\
}\
#jsb4c-bar.visible {\
  top: 0px;\
  display: block;\
}\
#jsb4c-close {\
  display: inline-block !important;\
  height: 22px !important;\
  width: 44px !important;\
  float: right !important;\
  text-indent: -9999px;\
  margin: -18px 10px 0 0 !important;\
  padding: 0 !important;\
  background-color: transparent;\
  background-repeat: no-repeat;\
  background-position: 50% 50% !important;\
  z-index: 21475;\
}';

    var csshighlight = '/* Used with pretty_js.js */\
.pln { color: #000; }  /* plain text */\
.str { color: blue4; }   /* string content */\
.kwd { color: #069; }  /* a keyword */\
.com { color: #008200; }  /* a comment */\
.typ { color: #606; }  /* a type name */\
.lit { color: #066; }  /* a literal value */\
.pun, .opn, .clo { color: #660; }  /* punctuation, lisp open bracket, lisp close bracket */\
.tag { color: #008; }  /* a markup tag name */\
.atn { color: #606; }  /* a markup attribute name */\
.atv { color: #080; }  /* a markup attribute value */\
.dec, .var{ color: #606; }  /* a declaration; a variable name */\
.fun { color: green }  /* a function name */\
/* Specify class=linenums on a pre to get line numbering */\
li.L0,\
li.L1,\
li.L2,\
li.L3,\
li.L5,\
li.L6,\
li.L7,\
li.L8 { list-style-type: none }\
/* Alternate shading for lines */\
li.L1,\
li.L3,\
li.L5,\
li.L7,\
li.L9 { background: #eee }\
@media print {\
  .str { color: #060; }\
  .kwd { color: #006; font-weight: bold; }\
  .com { color: #600; font-style: italic; }\
  .typ { color: #404; font-weight: bold; }\
  .lit { color: #044; }\
  .pun { color: #440; }\
  .pln { color: #000; }\
  .tag { color: #006; font-weight: bold; }\
  .atn { color: #404; }\
  .atv { color: #060; }\
}';

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    log('extension started...');

    if (s2b(storage['autoparse_js'])) {
        parseJavaScript();
        return;
    }

    var notification = document.createElement('div'),
        close = document.createElement('a'),
        autoHideInterval, secondsTillHide = 12,
        formatConfirmElement;

    var css = document.createElement('style');
    css.type = 'text/css';
    css.appendChild(document.createTextNode(cssinfo));

    (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(css);

    notification.id = 'jsb4c-bar';
    close.id = 'jsb4c-close';

    notification.appendChild(document.createTextNode(READABLEJS_STRINGS.hint));
    var timer = document.createElement('span');
    timer.id = 'jsb4c-timer';
    notification.appendChild(timer);
    notification.appendChild(document.createTextNode(READABLEJS_STRINGS.sec));

    close.style.backgroundImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzBFNjRDRUY0QjZFMTFFMDlBQjJGRTYzRjk5RjJFNDEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzBFNjRDRjA0QjZFMTFFMDlBQjJGRTYzRjk5RjJFNDEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozMEU2NENFRDRCNkUxMUUwOUFCMkZFNjNGOTlGMkU0MSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozMEU2NENFRTRCNkUxMUUwOUFCMkZFNjNGOTlGMkU0MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvBP+boAAACEUExURZ2dnfXmr6yrpLWzrfbptbi2r/7wtvPlsPTmtf7us6uqo/Tntv3usvXnsKGgmv7vtqGgmbWzrPPmsf3vs7m2sKuqpK+sn/fptfTms/fqtqyqpP7vs42Njbe1rvPls/3tr/XnsaGhofXotL27s7Sxorq2p6+vr/Xos7CvqPbnrrCtn6ysrEXyoSsAAABLSURBVHjaDMXFAYAwEACww90d6qW+/36QT+Dy5ZA3/gCPRkF6tMO5cWt5TWBJcQhYPNCaVevMVDDHQcpwF/DCxFjy51RHaaTcJ8AA5rIGa1D6WN8AAAAASUVORK5CYII=)';

    notification.appendChild(close);
    document.body.appendChild(notification);

    close.addEventListener('click', function (event) {
        hideNotification();
        event.preventDefault();
        event.stopPropagation();
    }, false);

    notification.addEventListener('click', function (event) {
        hideNotification();
        event.preventDefault();
        event.stopPropagation();

        parseJavaScript();
    }, false);

    function parseJavaScript() {
        log('formatting options:\n indent_size = ' + Number(storage['indent_size'], 10) + '\n indent_char = "' + storage['indent_char'] + '"' + '\n preserve_newlines = ' + s2b(storage['preserve_newlines']) + '\n brace_style = ' + (s2b(storage['braces_on_own_line']) ? 'expand' : 'collapse') + '\n keep_array_indentation = ' + s2b(storage['keep_array_indentation']));

        var code = document.getElementsByTagName('PRE')[0];
        setTimeout(function () {
            log('formatting JavaScript...');
            code.textContent = js_beautify((s2b(storage['detect_packers']) ? unpacker_filter(code.textContent) : code.textContent), {
                indent_size: parseInt(storage['indent_size'], 10),
                indent_char: storage['indent_char'],
                preserve_newlines: s2b(storage['preserve_newlines']),
                brace_style: s2b(storage['braces_on_own_line']) ? 'expand' : 'collapse', //storage['brace_style'], //"collapse"|"expand"|"end-expand"|"expand-strict"
                keep_array_indentation: s2b(storage['keep_array_indentation']),
                space_before_conditional: true, //storage['space_before_conditional'],
                space_after_anon_function: true,
            });
        }, s2b(storage['autoparse_js']) ? 0 : 300);

        if (s2b(storage['enable_coloring'])) {
            code.textContent = code.textContent.escapeHTMLforJS();

            document.getElementsByTagName('PRE')[0].className = 'prettyprint lang-javascript';
            document.getElementsByTagName('PRE')[0].id = 'javascript'

            var css1 = document.createElement('style');
            css1.type = 'text/css';
            css1.appendChild(document.createTextNode(csshighlight));
            (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(css1);

            setTimeout(function () {
                log('coloring JavaScript...');
                init_pretty_print();
                window.prettyPrint(false);
            }, s2b(storage['autoparse_js']) ? 100 : 400);
        }
    }

    function hideNotification() {
        notification.className = 'hidden';
        setTimeout(function () {
            notification.parentNode.removeChild(notification);
        }, 1000);
    }

    setTimeout(function () {
        notification.className = 'visible';
    }, 350);

    // Autotimer to make infobar go away
    document.querySelector('#jsb4c-timer').innerHTML = secondsTillHide;
    autoHideInterval = setInterval(function () {
        if (secondsTillHide <= 0) {
            hideNotification();
            clearInterval(autoHideInterval);
        } else {
            if (!document.querySelector('#jsb4c-timer')) {
                clearInterval(autoHideInterval);
                return;
            }
            document.querySelector('#jsb4c-timer').innerHTML = secondsTillHide;
            secondsTillHide--;
        }
    }, 1000);
}());