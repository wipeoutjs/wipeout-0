
var wpfko = wpfko || {};
wpfko.util = wpfko.util || {};

(function () { 
        
    var outerHTML = function(element) {
        if(!element) return null;
        
        var div = document.createElement("div");
        div.innerHTML = element.outerHTML;
        
        return div.innerHTML;        
    };  
        
    var createElement = function(htmlString) {
        if(!htmlString) return null;
        var div = document.createElement("div");
        div.innerHTML = htmlString;
        var element = div.firstChild;
        div.removeChild(element);
        return element;        
    }; 
        
    var createElements = function(htmlString) {
        if(!htmlString) return null;
        // add divs so that text element won't be trimmed
        htmlString = "<div></div>" + htmlString + "<div></div>";
        
        var div = document.createElement("div");
        div.innerHTML = htmlString;
        
        var output = [];
        while(div.firstChild) {
            output.push(div.firstChild);
            div.removeChild(div.firstChild);
        }
        
        // remove added divs
        output.splice(0, 1);
        output.splice(output.length - 1, 1);
        
        return output;
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
                    elements[i].parentNode.removeChild(elements[i]);
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
        outerHTML: outerHTML,
        createElement: createElement,
        createElements: createElements,
        createWpfkoComment: createWpfkoComment
    };
    
})();