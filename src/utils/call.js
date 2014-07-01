Class("wipeout.utils.call", function () {
    
    var call = wipeout.base.object.extend(function(find) {
        ///<summary>Extends find functionality to call functions with the correct context and custom arguments</summary>
        ///<param name="find" type="wo.find" optional="false">The find functionality</param>
        
        this._super();

        this.find = find;
    }, "call");
    
    call.prototype.call = function(searchTermOrFilters, filters) {
        ///<summary>Find an item given a search term and filters. Call a method with it's dot(...) method and pass in custom argument with it's arg(...) method</summary>
        ///<param name="searchTerm" type="Any" optional="false">Search term or filters to be passed to find</param>
        ///<param name="filters" type="Object" optional="true">Filters to be passed to find</param>
        ///<returns type="Object">An item to create a function with the correct context and custom arguments</returns>
        
        var obj = this.find(searchTermOrFilters, filters);

        if(!obj)
            throw "Could not find an object to call function on.";
        
        var dots = [];
        var args = null;
        var output = function() {
            var current = obj;
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
                if(obj.constructor !== Function)
                    throw "Cannot call an object like a functino";
                    
                currentFunction = obj;
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
    
    call.create = function(find) {
        ///<summary>Get a function wich points directly to (new wo.call(..)).call(...)</summary>
        ///<param name="find" type="wo.find" optional="false">The find functionality</param>
        ///<returns type="Function">The call function</returns>        
        
        var f = new wipeout.utils.call(find);

        return function(searchTerm, filters) {
            return f.call(searchTerm, filters);
        };
    };
    
    return call;
});