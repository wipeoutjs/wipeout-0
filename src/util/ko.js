

Class("wpfko.util.ko", function () {
    
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
    };
    
    _ko.array = {
        diff: {
            added: "added", 
            deleted: "deleted",
            retained: "retained"
        }
    };
    
    //TODO: this
    _ko.isObservableArray = function(test) {
        return ko.isObservable(test) && test.push && test.push.constructor === Function;
    };
    
    _ko.virtualElements = {
        parentElement: function(element) {
            var current = element.previousSibling;
            while(current) {
                if(_ko.virtualElements.isVirtual(current)) {
                    return current;
                }
                
                current = current.previousSibling;
            }
            
            return element.parentNode;
        },
        isVirtual: function(node) {
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0;
        },
        isVirtualClosing: function(node) {
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+|\s+$/g, '') === "/ko";
        },
        elementWithChildren: function(element) {
            if(!element) return [];
            
            if(!_ko.virtualElements.isVirtual(element)) return [element];
            
            var output = [element];
            var depth = 1;
            var current = element.nextSibling;
            while (depth > 0) {
                output.push(current);
                if(_ko.virtualElements.isVirtualClosing(current))
                    depth--;                
                else if(_ko.virtualElements.isVirtual(current))
                    depth++;
                
                current = current.nextSibling;
            }            
            
            return output;
        }
    };
    
    return _ko;
});