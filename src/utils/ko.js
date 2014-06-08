

Class("wipeout.utils.ko", function () {
    
    // copied from knockout lib
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";
    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*-->$/ : /^\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    
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
    
    _ko.virtualElements = {
        closingTag: function(openingTag) {
            var depth = 1;
            
            while (depth > 0 && openingTag) {
                openingTag = openingTag.nextSibling;
                if(_ko.virtualElements.isVirtual(openingTag))
                    depth++;
                else if(_ko.virtualElements.isVirtualClosing(openingTag))
                    depth--;
            }
            
            return openingTag;
        },
        parentElement: function(node) {
            ///<summary>Returns the parent element or parent knockout virtual element of a node</summary>
            ///<param name="node" type="HTMLNode">The child element</param>
            ///<returns type="HTMLNode">The parent</returns>
            var depth = 0;
            var current = node.previousSibling;
            while(current) {
                if(_ko.virtualElements.isVirtual(current)) {
                    if(depth < 0)
                        depth++;
                    else
                        return current;
                } else if(_ko.virtualElements.isVirtualClosing(current)) {
                    depth--;
                }
                
                current = current.previousSibling;
            }
            
            return node.parentNode;
        },
        // copied from knockout
        isVirtual: function(node) {
            ///<summary>Whether a html node is a knockout virtual element or not</summary>
            ///<param name="node" type="HTMLNode">The node to test</param>
            ///<returns type="Boolean"></returns>
            return (node.nodeType == 8) && (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
        },
        // copied from knockout
        isVirtualClosing: function(node) {
            ///<summary>Whether a html node is a knockout virtual element closing tag</summary>
            ///<param name="node" type="HTMLNode">The node to test</param>
            ///<returns type="Boolean"></returns>
            return (node.nodeType == 8) && (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(endCommentRegex);
        },
        enumerateOverChildren: function(node, callback) {
            node = ko.virtualElements.firstChild(node);
            while (node) {
                callback(node);
                node = ko.virtualElements.nextSibling(node);
            }
        }
    };
    
    return _ko;
});