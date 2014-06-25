Class("wipeout.utils.call", function () {
    
    var call = wipeout.base.object.extend(function(find) {
        this._super();

        this.find = find;
    }, "call");
    
    call.prototype.call = function(searchTerm, filters) {
        var find = this.find;
        return {
            dot: function(functionName) {

                var obj = find(searchTerm, filters);

                if(!obj)
                    throw "Could not find an object to call function :\"" + functionName + "\" on.";

                if(!obj[functionName])
                    throw "Could not find function :\"" + functionName + "\" on this object.";

                var output = function() {
                    if(args) {
                        var ar = wipeout.utils.obj.copyArray(args);
                        enumerate(arguments, function(arg) { ar.push(arg); });
                        return obj[functionName].apply(obj, ar);
                    } else {
                        return obj[functionName].apply(obj, arguments);
                    }
                };

                var args = null;
                output.args = function() {
                    args = wipeout.utils.obj.copyArray(arguments);
                    return output;
                };

                return output;              
            }
        };
    };
    
    call.create = function(find) {
        var f = new wipeout.utils.call(find);

        return function(searchTerm, filters) {
            return f.call(searchTerm, filters);
        };
    };
    
    return call;
});