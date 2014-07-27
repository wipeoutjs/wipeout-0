Class("wipeout.utils.call", function () {
    
    var call = wipeout.base.object.extend(function call() {
        ///<summary>Calls a function with the correct scope</summary>
        ///<param name="find" type="wo.find" optional="false">The find functionality</param>
        
        this._super();
    });
    
    call.prototype.call = function(rootObject) {
        ///<summary>Call a method with on the root object with dot(...) method and pass in custom argument with it's arg(...) method</summary>
        ///<param name="rootObject" type="Any" optional="false">The object to begin the find from</param>
        ///<returns type="Object">An item to create a function with the correct context and custom arguments</returns>

        if(!rootObject)
            throw "Could not find an object to call function on.";
        
        var dots = [];
        var args = null;
        var output = function() {
            var current = rootObject;
            var currentFunction = null;
            
            if(dots.length > 0) {            
                for (var i = 0, ii = dots.length - 1; i < ii && current; i++) {
                    current = ko.utils.unwrapObservable(current[dots[i]]);
                }
            
                if(!current) {
                    var message = "Could not find the object " + dots[i - 1];
                }

                if(!current[dots[i]])
                    throw "Could not find function :\"" + dots[i] + "\" on this object.";
                
                currentFunction = current[dots[i]];
            } else {
                if(rootObject.constructor !== Function)
                    throw "Cannot call an object like a function";
                    
                currentFunction = rootObject;
            }
            
            if(args) {
                var ar = wipeout.utils.obj.copyArray(args);
                enumerate(arguments, function(arg) { ar.push(arg); });
                return currentFunction.apply(current, ar);
            } else {
                return currentFunction.apply(current, arguments);
            }
        };
        
        output.dot = function(functionName) {
            dots.push(functionName);
            return output;
        };
        
        output.args = function() {
            args = wipeout.utils.obj.copyArray(arguments);
            return output;
        };
        
        return output;
    };
    
    call.create = function() {
        ///<summary>Get a function wich points directly to (new wo.call(..)).call(...)</summary>
        ///<returns type="Function">The call function</returns>        
        
        var f = new wipeout.utils.call();

        return function(rootObject) {
            return f.call(rootObject);
        };
    };
    
    return call;
});