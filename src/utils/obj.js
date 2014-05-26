
//"use strict"; - cannot use strict right now. any functions defined in strict mode are not accesable via arguments.callee.caller, which is used by _super
var wipeout = {};

var ajax = function (options) {
    var xmlhttp = window.XMLHttpRequest ?
        new XMLHttpRequest() :
        new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            // 0 for non web srever response (e.g. file system)
            if ((xmlhttp.status == 200 || xmlhttp.status == 0) && options.success) {
                options.success(xmlhttp);
            } else if (options.error) {
                options.error(xmlhttp);
            }
        }
    };

    xmlhttp.open(options.type || "GET", options.url || document.location.href, options.async !== undefined ? options.async : true);
    xmlhttp.send();
};
    
var enumerate = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    
    context = context || window;
        
    if(enumerate == null) return;
    
    if(enumerate instanceof Array || 
       enumerate instanceof HTMLCollection || 
       enumerate instanceof NodeList || 
       (window.NamedNodeMap && enumerate instanceof NamedNodeMap) || 
       (window.MozNamedAttrMap && enumerate instanceof MozNamedAttrMap))
        for(var i = 0, ii = enumerate.length; i < ii; i++)
            action.call(context, enumerate[i], i);
    else
        for(var i in enumerate)
            action.call(context, enumerate[i], i);
};

var enumerateDesc = function(enumerate, action, context) {
    ///<summary>Enumerate through an array or object in a decending order</summary>
    ///<param name="enumerate" type="Any">An item to enumerate over</param>
    ///<param name="action" type="Function">The callback to apply to each item</param>
    ///<param name="context" type="Any" optional="true">The context to apply to the callback</param>
    context = context || window;
    
    if(enumerate == null) return;
    if(enumerate instanceof Array || 
       enumerate instanceof HTMLCollection || 
       enumerate instanceof NodeList || 
       (window.NamedNodeMap && enumerate instanceof NamedNodeMap) || 
       (window.MozNamedAttrMap && enumerate instanceof MozNamedAttrMap))
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
    ///<param name="bindingName" type="String">The name of the binding</param>
    ///<param name="allowVirtual" type="Boolean">Specify whether the binding can be used with virtual elements</param>
    ///<param name="accessorFunction" type="Function">A function which returns the binding</param>
    
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
    ///<param name="classFullName" type="String">The name of the class</param>
    ///<param name="accessorFunction" type="Function">A function which returns the class</param>
    
    classFullName = classFullName.split(".");
    var namespace = classFullName.splice(0, classFullName.length - 1);
    
    var tmp = {};
    tmp[classFullName[classFullName.length - 1]] = accessorFunction();
    
    Extend(namespace.join("."), tmp);
    
    return tmp[classFullName[classFullName.length - 1]];
};

var Extend = function(namespace, extendWith) {
    ///<summary>Similar to $.extend but with a namespace string which must begin with "wipeout"</summary>
    ///<param name="namespace" type="String">The namespace to add to</param>
    ///<param name="extendWith" type="Object">The object to add to the namespace</param>
    
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
    ///<param name="string" type="String">The string to trim</param>
    ///<returns type="String">The trimmed string</returns>
    
    return string ? string.replace(_trimString, '') : string;
};

var trimToLower = function(string) {
    ///<summary>Trims a string and converts it to lower case</summary>
    ///<param name="string" type="String">The string to trim</param>
    ///<returns type="String">The trimmed string</returns>
    
    return string ? trim(string).toLowerCase() : string;
};

var parseBool = function(input) {
    ///<summary>Parses a String into a Boolean</summary>
    ///<param name="input" type="String">The string to parse</param>
    ///<returns type="Boolean">The parsed boolean</returns>
    
    if(input == null) return false;
        
    input = trimToLower(input);
    
    return !!(input && input !== "false" && input !== "0");
};

Class("wipeout.utils.obj", function () {
        
    var getObject = function(constructorString, context) {
        ///<summary>Get an object from string</summary>
        ///<param name="constructorString" type="String">A pointer to the object to create</param>
        ///<param name="context" type="String">The root context</param>
        ///<returns type="Any">The object</returns>
        if(!context) context = window;
        
        var constructor = constructorString.split(".");
        for(var i = 0, ii = constructor.length; i <ii; i++) {
            context = context[constructor[i]];
            if(context == null)
                return null;
        }
        
        return context;
    };
        
    var createObject = function(constructorString, context) {
        ///<summary>Create an object from string</summary>
        ///<param name="constructorString" type="String">A pointer to the object to create</param>
        ///<param name="context" type="String">The root context</param>
        ///<returns type="Any">The created object</returns>
        
        var constructor = getObject(constructorString, context);
        
        if(constructor instanceof Function) {
            
            var object = new constructor();
            if(object instanceof wipeout.base.view && DEBUG)
                object.__woBag.constructedViewType = constructorString;
            
            return object;
        }
        
        throw constructorString + " is not a valid function.";
    };

    var copyArray = function(input) {
        ///<summary>Make a deep copy of an array</summary>
        ///<param name="input" type="Array">The array to copy</param>
        ///<returns type="Array">The copied array</returns>
        var output = [];
        for(var i = 0, ii = input.length; i < ii; i++) {
            output.push(input[i]);
        }
        
        return output;
    };
    
    var endsWith = function(string, endsWith) {
        return string.indexOf(endsWith, string.length - endsWith.length) !== -1;
    };
    
    var tryFreeze = function(obj) {
        if(Object.freeze && Object.freeze instanceof Function)
            Object.freeze(obj);
    };
    
    var random = function(max) {
        ///<summary>Random int generator</summary>
        ///<param name="max" type="Number">The maximum value</param>
        ///<returns type="Number">A random number</returns>
        return Math.floor(Math.random() * max);
    };
    
    var obj = function() { };
    obj.tryFreeze = tryFreeze;
    obj.ajax = ajax;
    obj.parseBool = parseBool;
    obj.trimToLower = trimToLower;
    obj.trim = trim;
    obj.enumerate = enumerate;
    obj.enumerateDesc = enumerateDesc;
    obj.getObject = getObject;
    obj.createObject = createObject;
    obj.copyArray = copyArray;
    obj.random = random;
    obj.endsWith = endsWith;
    return obj;
});