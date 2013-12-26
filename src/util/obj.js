
var wpfko = wpfko || {};
wpfko.util = wpfko.util || {};

(function () {
        
    var createObject = function(constructorString, context) {
        if(!context) context = window;
        
        var constructor = constructorString.split(".");
        for(var i = 0, ii = constructor.length; i <ii; i++) {
            context = context[constructor[i]];
            if(!context) {
                throw "Cannot create object \"" + constructorString + "\"";
            }
        }
        
        if(context instanceof Function)            
            return new context();
        else 
            throw constructorString + " is not a valid function.";
    };

    var copyArray = function(input) {
        var output = [];
        for(var i = 0, ii = input.length; i < ii; i++) {
            output.push(input[i]);
        }
        
        return output;
    };
    
    var enumerate = function(enumerate, action, context) {
        context = context || window;
        
        if(enumerate == null) return;
        if(enumerate instanceof Array)
            for(var i = 0, ii = enumerate.length; i < ii; i++)
                action.call(context, enumerate[i], i);
        else
            for(var i in enumerate)
                action.call(context, enumerate[i], i);
    };
    
    wpfko.util.obj = {
        enumerate: enumerate,
        createObject: createObject,
        copyArray: copyArray
    };
    
})();