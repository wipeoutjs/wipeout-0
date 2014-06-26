
Class("wipeout.base.object", function () {
    
    var object = function () {
        ///<summary>The object class is the base class for all wipeout objects. It has base functionality for inheritance and parent methods</summary>        
    };
    
    var cachedSuperMethods = {
        parents:[],
        children:[]
    };
    
    object.clearVirtualCache = function(forMethod /*optional*/) {
        ///<summary>Lookup results for _super methods are cached. This could cause problems in the rare cases when a class prototype is altered after one of its methods are called. Clearing the cache will solve this</summary>
        ///<param name="forMethod" type="Function" optional="true">A method to clear from the cache</param>
        
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
        }
    };
    
    //TODO: document
    // The virtual cache caches overridden methods for quick lookup later. It is not safe to use if two function prototypes which are not related share the same function, or function prototypes are modified after an application initilisation stage
    object.useVirtualCache = true;
    
    object.prototype._super = function() {        
        ///<summary>Call the current method or constructor of the parent class with arguments</summary>
        ///<returns type="Any">Whatever the overridden method returns</returns>
        
        var currentFunction = arguments.callee.caller;
        
        // try to find a cached version to skip lookup of parent class method
        var cached = null;
        if(object.useVirtualCache) {
            var superIndex = cachedSuperMethods.children.indexOf(currentFunction);
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
                // if it is a constructor
                if(inheritanceTree[i] === currentFunction.prototype) {
                    cached = inheritanceTree[i - 1].constructor;							
                } else {
                    for(var method in inheritanceTree[i]) {
                        if(inheritanceTree[i][method] === currentFunction) {
                            for(var j = i - 1; j >= 0; j--) {
                                if(inheritanceTree[j][method] !== currentFunction) {
                                    cached = inheritanceTree[j][method];
                                    break;
                                }
                            }
                        }
                        
                        if(cached)
                            break;
                    }
                }
					
                if (cached) {
                    if(object.useVirtualCache) {
                        // map the current method to the method it overrides
                        cachedSuperMethods.children.push(currentFunction);
                        cachedSuperMethods.parents.push(cached);
                    }

                    break;
                }
            }
            
            if(!cached)
                throw "Could not find method in parent class";
        }
                
        // execute parent class method
        return cached.apply(this, arguments);
    };
    
    object._extendFromObject = function (childClass, className/* optional */) {
        if(!childClass.constructor || childClass.constructor.constructor !== Function)
            throw "the property \"constructor\" must be a function";
        
        var newClass = object.extend(childClass.constructor);
    };

    //TODO document 2 extend methods
    
    var validFunctionCharacters = /^[a-zA-Z_][a-zA-Z_0-9]*$/;
    object.extend = function (childClass, className/* optional */) {
        ///<summary>Use prototype inheritance to inherit from this class. Supports "instanceof" checks</summary>
        ///<param name="childClass" type="Function" optional="false">The constructor of a class to create</param>
        ///<param name="className" type="String" optional="true">The name of the class for debugger console purposes</param>
        ///<returns type="Function">The newly created class</returns>
        
        // if the input is a lonely constructor, convert it into the object format
        if(childClass.constructor === Function) {
            var cc = childClass;
            childClass = {
                constructor: cc,
                statics: {}
            };
            
            for(var item in childClass.constructor)
                childClass.statics[i] = childClass.constructor[i];
            
            for(var item in childClass.constructor.prototype)
                childClass[i] = childClass.constructor.prototype[i];
            
        } else if (childClass.constructor === Object) {
            // in case the consumer forgot to specify a constructor, default to parent constructor
            childClass.constructor = function() {
                this._super.apply(this, arguments);
            };
        } else if(!childClass.constructor || childClass.constructor.constructor !== Function) {
            throw "the property \"constructor\" must be a function";
        }
        
        // static functions
        for (var p in this)
            if (this.hasOwnProperty(p) && this[p] && this[p].constructor === Function && this[p] !== object.clearVirtualCache && childClass.constructor[p] === undefined)
                childClass.constructor[p] = this[p];
 
        // use eval so that browser debugger will get class name
        if(className) {
            if(!validFunctionCharacters.test(className)) {
                throw "Invalid class name. The class name is for debug purposes and can contain alphanumeric characters only";
            }
            
            // or rather, YUI doesn't like eval, use new function
            new Function("childClass", "parentClass", "\
            function " + className + "() { this.constructor = childClass; }\
            " + className + ".prototype = parentClass.prototype;\
            childClass.prototype = new " + className + "();")(childClass.constructor, this);
        } else {
            var prototypeTracker = function() { this.constructor = childClass.constructor; }     
            prototypeTracker.prototype = this.prototype;
            childClass.constructor.prototype = new prototypeTracker();
        }
        
        for(var i in childClass) {
            if(i === "constructor") continue;
            if(i === "statics") {
                for(var j in childClass[i])
                    childClass.constructor[j] = childClass[i][j];
                
                continue;
            }
            
            childClass.constructor.prototype[i] = childClass[i];
        }
        
        
        return childClass.constructor;
    };

    return object;
});