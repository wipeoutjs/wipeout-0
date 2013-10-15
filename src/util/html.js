
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
        
    var createElement = function(htmlString) {
        //TODO: this
        if(!htmlString)htmlString = " ";
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