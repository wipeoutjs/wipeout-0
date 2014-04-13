

Class("wipeout.utils.ko", function () {
    
    var _ko = function() { };
    
    _ko.version = function() {
        ///<summary>Get the current knockout version as an array of numbers</summary>
        ///<returns type="Array" generic0="Number">The knockout version</returns>
        
        if(!ko || !ko.version)
            return null;
        
        var version = ko.version.split(".");
        for(var i = 0, ii = version.length; i < ii; i++)
            version[i] = parseInt(version[i]);
        
        return version;
    };   
    
    _ko.peek = function(input) {
        ///<summary>Like ko.unwrap, but peeks instead</summary>
        ///<param name="input" type="Any">An observable or regular object</param>
        ///<returns type="Any">The value of the observable or object</returns>
        
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
        ///<param name="test" type="Any">An object to test</param>
        ///<returns type="Boolean"></returns>
        return ko.isObservable(test) && test.push && test.push.constructor === Function;
    };
    
    _ko.virtualElements = {
        parentElement: function(node) {
            ///<summary>Returns the parent element or parent knockout virtual element of a node</summary>
            ///<param name="node" type="HTMLNode">The child element</param>
            ///<returns type="HTMLNode">The parent</returns>
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
            ///<param name="node" type="HTMLNode">The node to test</param>
            ///<returns type="Boolean"></returns>
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0;
        },
        //TODO: this
        isVirtualClosing: function(node) {
            ///<summary>Whether a html node is a knockout virtual element closing tag</summary>
            ///<param name="node" type="HTMLNode">The node to test</param>
            ///<returns type="Boolean"></returns>
            return node.nodeType === 8 && trim(node.nodeValue) === "/ko";
        },
        childNodes: function(element) {
            ///<summary>Returns the child nodes of an element or knockout virtual element</summary>
            ///<param name="element" type="HTMLNode">The parent</param>
            ///<returns type="Array">The child nodes</returns>
            
            if(element.nodeType == 1)
                return element.childNodes;
            
            if(!_ko.virtualElements.isVirtual(element))
                return [];
            
            var output = [];
            var depth = 0;
            element = element.nextSibling;
            while (depth >= 0) {
                if(!element)
                    throw "Cannot find closing tag to match tag ko";
                
                var closing = false;
                if(_ko.virtualElements.isVirtual(element))
                    depth++;
                else if (closing = _ko.virtualElements.isVirtualClosing(element))
                    depth--;
                
                if (depth === 0 && !closing) {
                    output.push(element);
                }
                
                element = element.nextSibling;
            }
            
            return output;
        }
    };
    
    return _ko;
});