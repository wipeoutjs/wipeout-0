
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var object = function () {
        ///<summary>The object class is the base class for all wipeout objects. It has base functionality for inheritance and parent methods</summary>
    };
    
    var cachedSuperMethods = {
        parents:[],
        children:[]
    };
    
    object.prototype._super = function() {        
        ///<summary>Call the current method or constructor of the parent class with arguments</summary>
        
        // try to find a cached version to skip lookup of parent class method
        var superIndex = cachedSuperMethods.children.indexOf(arguments.callee.caller);
        var cached = superIndex === -1 ? null : cachedSuperMethods.parents[superIndex];
        
        if(!cached) {
            
            // compile prototype tree into array
            var inheritanceTree = [];
            var current = this.constructor.prototype;
            while(current) {
                inheritanceTree.push(current);
                current = Object.getPrototypeOf(current);
            }
            
            // reverse array so that parent classes come before child classes
            inheritanceTree.reverse();            
            
            // find the first instance of the current method in inheritance tree
            for(var i = 0, ii = inheritanceTree.length; i < ii; i++) {
                for(var method in inheritanceTree[i]) {
                    if(inheritanceTree[i][method] === arguments.callee.caller) {
                        
                        for(var j = i - 1; j >= 0; j--) {
                            if(inheritanceTree[j][method] !== arguments.callee.caller) {
                                cached = inheritanceTree[j][method];
                                
                                // map the current method to the method it overrides
                                cachedSuperMethods.children.push(arguments.callee.caller);
                                cachedSuperMethods.parents.push(cached);
                                
                                break;
                            }
                        }
                        
                        break;
                    }
                }
            }
            
            if(!cached)
                throw "Could not find method in parent class";
        }
                
        // execute parent class method
        return cached.apply(this, arguments);
    };

    object.extend = function (childClass) {
        ///<summary>Use prototype inheritance to inherit from this class. Supports "instanceof" checks</summary>
 
        // static items
        for (var p in this)
            if (this.hasOwnProperty(p)) childClass[p] = this[p];
 
        // will ensure any subsequent changes to the parent class will reflect in child class
        function prototypeTracker() { this.constructor = childClass; }
 
        prototypeTracker.prototype = this.prototype;
 
        // inherit
        childClass.prototype = new prototypeTracker();
        return childClass;
    };

    wpfko.base.object = object;
})();