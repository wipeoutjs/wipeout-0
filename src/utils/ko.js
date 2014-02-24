

Class("wipeout.utils.ko", function () {
    
    var _ko = {};
    
    _ko.version = function() {
        ///<summary>Get the current knockout version as an array of numbers</summary>
        
        if(!ko || !ko.version)
            return null;
        
        var version = ko.version.split(".");
        for(var i = 0, ii = version.length; i < ii; i++)
            version[i] = parseInt(version[i]);
        
        return version;
    };   
    
    _ko.peek = function(input) {
        ///<summary>Like ko.unwrap, but peeks instead</summary>
        
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
        ///<summary>Like ko.isObservable, but for observableArrays</summary>
        return ko.isObservable(test) && test.push && test.push.constructor === Function;
    };
    
    _ko.virtualElements = {
        parentElement: function(node) {
            ///<summary>Returns the parent element or parent knockout virtual element of a node</summary>
            var current = node.previousSibling;
            while(current) {
                if(_ko.virtualElements.isVirtual(current)) {
                    return current;
                }
                
                current = current.previousSibling;
            }
            
            return node.parentNode;
        },
        //TODO: this
        isVirtual: function(node) {
            ///<summary>Whether a html node is a knockout virtual element or not</summary>
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0;
        },
        //TODO: this
        isVirtualClosing: function(node) {
            ///<summary>Whether a html node is a knockout virtual element closing tag</summary>
            return node.nodeType === 8 && trim(node.nodeValue) === "/ko";
        }
    };
    
    return _ko;
});

//legacy
Class("wipeout.util.ko", function () { 
    return wipeout.utils.ko;
});