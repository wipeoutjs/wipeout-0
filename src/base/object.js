
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var object = function (values) {
        this._events = {};

        if (values) {
            $.extend(this, values);
        }
    };
    
    var cachedSuperMethods = [];
    object.prototype._super = function() {
        
        ///<summary>Call the current method of the parent class with arguments<summary>
        
        // contructor call
        if(arguments.callee === this.constructor) {
            this.constructor.prototype.constructor.apply(this, arguments);
            return;
        }        
        
        // try to find a cached version to skip lookup of parent class method
        var cached = null;
        for(var i = 0, ii = cachedSuperMethods.length; i < ii; i++) {
            if(cachedSuperMethods[i].child === arguments.callee.caller) {
                cached = cachedSuperMethods[i].parent;
                break;
            }
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
                                
                                // map the current method to the method it overrides
                                cachedSuperMethods.push({
                                    parent: cached,
                                    child: arguments.callee.caller
                                });
                                
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