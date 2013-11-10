
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _ko = {};
    
    _ko.version = function() {
        
        if(!ko || !ko.version)
            return null;
        
        var version = ko.version.split(".");
        for(var i = 0, ii = version.length; i < ii; i++)
            version[i] = parseInt(version[i]);
        
        return version;
    };   
    
    _ko.peek = function(input) {
        if(ko.isObservable(input))
            return input.peek();
        else
            return input;
    }
    
    _ko.virtualElements = {
        parentElement: function(element) {
            var current = element.previousSibling;
            while(current) {
                if(current.nodeType === 8 && current.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0) {
                    return current;
                }
                
                current = current.previousSibling;
            }
            
            return element.parentElement;
        }
    };
    
    wpfko.util.ko = _ko;
})();