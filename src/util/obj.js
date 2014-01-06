var wpfko = {};
    
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

var enumerateDesc = function(enumerate, action, context) {
    context = context || window;
    
    if(enumerate == null) return;
    if(enumerate instanceof Array)
        for(var i = enumerate.length - 1; i >= 0; i--)
            action.call(context, enumerate[i], i);
    else {
        var props = [];
        for(var i in enumerate)
            props.push(i);
        
        for(var i = props.length - 1; i >= 0; i--)
            action.call(context, enumerate[props[i]], props[i]);
    }
};

var Binding = function(bindingName, allowVirtual, accessorFunction) {
    
    var cls = Class("wpfko.bindings." + bindingName, accessorFunction);    
    ko.bindingHandlers[bindingName] = {
        init: cls.init,
        update: cls.update
    };
    
    if(allowVirtual)
        ko.virtualElements.allowedBindings[bindingName] = true;
};

var Class = function(classFullName, accessorFunction) {
    classFullName = classFullName.split(".");
    var namespace = classFullName.splice(0, classFullName.length - 1);
    
    var tmp = {};
    tmp[classFullName[classFullName.length - 1]] = accessorFunction();
    
    Extend(namespace.join("."), tmp);
    
    return tmp[classFullName[classFullName.length - 1]];
};

var Extend = function(namespace, extendWith) {
    namespace = namespace.split(".");
    
    if(namespace[0] !== "wpfko") throw "Root must be \"wpfko\".";
    namespace.splice(0, 1);
    
    var current = wpfko;
    enumerate(namespace, function(nsPart) {
        current = current[nsPart] || (current[nsPart] = {});
    });
    
    if(extendWith && extendWith instanceof Function) extendWith = extendWith();
    enumerate(extendWith, function(item, i) {
        current[i] = item;
    });
};

Class("wpfko.util.obj", function () {
        
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
    
    return {
        enumerate: enumerate,
        enumerateDesc: enumerateDesc,
        createObject: createObject,
        copyArray: copyArray
    };    
});