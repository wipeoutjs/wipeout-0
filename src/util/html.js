
var wpfko = wpfko || {};
wpfko.util = wpfko.util || {};

(function () {
        
    var createElement = function(htmlString) {
        if(!htmlString) return null;
        var div = document.createElement("div");
        div.innerHTML = htmlString;
        var element = div.firstChild;
        div.removeChild(element);
        return element;        
    };  
    
    var createWpfkoComment = function() {
        
        var open = document.createComment(" ko ");   
        var close = document.createComment(" /ko ");
        
        open.__wpfko = {
            open: open,
            close: close,
            "delete": function() {
                var elements = open.__wpfko.allElements();
                for(var i = 0, ii = elements.length; i < ii; i++) {
                    elements[i].parentElement.removeChild(elements[i]);
                }
            },
            allElements: function() {
                var output = [];
                var current = open;
                while(true) {
                    output.push(current);
                    if(current === close)
                        break;
                    
                    current = current.nextSibling;
                }
                
                return output;
            },
            insertAfter: function(element) {
                return close.nextSibling ? close.parentNode.insertBefore(element, close.nextSibling) : close.parentNode.appendChild(element);
            }
        };
        
        return open.__wpfko;
        
    };
    
    wpfko.util.html = {
        createElement: createElement,
        createWpfkoComment: createWpfkoComment
    };
    
})();