var wipeout = {};
    
var enumerate = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    context = context || window;
        
    if(enumerate == null) return;
    
    if(enumerate instanceof Array || 
       enumerate instanceof HTMLCollection || 
       enumerate instanceof NodeList || 
       enumerate instanceof NamedNodeMap)
        for(var i = 0, ii = enumerate.length; i < ii; i++)
            action.call(context, enumerate[i], i);
    else
        for(var i in enumerate)
            action.call(context, enumerate[i], i);
};

var enumerateDesc = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object in a decending order</summary>
    context = context || window;
    
    if(enumerate == null) return;
    if(enumerate instanceof Array || 
       enumerate instanceof HTMLCollection || 
       enumerate instanceof NodeList || 
       enumerate instanceof NamedNodeMap)
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
    ///<summary>Create a knockout binding</summary>
    
    var cls = Class("wipeout.bindings." + bindingName, accessorFunction);    
    ko.bindingHandlers[bindingName] = {
        init: cls.init,
        update: cls.update
    };
    
    if(allowVirtual)
        ko.virtualElements.allowedBindings[bindingName] = true;
};

var Class = function(classFullName, accessorFunction) {
    ///<summary>Create a wipeout class</summary>
    
    classFullName = classFullName.split(".");
    var namespace = classFullName.splice(0, classFullName.length - 1);
    
    var tmp = {};
    tmp[classFullName[classFullName.length - 1]] = accessorFunction();
    
    Extend(namespace.join("."), tmp);
    
    return tmp[classFullName[classFullName.length - 1]];
};

var Extend = function(namespace, extendWith) {
    ///<summary>Similar to $.extend but with a namespace string which must begin with "wipeout"</summary>
    
    namespace = namespace.split(".");
    
    if(namespace[0] !== "wipeout") throw "Root must be \"wipeout\".";
    namespace.splice(0, 1);
    
    var current = wipeout;
    enumerate(namespace, function(nsPart) {
        current = current[nsPart] || (current[nsPart] = {});
    });
    
    if(extendWith && extendWith instanceof Function) extendWith = extendWith();
    enumerate(extendWith, function(item, i) {
        current[i] = item;
    });
};
    
var _trimString = /^\s+|\s+$/g;
var trim = function(string) {
    ///<summary>Trims a string</summary>
    return string ? string.replace(_trimString, '') : string;
};

var trimToLower = function(string) {
    ///<summary>Trims a string and converts it to lower case</summary>
    return string ? trim(string).toLowerCase() : string;
};

var parseBool = function(input) {
    ///<summary>Parses a String into a Boolean</summary>
    if(input == null) return false;
        
    input = trimToLower(input);
    
    return input && input !== "false" && input !== "0";
};

Class("wipeout.utils.obj", function () {
        
    var createObject = function(constructorString, context) {
        ///<summary>Create an object from string</summary>
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
        ///<summary>Make a deep copy of an array</summary>
        var output = [];
        for(var i = 0, ii = input.length; i < ii; i++) {
            output.push(input[i]);
        }
        
        return output;
    };
    
    return {
        parseBool: parseBool,
        trimToLower: trimToLower,
        trim: trim,
        enumerate: enumerate,
        enumerateDesc: enumerateDesc,
        createObject: createObject,
        copyArray: copyArray
    };    
});

//legacy
Class("wipeout.util.obj", function () { 
    return wipeout.utils.obj;
});