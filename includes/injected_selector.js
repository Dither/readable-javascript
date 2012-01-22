(function () {
    // Opera specific
    function selText(w) { var t; return w ? w.document.getSelection() || (t = w.opera.lastClick && w.opera.lastClick.textArea) && t.value.substring(t.selectionStart, t.selectionEnd) : '' };
    
    var background;
    opera.extension.onmessage = function( event ){
    	if(event.data == 'send_bg_port' ){
    		background = event.source; // in case of need to send anything to background
    		var channel = new MessageChannel();
    		event.ports[0].postMessage('send_tab_port', [channel.port2] );
    		channel.port1.onmessage = onPopupMessageHandler;
    	}
    }
    
    function onPopupMessageHandler(event){
       switch (event.data) {
        case 'get-selection':
            var seltext = selText(window);
            if (seltext) {
            	event.source.postMessage({type:'give-selection', text: seltext});
            }
            //else if (~window.location.href.indexOf('javascript:')) {
            //    event.source.postMessage({type:'give-selection', text: window.location.href});
            //}
            break;
        default:
        }
    }
}());