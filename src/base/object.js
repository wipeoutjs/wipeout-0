
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
    
    object.clearVirtualCache = function(forMethod /*optional*/) {
        ///<summary>Lookup results for _super methods are cached. This could cause problems in the rare cases when a class prototype is altered after one of its methods are called. Clearing the cache will solve this</summary>
        if(!forMethod) {
            cachedSuperMethods.parents.length = 0;
            cachedSuperMethods.children.length = 0;
            return;
        }
        
        for(var i = 0, ii = cachedSuperMethods.children.length; i < ii; i++) {
            if(cachedSuperMethods.children[i] === forMethod || cachedSuperMethods.parents[i] === forMethod) {
                cachedSuperMethods.children.splice(i, 1);
                cachedSuperMethods.parents.splice(i, 1);
            }
        };
    };
    
    // The virtual cache caches overridden methods for quick lookup later. It is not safe to use if two function prototypes which are not related share the same function, or function prototypes are modified after an application initilisation stage
    object.useVirtualCache = true;
    
    object.prototype._super = function() {        
        ///<summary>Call the current method or constructor of the parent class with arguments</summary>
        
        // try to find a cached version to skip lookup of parent class method
        var cached = null;
        if(object.useVirtualCache) {
            var superIndex = cachedSuperMethods.children.indexOf(arguments.callee.caller);
            if(superIndex !== -1)
                cached = cachedSuperMethods.parents[superIndex];
        }
        
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
                                
                                if(object.useVirtualCache) {
                                    // map the current method to the method it overrides
                                    cachedSuperMethods.children.push(arguments.callee.caller);
                                    cachedSuperMethods.parents.push(cached);
                                }
                                
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
 
        // static functions
        for (var p in this)
            if (this.hasOwnProperty(p) && this[p] && this[p].constructor === Function)
                childClass[p] = this[p];
 
        // will ensure any subsequent changes to the parent class will reflect in child class
        function prototypeTracker() { this.constructor = childClass; }
 
        prototypeTracker.prototype = this.prototype;
 
        // inherit
        childClass.prototype = new prototypeTracker();
        return childClass;
    };

    wpfko.base.object = object;
})();