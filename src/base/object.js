
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var object = function (values) {
        this._events = {};

        if (values) {
            $.extend(this, values);
        }
    };
    
    var cachedBaseMethods = [];
    object.prototype._superMethod = function() {
    
        // try to find a cached version to skip lookup of parent class method
        var cached = null;
        for(var i = 0, ii = cachedBaseMethods.length; i < ii; i++) {
            if(cachedBaseMethods[i].child === arguments.callee.caller) {
                cached = cachedBaseMethods[i].parent;
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
                for(var j in inheritanceTree[i]) {
                    if(inheritanceTree[i][j] === arguments.callee.caller) {
                        // map the current method to the method it overrides
                        cachedBaseMethods.push({
                            parent: inheritanceTree[i - 1][j],
                            child: arguments.callee.caller
                        });
                        
                        // cache for the next time this is called
                        cached = inheritanceTree[i - 1][j];
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

        var _this = this;
        var newConstructor = function () {

            var __this = this;

            // add a parent constructor
            this._super = function () {
                _this.apply(__this, arguments);
            };

            childClass.apply(this, arguments);
        };

        // static items
        for (var p in this)
            if (this.hasOwnProperty(p)) newConstructor[p] = this[p];

        // will ensure any subsequent changes to the parent class will reflect in child class
        function prototypeTracker() { this.constructor = newConstructor; }

        prototypeTracker.prototype = this.prototype;

        // inherit
        newConstructor.prototype = new prototypeTracker();

        return newConstructor;
    };

    wpfko.base.object = object;
})();