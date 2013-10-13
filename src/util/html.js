

(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.util = wpfko.util || {};
    
    var createElement = function(htmlString) {
        var div = document.createElement("div");
        div.innerHTML = htmlString;
        var element = div.firstChild;
        div.removeChild(element);
        return element;        
    };    
    
    wpfko.util.html = {
        createElement: createElement
    };
    
})();