(function () { 
//"use strict"; - cannot use strict right now. any functions defined in strict mode are not accesable via arguments.callee.caller, which is used by _super
var wipeout = {};

var ajax = function (options) {
    ///<summary>Perform an ajax request</summary>
    ///<param name="options" type="Object">Configure the request</param>
    ///<returns type="XMLHttpRequest">The ajax request object</returns>
    
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
    
    return xmlhttp;
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
        ///<summary>Determine whether a string ends with another string</summary>
        ///<param name="string" type="String">The container string</param>
        ///<param name="endsWith" type="String">The contained string</param>
        ///<returns type="Boolean"></returns>
        
        return string.indexOf(endsWith, string.length - endsWith.length) !== -1;
    };
    
    var random = function(max) {
        ///<summary>Random int generator</summary>
        ///<param name="max" type="Number">The maximum value</param>
        ///<returns type="Number">A random number</returns>
        return Math.floor(Math.random() * max);
    };
    
    var obj = function() { };
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

Class("wipeout.utils.domManipulationWorkerBase", function () { 
    
    var domManipulationWorkerBase = wipeout.base.object.extend(function() {  
        ///<summary>Monitor changes to html globaly and cleanup wipeout state on finish(...)</summary>
        
        this._super();
        
        ///<Summary type="Array" generic0="Node">The list of html nodes which have changed</Summary>
        this._mutations = [];
    });
    
    domManipulationWorkerBase.prototype.finish = function() {  
        ///<summary>Cleanup any moved or removed nodes</summary>
        
        // dispose of removed nodes
        for(var i = 0; i < this._mutations.length; i++) {
            if(!document.body.contains(this._mutations[i])) {
                wipeout.utils.html.cleanNode(this._mutations.splice(i, 1)[0]);
                i--;
            }
        }
        
        enumerate(this._mutations, function(mutation) {
            enumerate(wipeout.bindings.bindingBase.getBindings(mutation, wipeout.bindings.render), function(binding) {
                binding.hasMoved();
            });
        });
        
        this._mutations.length = 0;
    };
    
    return domManipulationWorkerBase;
});


Class("wipeout.base.disposable", function () {
    
    var disposable = wipeout.base.object.extend(function (disposeFunction) {
        ///<summary>An object which will dispose of something</summary>   
        ///<param name="disposeFunction" type="Function" optional="false">A dispose function</param>
        this._super();
        
        ///<summary type="Function">The function to call when disposing</summary>
        this.disposeFunction = disposeFunction || function() {};
    }, "disposable");
    
    disposable.prototype.dispose = function() {
        ///<summary>Dispose</summary>           
        
        if(this.disposeFunction)
            this.disposeFunction();
        
        delete this.disposeFunction;
    };
                                      
    return disposable;
});


Class("wipeout.base.visual", function () {
    
    var visual = wipeout.base.object.extend(function (templateId) {
        ///<summary>Base class for anything with a visual element. Interacts with the wipeout template engine to render content</summary>
        ///<param name="templateId" type="String" optional="true">A default template id</param>
        this._super();

        ///<Summary type="Boolean">Specifies whether this object should be used as a binding context. If true, the binding context of this object will be it's parent. Default is false</Summary>
        this.shareParentScope = false;

        ///<Summary type="Object">Dictionary of items created within the current template. The items can be visuals or html elements</Summary>
        this.templateItems = {};

        ///<Summary type="ko.observable" generic0="String">The template of the visual, giving it an appearance</Summary>
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());

        ///<Summary type="Object">A bag to put objects needed for the lifecycle of this object and its properties</Summary>
        this.__woBag = {
            disposed: wipeout.base.event(),
            disposables: {},
            createdByWipeout: false,
            rootHtmlElement: null,
            routedEventSubscriptions: [],
            nodes: []
        };
    }, "visual");
    
    visual.getDefaultTemplateId = (function () {
        var templateId = null;
        return function () {
            ///<summary>Returns the Id for the default template</summary>   
            ///<returns type="String">The Id for an default template</returns>     
            if (!templateId) {
                templateId = wipeout.base.contentControl.createAnonymousTemplate("<span>No template has been specified</span>");
            }

            return templateId;
        };
    })();
    
    visual.getBlankTemplateId = (function () {
        var templateId = null;
        return function () {
            ///<summary>Returns the Id for an empty template</summary>    
            ///<returns type="String">The Id for an empty template</returns>    
            if (!templateId) {
                templateId = wipeout.base.contentControl.createAnonymousTemplate("");
            }

            return templateId;
        };
    })();
    
    visual.visualGraph = function (rootElement, displayFunction) {
        ///<summary>Compiles a tree of all visual elements in a block of html, starting at the rootElement</summary>    
        ///<param name="rootElement" type="HTMLNode" optional="false">The root node of the visual tree</param>
        ///<param name="displayFunction" type="Function" optional="true">A function to convert view models found into a custom type</param>
        ///<returns type="Array" generic0="Object">The visual graph</returns>

        if (!rootElement)
            return [];

        displayFunction = displayFunction || function() { return typeof arguments[0]; };

        var output = [];
        wipeout.utils.obj.enumerate(wipeout.utils.html.getAllChildren(rootElement), function (child) {
            wipeout.utils.obj.enumerate(visual.visualGraph(child), output.push, output);
        });

        var vm = wipeout.utils.domData.get(rootElement, wipeout.bindings.wipeout.utils.wipeoutKey);        
        if (vm) {
            return [{ viewModel: vm, display: displayFunction(vm), children: output}];
        }

        return output;
    };
    
    visual.prototype.entireViewModelHtml = function() {
        ///<summary>Gets all of the html nodes included in this view model</summary>
        ///<returns type="Array" generic0="Node">The html elements</returns>
        
        if(this.__woBag.rootHtmlElement) {
            if (this.__woBag.rootHtmlElement.nodeType === 1) {
                return [this.__woBag.rootHtmlElement];
            } else if (wipeout.utils.ko.isVirtual(this.__woBag.rootHtmlElement)) {
                // add root element
                var output = [this.__woBag.rootHtmlElement];
                
                wipeout.utils.ko.enumerateOverChildren(this.__woBag.rootHtmlElement, function(child) {
                    output.push(child);
                })

                // add root element closing tag
                var last = output[output.length - 1].nextSibling;
                if(!wipeout.utils.ko.isVirtualClosing(last))
                    throw "Could not compile view model html";

                output.push(last);
                return output;
            }
        }

        // visual has not been redered
        return [];
    };
    
    visual.prototype.disposeOf = function(key) {
        ///<summary>Dispose of an item registered as a disposable</summary>
        ///<param name="key" type="String" optional="false">The key of the item to dispose</param>
        if(this.__woBag.disposables[key]) {
            this.__woBag.disposables[key]();
            delete this.__woBag.disposables[key];
        }
    };
    
    visual.prototype.disposeOfAll = function() {
        ///<summary>Dispose of all items registered as a disposable</summary>
        for(var i in this.__woBag.disposables)
            this.disposeOf(i);
    };
    
    visual.prototype.registerDisposeCallback = (function() {
        var i = 0;
        return function(disposeFunction) {
            ///<summary>Register a dispose function which will be called when this object is disposed of.</summary>
            ///<param name="disposeFunction" type="Function" optional="false">The function to call when on dispose</param>
            ///<returns type="String">A key to dispose off this object manually</returns>

            if(!disposeFunction || disposeFunction.constructor !== Function) throw "The dispose function must be a Function";

            var id = (++i).toString();            
            this.__woBag.disposables[id] = disposeFunction;            
            return id;
        };
    })();
    
    visual.prototype.registerDisposable = function(disposableOrDisposableGetter) {
        ///<summary>An object with a dispose function to be disposed when this object is disposed of.</summary>
        ///<param name="disposableOrDisposableGetter" type="Function" optional="false">The function to dispose of on dispose, ar a function to get this object</param>
        ///<returns type="String">A key to dispose off this object manually</returns>
        
        if(!disposableOrDisposableGetter) throw "Invalid disposeable object";        
        if(disposableOrDisposableGetter.constructor === Function && !disposableOrDisposableGetter.dispose) disposableOrDisposableGetter = disposableOrDisposableGetter.call(this);        
        if(!disposableOrDisposableGetter || !(disposableOrDisposableGetter.dispose instanceof Function)) throw "The disposable object must have a dispose(...) function";

        return this.registerDisposeCallback(function() { disposableOrDisposableGetter.dispose(); });
    };
    
    visual.prototype.getRootHtmlElement = function() {
        ///<summary>Get the root of this view model. Unless rendered manually using the render binding, it will be a knockout virtual element</summary>
        ///<returns type="Node">The root element</returns>
        return this.__woBag.rootHtmlElement;
    };
    
    visual.prototype.dispose = function() {
        ///<summary>Dispose of this visual</summary>

        // dispose of any computeds
        for(var i in this)
            if(ko.isObservable(this[i]) && this[i].dispose instanceof Function)
                this[i].dispose();

        // dispose of routed event subscriptions
        enumerate(this.__woBag.routedEventSubscriptions.splice(0, this.__woBag.routedEventSubscriptions.length), function(event) {
            event.dispose();
        });

        this.__woBag.disposed.trigger();
    };
    
    visual.prototype.getParents = function(includeSharedParentScopeItems) {
        ///<summary>Gets an array of the entire tree of ancestor visual objects</summary>
        ///<param name="includeSharedParentScopeItems" type="Boolean" optional="true">Set to true if items marked with shareParentScope can be returned</param>
        ///<returns type="Array" generic0="wo.view" arrayType="wo.view">A tree of ancestor view models</returns>
        var current = this.getParent(includeSharedParentScopeItems);
        var parents = [];
        while(current) {
            parents.push(current);
            current = current.getParent(includeSharedParentScopeItems);
        }

        return parents;
    };
    
    visual.prototype.getParent = function(includeShareParentScopeItems) {
        ///<summary>Get the parent visual of this visual</summary> 
        ///<param name="includeSharedParentScopeItems" type="Boolean" optional="true">Set to true if items marked with shareParentScope can be returned</param>
        ///<returns type="wo.view">The parent view model</returns>
        var pe;
        var parent = !this.__woBag.rootHtmlElement || !(pe = wipeout.utils.ko.parentElement(this.__woBag.rootHtmlElement)) ?
            null :
            wipeout.utils.html.getViewModel(pe);

        return includeShareParentScopeItems || !parent || !parent.shareParentScope ?
            parent :
            parent.getParent(includeShareParentScopeItems);
    };
    
    visual.prototype.unRegisterRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {  
        ///<summary>Unregister from a routed event. The callback and callback context must be the same as those passed in during registration</summary>  
        ///<param name="callback" type="Function" optional="false">The callback to un-register</param>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to un register from</param>
        ///<param name="callbackContext" type="Any" optional="true">The original context passed into the register function</param>
        ///<returns type="Boolean">Whether the event registration was found or not</returns>         

        for(var i = 0, ii = this.__woBag.routedEventSubscriptions.length; i < ii; i++) {
            if(this.__woBag.routedEventSubscriptions[i].routedEvent === routedEvent) {
                this.__woBag.routedEventSubscriptions[i].event.unRegister(callback, callbackContext);
                return true;
            }
        }  

        return false;
    };
    
    visual.prototype.registerRoutedEvent = function(routedEvent, callback, callbackContext, priority) {
        ///<summary>Register for a routed event</summary>   
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        ///<param name="callbackContext" type="Any" optional="true">The context "this" to use within the callback</param>
        ///<param name="priority" type="Number" optional="true">The event priorty. Event priority does not affect event bubbling order</param>
        ///<returns type="wo.eventRegistration">A dispose function</returns>         

        var rev;
        for(var i = 0, ii = this.__woBag.routedEventSubscriptions.length; i < ii; i++) {
            if(this.__woBag.routedEventSubscriptions[i].routedEvent === routedEvent) {
                rev = this.__woBag.routedEventSubscriptions[i];
                break;
            }
        }

        if(!rev) {
            rev = new wipeout.base.routedEventRegistration(routedEvent);
            this.__woBag.routedEventSubscriptions.push(rev);
        }

        return rev.event.register(callback, callbackContext, priority);
    };
    
    visual.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event. The event will bubble upwards to all ancestors of this visual. Overrides wo.object.triggerRoutedEvent</summary>        
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        ///<param name="eventArgs" type="Any" optional="true">The event args to bubble up with the routed event</param>
        if(!(eventArgs instanceof wipeout.base.routedEventArgs)) {
            eventArgs = new wipeout.base.routedEventArgs(eventArgs, this);
        }

        for(var i = 0, ii = this.__woBag.routedEventSubscriptions.length; i < ii; i++) {
            if(eventArgs.handled) return;
            if(this.__woBag.routedEventSubscriptions[i].routedEvent === routedEvent) {
                this.__woBag.routedEventSubscriptions[i].event.trigger(eventArgs);
            }
        }

        if(!eventArgs.handled) {
            var nextTarget = this.getParent();
            if(nextTarget) {
                nextTarget.triggerRoutedEvent(routedEvent, eventArgs);
            }
        }
    };
    
    // virtual
    visual.prototype.onRendered = function (oldValues, newValues) {
        ///<summary>Triggered each time after a template is rendered</summary>   
        ///<param name="oldValues" type="Array" generic0="HTMLNode" optional="false">A list of HTMLNodes removed</param>
        ///<param name="newValues" type="Array" generic0="HTMLNode" optional="false">A list of HTMLNodes rendered</param>
    };
    
    // virtual
    visual.prototype.onUnrender = function () {
        ///<summary>Triggered just before a visual is un rendered</summary>    
    };
    
    // virtual
    visual.prototype.onApplicationInitialized = function () {
        ///<summary>Triggered after the entire application has been initialized. Will only be triggered on the viewModel created directly by the wipeout binding</summary>    
    };
    
    // list of html tags which will not be treated as objects
    var reservedTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    
    visual.reservedTags = {};
    enumerate(reservedTags, function(tag) {
        visual.reservedTags[tag] = true;
    });
    
    return visual;
});


Class("wipeout.base.view", function () {    

    var modelRoutedEventKey = "wipeout.base.view.modelRoutedEvents";
    
    var view = wipeout.base.visual.extend(function (templateId, model /*optional*/) {        
        ///<summary>Extends on the visual class to provide expected MVVM functionality, such as a model and bindings</summary>  
        ///<param name="templateId" type="String" optional="true">An initial template id</param>
        ///<param name="model" type="Any" optional="true">An initial model</param>

        this._super(templateId);
        
        if(model === undefined)
            model = null;
        
        ///<Summary type="ko.observable" generic0="Any">The model of view. If not set, it will default to the model of its parent view</Summary>
        this.model = ko.observable(model);
        
        var d1 = this.model.subscribe(function(newVal) {
            try {
                this._onModelChanged(model, newVal);
            } finally {
                model = newVal;
            }                                          
        }, this);
        this.registerDisposable(d1);
                                
        ///<Summary type="Object">Placeholder to store binding disposal objects</Summary>
        this.__woBag.bindings = {};
    }, "view"); 
    
    view.setObservable = function(obj, property, value) {
        ///<summary>Set an observable or non observable property</summary>
        ///<param name="obj" type="Any" optional="false">The object to set the property on</param>
        ///<param name="property" type="String" optional="false">The name of the property/param>
        ///<param name="value" type="String" optional="false">The value to set the property to</param>
        
        if(ko.isObservable(obj[property])) {
            obj[property](ko.utils.unwrapObservable(value));
        } else {
            obj[property] = ko.utils.unwrapObservable(value);
        }
    };
    
    view.prototype.disposeOfBinding = function(propertyName) {
        ///<summary>Un-bind this property.</summary>
        ///<param name="propertyName" type="String" optional="false">The name of the property to un-bind</param>
        
        if(this.__woBag.bindings[propertyName]) {
            this.__woBag.bindings[propertyName].dispose();
        }
    };
    
    view.prototype.dispose = function() {
        ///<summary>Dispose of view specific items</summary>    
        this._super();
        
        if(this.__woBag[modelRoutedEventKey]) {
            this.disposeOf(this.__woBag[modelRoutedEventKey]);
            delete this.__woBag[modelRoutedEventKey];
        }
        
        for(var i in this.__woBag.bindings)
            this.disposeOfBinding(i);
    };

    
    // virtual
    view.prototype.onInitialized = function() {
        ///<summary>Called by the template engine after a view is created and all of its properties are set</summary>    
    };
    
    view.prototype.bind = function(property, valueAccessor, twoWay) {
        ///<summary>Bind the value returned by valueAccessor to this[property]</summary>
        ///<param name="property" type="String" optional="false">The name of the property to bind</param>
        ///<param name="valueAccessor" type="Function" optional="false">A function which returns an observable or object to bind to</param>
        ///<param name="twoWay" type="Boolean" optional="true">Specifies whether to bind the destination to the source as well</param>
        ///<returns type="wo.disposable">A item to dispose of the binding</returns>
        
        if(twoWay && (!ko.isObservable(this[property]) || !ko.isObservable(valueAccessor())))
           throw 'Two way bindings must be between 2 observables';
           
        this.disposeOfBinding(property);
        
        var toBind = ko.dependentObservable({ 
            read: function() { return ko.utils.unwrapObservable(valueAccessor()); },
            write: twoWay ? function() { var va = valueAccessor(); if(va) va(arguments[0]); } : undefined
        });                                 
        
        var unsubscribe1 = false;
        var unsubscribe2 = false;
        view.setObservable(this, property, toBind.peek());
        var subscription1 = toBind.subscribe(function(newVal) {
            if(!unsubscribe1) {
                try {
                    unsubscribe2 = true;
                    view.setObservable(this, property, newVal);
                } finally {
                    unsubscribe2 = false;
                }
            }
        }, this);
        
        var subscription2 = twoWay ?
            this[property].subscribe(function(newVal) {
                if(!unsubscribe2) {
                    try {
                        unsubscribe1 = true;
                        view.setObservable({x: toBind}, "x", newVal);
                    } finally {
                        unsubscribe1 = false;
                    }
                }
            }, this) :
            null;
        
        var _this = this;
        return this.__woBag.bindings[property] = new wipeout.base.disposable(function() {
            if(subscription1) {
                subscription1.dispose();
                subscription1 = null;
            }

            if(subscription2) {
                subscription2.dispose();
                subscription2 = null;
            }

            if(toBind) {
                toBind.dispose();
                toBind = null;
            }
            
            delete _this.__woBag.bindings[property];
        });
    };    
    
    view._elementHasModelBinding = function(element) {
        ///<summary>returns whether the view defined in the element was explicitly given a model property</summary>
        ///<param name="element" type="Element" optional="false">The element to check for a model setter property</param>
        ///<returns type="Boolean"></returns>
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            if(element.attributes[i].nodeName === "model" || element.attributes[i].nodeName === "model-tw")
                return true;
        }
        
        for(var i = 0, ii = element.childNodes.length; i < ii; i++) {
            if(element.childNodes[i].nodeType === 1 && element.childNodes[i].nodeName === "model")
                return true;
        }
        
        return false;
    };
    
    // properties which will not be copied onto the view if defined in the template
    view.reservedPropertyNames = ["constructor", "constructor-tw", "id","id-tw"];
    
    view.prototype._initialize = function(propertiesXml, parentBindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        ///<param name="propertiesXml" type="Element" optional="false">An XML element containing property setters for the view</param>
        ///<param name="parentBindingContext" type="ko.bindingContext" optional="false">The binding context of the wipeout node just above this one</param>
        if(this.__woBag.initialized) throw "Cannot call initialize item twice";
        this.__woBag.initialized = true;
        
        if(!propertiesXml)
            return;
        
        this.__woBag.type = propertiesXml.nodeName;
        
        var prop = propertiesXml.getAttribute("id");
        if(prop)
            this.id = prop;
        
        prop = propertiesXml.getAttribute("shareParentScope");
        if(prop)
            this.shareParentScope = parseBool(prop);
                
        if(!view._elementHasModelBinding(propertiesXml) && wipeout.utils.ko.peek(this.model) == null) {
            this.bind('model', parentBindingContext.$data.model);
        }
        
        var bindingContext = this.shareParentScope ? parentBindingContext : parentBindingContext.createChildContext(this);        
        enumerate(propertiesXml.attributes, function(attr) {
            // reserved
            if(view.reservedPropertyNames.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(attr.nodeName.length > 3 && name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = 
        ",\n\t\t\tfunction(val) {\n\t\t\t\tif(!ko.isObservable(" + attr.value + "))\n\t\t\t\t\tthrow 'Two way bindings must be between 2 observables';\n\t\t\t\t" + attr.value + "(val);\n\t\t\t}";
            }
            
            try {
                bindingContext.__$woCurrent = this;
                wipeout.template.engine.createJavaScriptEvaluatorFunction(
        "(function() {\n\t\t\t__$woCurrent.bind('" + name + "', function() {\n\t\t\t\treturn " + attr.value + ";\n\t\t\t}" + setter + ");\n\n\t\t\treturn '';\n\t\t})()"
                )(bindingContext);
            } finally {
                delete bindingContext.__$woCurrent;
            }
        }, this);
        
        enumerate(propertiesXml.childNodes, function(child, i) {
            
            if(child.nodeType !== 1 || view.reservedPropertyNames.indexOf(child.nodeName) !== -1) return;
            
            // default
            var type = "string";
            for(var j = 0, jj = child.attributes.length; j < jj; j++) {
                if(child.attributes[j].nodeName === "constructor" && child.attributes[j].nodeValue) {
                    type = child.attributes[j].nodeValue;
                    break;
                }
            }
            
            if (view.objectParser[trimToLower(type)]) {
                var innerHTML = [];
                var ser = ser || new XMLSerializer();
                for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                    if(child.childNodes[j].nodeType == 3)
                        innerHTML.push(child.childNodes[j].nodeValue);
                    else
                        innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }
            
                var val = view.objectParser[trimToLower(type)](innerHTML.join(""));
                view.setObservable(this, child.nodeName, val);
            } else {
                var val = wipeout.utils.obj.createObject(type);
                if(val instanceof wipeout.base.view) {
                    val.__woBag.createdByWipeout = true;
                    val._initialize(child, bindingContext);
                }
                
                view.setObservable(this, child.nodeName, val);
            }
        }, this);
    };
    
    view.objectParser = {
        "json": function (value) {
            return JSON.parse(value);
        },
        "string": function (value) {
            return value;
        },
        "bool": function (value) {
            var tmp = trimToLower(value);
            return tmp ? tmp !== "false" && tmp !== "0" : false;
        },
        "int": function (value) {
            return parseInt(trim(value));
        },
        "float": function (value) {
            return parseFloat(trim(value));
        },
        "regexp": function (value) {
            return new RegExp(trim(value));
        },
        "date": function (value) {
            return new Date(trim(value));
        }
    };
        
    view.prototype._onModelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="oldValue" type="Any" optional="false">The old model</param>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>
        
        if(oldValue !== newValue) {
            this.disposeOf(this.__woBag[modelRoutedEventKey]);
            delete this.__woBag[modelRoutedEventKey];
            
            if(newValue instanceof wipeout.base.routedEventModel) {
                var d1 = newValue.__triggerRoutedEventOnVM.register(this._onModelRoutedEvent, this);
                this.__woBag[modelRoutedEventKey] = this.registerDisposable(d1);
            }
        }
        
        this.onModelChanged(oldValue, newValue);
    };
        
    // virtual
    view.prototype.onModelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="oldValue" type="Any" optional="false">The old model</param>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>        
    };
    
    view.prototype._onModelRoutedEvent = function (eventArgs) {
        ///<summary>When the model of this class fires a routed event, catch it and continue the traversal upwards</summary>
        ///<param name="eventArgs" type="wo.routedEventArgs" optional="false">The routed event args</param>
        
        if(!(eventArgs.routedEvent instanceof wipeout.base.routedEvent)) throw "Invaid routed event";
        
        this.triggerRoutedEvent(eventArgs.routedEvent, eventArgs.eventArgs);
    };

    return view;
});



Class("wipeout.debug", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    return {
        renderedItems: function(rootNode /*optional*/, renderedItemType /*optional*/) {
            
            var values = [], vm;
            var recursive = function(node) {
                if(node) {
                    switch(node.nodeType) {
                        case 1:
                            enumerate(node.childNodes, recursive);
                        case 8:
                            if((vm = wipeout.utils.html.getViewModel(node)) &&
                               values.indexOf(vm) === -1 &&
                              (!renderedItemType || vm.constructor === renderedItemType)) {
                                values.push(vm);
                            }
                    }
                }
            };
            
            recursive(rootNode || document.getElementsByTagName("body")[0]);
            return values;
        }
    }
});

Class("wipeout.settings", function() {
    function settings (settings) {
        enumerate(wipeout.settings, function(a,i) {
            delete wipeout.settings[i];
        });
        
        enumerate(settings, function(setting, i) {
            wipeout.settings[i] = setting;
        });        
    }

    settings.suppressWarnings = false;
    settings.asynchronousTemplates = true;
    settings.htmlAsyncTimeout = 10000;
    
    return settings;
});


Class("wipeout.base.contentControl", function () {    

    var contentControl = wipeout.base.view.extend(function (templateId, model) {
        ///<summary>Expands on visual and view functionality to allow the setting of anonymous templates</summary>
        ///<param name="templateId" type="string" optional="true">The template id. If not set, defaults to a blank template</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        this._super(templateId || wipeout.base.visual.getBlankTemplateId(), model);

        ///<Summary type="ko.observable" generic0="string">The template which corresponds to the templateId for this item</Summary>
        this.template = contentControl.createTemplatePropertyFor(this.templateId, this);
    }, "contentControl");    
    
    contentControl.createTemplatePropertyFor = function(templateIdObservable, owner) {
        ///<summary>Creates a computed for a template property which is bound to the templateIdObservable property</summary>
        ///<param name="templateIdObservable" type="ko.observable" generic0="String" optional="false">The observable containing the templateId to create a template property for</param>
        ///<param name="owner" type="Object" optional="false">The new owner of the created template property</param>
        ///<returns type="String">A template property bound to the template id</returns>
        var output = ko.dependentObservable({
            read: function () {
                var script = document.getElementById(templateIdObservable());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                templateIdObservable(wipeout.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: owner
        });
        
        if(owner instanceof wipeout.base.visual)
            owner.registerDisposable(output);
        
        return output;
    };
    
    var dataTemplateHash = "data-templatehash";  
    var tmp = (function () {
        
        var getTemplateArea = (function() {
            var templateArea = null;
            return function() {
                if(!templateArea) {
                    templateArea = wipeout.utils.html.createElement("<div style='display: none'></div>");
                    document.body.appendChild(templateArea);
                }
                
                return templateArea;
            };
        })();
        
        var i = Math.floor(Math.random() * 1000000000); 
        
        return { 
            create: function (templateString, forceCreate) {
                ///<summary>Creates an anonymous template within the DOM and returns its id</summary>
                ///<param name="templateString" type="String" optional="false">Gets a template id for an anonymous template</param>
                ///<param name="forceCreate" type="Boolean" optional="true">Force the creation of a new template, regardless of whether there is an existing clone</param>
                ///<returns type="String">The template id</returns>
                
                var templateArea = getTemplateArea();

                templateString = trim(templateString || "");
                var hash = contentControl.hashCode(templateString).toString();

                if(!forceCreate) {
                    // if we can, reuse an existing anonymous template
                    for (var j = 0, jj = templateArea.childNodes.length; j < jj; j++) {
                        if (templateArea.childNodes[j].nodeType === 1 &&
                        templateArea.childNodes[j].nodeName === "SCRIPT" &&
                        templateArea.childNodes[j].id &&
                        // first use a hash to avoid computationally expensive string compare if possible
                        templateArea.childNodes[j].attributes[dataTemplateHash] &&
                        templateArea.childNodes[j].attributes[dataTemplateHash].nodeValue === hash &&
                        templateArea.childNodes[j].innerHTML === templateString) {
                            return templateArea.childNodes[j].id;
                        }
                    }
                }

                var id = "AnonymousTemplate" + (++i);
                contentControl.createTemplate(id, templateString, hash);
                return id;
            },
            del: function(templateId) {
                ///<summary>Deletes an anonymous template with the given id</summary>
                ///<param name="templateId" type="String" optional="false">The id of the template to delete</param>
                ///<returns type="void"></returns>
                var templateArea = getTemplateArea();
            
                for (var j = 0; j < templateArea.childNodes.length; j++) {
                    if (templateArea.childNodes[j].nodeType === 1 &&
                    templateArea.childNodes[j].nodeName === "SCRIPT" &&
                    templateArea.childNodes[j].id === templateId) {
                        templateArea.removeChild(templateArea.childNodes[j]);
                        j--;
                    }
                }
            },
            createTemplate: function(templateId, template, templateHash) {
                ///<summary>Create a template and add it to the DOM</summary>
                ///<param name="templateId" type="String" optional="false">The id for the new template</param>
                ///<param name="template" type="String" optional="false">The template itself</param>
                ///<param name="templateHash" type="String" optional="true">A hash for the template</param>                
                ///<returns type="String">A template property bound to the template id</returns>
                if(contentControl.templateExists(templateId))
                    throw "Template: \"" + templateId + "\" already exists";

                var templateArea = getTemplateArea();

                var script = document.createElement("script");
                
                var att1 = document.createAttribute("type");
                att1.value = "text/xml";
                script.setAttributeNode(att1);

                var att2 = document.createAttribute("id");
                att2.value = templateId;
                script.setAttributeNode(att2);
                
                templateHash = templateHash || contentControl.hashCode(trim(template) || "").toString();                
                var att3 = document.createAttribute(dataTemplateHash);
                att3.value = templateHash;
                script.setAttributeNode(att3);
                
                script.textContent = template;
                templateArea.appendChild(script);
            }
        };
    })();  
    
    contentControl.createAnonymousTemplate = tmp.create;
    contentControl.deleteAnonymousTemplate = tmp.del;
    contentControl.createTemplate = tmp.createTemplate;
    contentControl.templateExists = function(templateId) {
        ///<summary>Describs whether a template exists</summary>
        ///<param name="templateId" type="String" optional="false">The id of the template</param>
        ///<returns type="Boolean"></returns>
        
        return !!document.getElementById(templateId);
    };

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    contentControl.hashCode = function (str) {        
        ///<summary>Creates a rough has code for the given string</summary>
        ///<param name="str" type="String" optional="false">The string to hash</param>
        ///<returns type="Number">The hash code</returns>
        var hash = 0;
        for (var i = 0, ii = str.length; i < ii; i++) {
            var ch = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash;
    };
    
    return contentControl;
});


var wipeout = wipeout || {};
wipeout.base = wipeout.base || {};

Class("wipeout.base.eventRegistration", function () {
    
    return wipeout.base.disposable.extend(function(callback, context, dispose) {
        ///<summary>On object containing event registration details</summary>
        ///<param name="callback" type="Any" optional="false">The event logic</param>
        ///<param name="context" type="Any" optional="true">The context of the event logic</param>
        ///<param name="dispose" type="Function" optional="false">A dispose function</param>
        ///<param name="priority" type="Number">The event priorty. The lower the priority number the sooner the callback will be triggered.</param>
        this._super(dispose);    
               
        ///<Summary type="Function">The callback to use when the event is triggered</Summary>
        this.callback = callback;
        
        ///<Summary type="Any">The context to usse with the callback when the event is triggered</Summary>
        this.context = context;                
    }, "eventRegistration");
});

Class("wipeout.base.event", function () {
    
    var event = function() {
        ///<summary>Defines a new event with register and trigger functinality</summary>
        
        // allow for non use of the new key word
        if(!(this instanceof event))
           return new event();
        
        ///<Summary type="Array" generic0="wipeout.base.eventRegistration">Array of callbacks to fire when event is triggered</Summary>
        this._registrations = [];
    };

    event.prototype.trigger = function(eventArgs) {
        ///<summary>Trigger the event, passing the eventArgs to each subscriber</summary>
        ///<param name="eventArgs" type="Any" optional="true">The arguments to pass to event handlers</param>
        
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
            if(eventArgs instanceof wipeout.base.routedEventArgs && eventArgs.handled) return;
            
            this._registrations[i].callback.call(this._registrations[i].context, eventArgs);
        }
    };
    
    event.prototype.unRegister = function (callback, context /* optional */) {
        ///<summary>Un subscribe to an event. The callback and context must be the same as those passed in the original registration</summary>
        ///<param name="callback" type="Function" optional="false">The callback to un-register</param>
        ///<param name="context" type="Any" optional="true">The original context passed into the register function</param>
        
        context = context == null ? window : context;
        for(var i = 0; i < this._registrations.length; i++) {
            if(this._registrations[i].callback === callback && this._registrations[i].context === context) {
                this._registrations.splice(i, 1);
                i--;
            }
        }
    }
    
    event.prototype.dispose = function() {
        ///<summary>Dispose of the event</summary>
        this._registrations.length = 0;
    }
    
    event.prototype.register = function(callback, context, priority) {
        ///<summary>Subscribe to an event</summary>
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="context" type="Any" optional="true">The context "this" to use within the calback</param>
        ///<param name="priority" type="Number" optional="true">The event priorty. The lower the priority number the sooner the callback will be triggered. The default is 0</param>
        ///<returns type="wo.eventRegistration">An object with the details of the registration, including a dispose() function</returns>
        
        if(!(callback instanceof Function))
            throw "Invalid event callback";
        
        if(priority && !(priority instanceof Number))
            throw "Invalid event priority";
        
        var reg = this._registrations;
        var evnt = { 
            priority: priority || 0,
            callback: callback, 
            context: context == null ? window : context,
            dispose: function() {
                var index = reg.indexOf(evnt);
                if(index >= 0)
                    reg.splice(index, 1);
            }
        };
        
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
            if(evnt.priority < this._registrations[i].priority) {
                this._registrations.splice(i, 0, evnt);
                break;
            }
        }
        
        if(i === ii)
            this._registrations.push(evnt);
        
        return new wipeout.base.eventRegistration(evnt.callback, evnt.context, evnt.dispose, evnt.priority);
    };
    
    return event;
});


Class("wipeout.base.if", function () {
 
    var sc = true;
    var staticConstructor = function () {
        if (!sc) return;
        sc = false;
        
        _if.blankTemplateId = wipeout.base.contentControl.createAnonymousTemplate("", true);
    };
    
    var _if = wipeout.base.contentControl.extend(function (templateId, model) {
        ///<summary>The if class is a content control which provides the functionality of the knockout if binding</summary> 
        ///<param name="templateId" type="String" optional="true">The template id. If not set, defaults to a blank template</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        
        staticConstructor();
        
        this._super(templateId, model);

        ///<Summary type="Boolean">Specifies whether this object should be used as a binding context. If true, the binding context of this object will be it's parent. Default is true</Summary>
        this.shareParentScope = true;
        
        ///<Summary type="ko.observable" generic0="Boolean">if true, the template will be rendered, otherwise a blank template is rendered</Summary>
        this.condition = ko.observable();
        
        ///<Summary type="ko.observable" generic0="String">the template to render if the condition is false. Defaults to a blank template</Summary>
        this.elseTemplateId = ko.observable(_if.blankTemplateId);
        
        var d1 = this.elseTemplateId.subscribe(this.elseTemplateChanged, this);
        this.registerDisposable(d1);
        
        ///<Summary type="ko.observable" generic0="String">Anonymous version of elseTemplateId</Summary>
        this.elseTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.elseTemplateId, this);
        
        ///<Summary type="String">Stores the template id if the condition is false</Summary>
        this.__cachedTemplateId = this.templateId();
        
        var d2 = this.condition.subscribe(this.onConditionChanged, this);
        this.registerDisposable(d2);
        
        var d3 = this.templateId.subscribe(this.copyTemplateId, this);
        this.registerDisposable(d3);
        
        this.copyTemplateId(this.templateId());
    }, "_if");
    
    _if.prototype.elseTemplateChanged = function (newVal) {
        ///<summary>Resets the template id to the else template if condition is not met</summary>  
        ///<param name="newVal" type="String" optional="false">The else template Id</param>   
        if (!this.condition()) {
            this.templateId(newVal);
        }
    };
    
    _if.prototype.onConditionChanged = function (newVal) {
        ///<summary>Set the template based on whether the condition is met</summary>      
        ///<param name="newVal" type="Boolean" optional="false">The condition</param>   
        if (this.__oldConditionVal && !newVal) {
            this.templateId(this.elseTemplateId());
        } else if (!this.__oldConditionVal && newVal) {
            this.templateId(this.__cachedTemplateId);
        }
        
        this.__oldConditionVal = !!newVal;
    };
    
    _if.prototype.copyTemplateId = function (templateId) {
        ///<summary>Cache the template id and check whether correct template is applied</summary>  
        ///<param name="templateId" type="String" optional="false">The template id to cache</param>      
        if (templateId !== this.elseTemplateId())
            this.__cachedTemplateId = templateId;
    
        if (!this.condition() && templateId !== this.elseTemplateId()) {
            this.templateId(this.elseTemplateId());
        }
    };
    
    return _if;
});


Class("wipeout.base.itemsControl", function () {
    
    var deafaultTemplateId;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wipeout.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>");  
    };
    
    var itemsControl = wipeout.base.contentControl.extend(function (templateId, itemTemplateId, model) {
        ///<summary>Bind a list of models (itemSource) to a list of view models (items) and render accordingly</summary>
        ///<param name="templateId" type="String" optional="true">The template id. If not set, defaults to a div to render items</param>
        ///<param name="itemTemplateId" type="String" optional="true">The initial template id for each item</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        
        staticConstructor();
        this._super(templateId || deafaultTemplateId, model);

        ///<Summary type="ko.observable" generic0="String">The id of the template to render for each item</Summary>
        this.itemTemplateId = ko.observable(itemTemplateId);

        ///<Summary type="ko.observable" generic0="String">The template which corresponds to the itemTemplateId for this object</Summary>
        this.itemTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.itemTemplateId, this);
        
        ///<Summary type="ko.observableArray" generic0="Any">An array of models to render</Summary>
        this.itemSource = ko.observableArray([]);
        
        ///<Summary type="ko.observable" generic0="wo.view">An array of viewmodels, each corresponding to a mode in the itemSource property</Summary>
        this.items = ko.observableArray([]);

        if(wipeout.utils.ko.version()[0] < 3) {
            itemsControl._subscribeV2.call(this);
        } else {
            itemsControl._subscribeV3.call(this);
        }
        
        var d1 = this.items.subscribe(this._syncModelsAndViewModels, this);
        this.registerDisposable(d1);

        itemTemplateId = this.itemTemplateId.peek();
        var d2 = this.itemTemplateId.subscribe(function (newValue) {
            if (itemTemplateId !== newValue) {
                try {
                    this.reDrawItems();
                } finally {
                    itemTemplateId = newValue;
                }
            }
        }, this);
        this.registerDisposable(d2);
    }, "itemsControl");
    
    itemsControl._subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl</summary>
        var initialItemSource = this.itemSource.peek();
        
        var d1 = this.itemSource.subscribe(function() {
            try {
                if(this._modelsAndViewModelsAreSynched())
                    return;
                this._itemSourceChanged(ko.utils.compareArrays(initialItemSource, arguments[0] || []));
            } finally {
                initialItemSource = wipeout.utils.obj.copyArray(arguments[0] || []);
            }
        }, this);
        this.registerDisposable(d1);
        
        var initialItems = this.items.peek();
        var d2 = this.items.subscribe(function() {
            try {
                this._itemsChanged(ko.utils.compareArrays(initialItems, arguments[0] || []));
            } finally {
                initialItems = wipeout.utils.obj.copyArray(arguments[0] || []);
            }
        }, this);
        this.registerDisposable(d2);
    };
    
    itemsControl._subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        var d1 = this.itemSource.subscribe(this._itemSourceChanged, this, "arrayChange");
        this.registerDisposable(d1);
        
        var d2 = this.items.subscribe(this._itemsChanged, this, "arrayChange");
        this.registerDisposable(d2);
        
    };
    
    itemsControl.prototype._initialize = function(propertiesXml, parentBindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        ///<param name="propertiesXml" type="Element" optional="false">An XML element containing property setters for the view</param>
        ///<param name="parentBindingContext" type="ko.bindingContext" optional="false">The binding context of the wipeout node just above this one</param>
    
        if(propertiesXml) {        
            var prop = propertiesXml.getAttribute("shareParentScope");
            if(prop && parseBool(prop))
                throw "A wo.itemsControl cannot share it's parents scope.";
        }
        
        this._super(propertiesXml, parentBindingContext);
    };
    
    itemsControl.prototype._syncModelsAndViewModels = function() {
        ///<summary>Ensures that the itemsSource array and items array are in sync</summary>
        var changed = false, modelNull = false;
        var models = this.itemSource();
        if(models ==  null) {
            modelNull = true;
            models = [];
        }
        
        var viewModels = this.items();
        
        if(models.length !== viewModels.length) {
            changed = true;
            models.length = viewModels.length;
        }
        
        for(var i = 0, ii = viewModels.length; i < ii; i++) {
            if(viewModels[i].model() !== models[i]) {
                models[i] = viewModels[i].model();
                changed = true;
            }
        }
        
        if(changed) {
            if(modelNull)
                this.itemSource(models);
            else
                this.itemSource.valueHasMutated();
        }
    };

    itemsControl.prototype._modelsAndViewModelsAreSynched = function() {
        ///<summary>Returns whether all models have a corresponding view model at the correct index</summary>
        ///<returns type="Boolean"></summary>
        var model = this.itemSource() || [];
        var viewModel = this.items() || [];
        
        if(model.length !== viewModel.length)
            return false;
        
        for(var i = 0, ii = model.length; i < ii; i++) {
            if(model[i] !== viewModel[i].model())
                return false;
        }
        
        return true;
    };

    itemsControl.prototype._itemsChanged = function (changes) { 
        ///<summary>Runs onItemDeleted and onItemRendered on deleted and created items respectively</summary>
        ///<param name="changes" type="Array" generic0="wo.view" optional="false">A knockout diff of changes to the items</param>
        
        enumerate(changes, function(change) {
            if(change.status === wipeout.utils.ko.array.diff.deleted && change.moved == null)
                this.onItemDeleted(change.value);
            else if(change.status === wipeout.utils.ko.array.diff.added && change.moved == null)
                this.onItemRendered(change.value);
        }, this);
    };

    itemsControl.prototype._itemSourceChanged = function (changes) { 
        ///<summary>Adds, removes and moves view models depending on changes to the models array</summary>
        ///<param name="changes" type="Array" optional="false">A knockout diff of changes to the itemSource</param>
        var items = this.items();
        var del = [], add = [], move = {}, delPadIndex = 0;
        for(var i = 0, ii = changes.length; i < ii; i++) {
            if(changes[i].status === wipeout.utils.ko.array.diff.retained) continue;            
            else if(changes[i].status === wipeout.utils.ko.array.diff.deleted) {
                del.push((function(change) {
                    return function() {
                        var removed = items.splice(change.index + delPadIndex, 1)[0];
                        if(change.moved != null)
                            move[change.moved + "." + change.index] = removed;
                        
                        delPadIndex--;
                    };
                })(changes[i]));
            } else if(changes[i].status === wipeout.utils.ko.array.diff.added) {
                add.push((function(change) {
                    return function() {
                        var added = change.moved != null ? move[change.index + "." + change.moved] : this._createItem(change.value);
                        items.splice(change.index, 0, added);
                    };
                })(changes[i]));
            } else {
                throw "Unsupported status";
            }
        }
        
        for(i = 0, ii = del.length; i < ii; i++) {
            del[i].call(this);
        }
        
        for(i = 0, ii = add.length; i < ii; i++) {
            add[i].call(this);
        }
        
        this.items.valueHasMutated();
    };
    
    //virtual
    itemsControl.prototype.onItemRendered = function (item) {
        ///<summary>Called after a new item items control is rendered</summary>
        ///<param name="item" type="wo.view" optional="false">The item rendered</param>
    };
    
    itemsControl.prototype.dispose = function () {
        ///<summary>Dispose of the items control and its items</summary>
        enumerate(this.items(), function(i) {
            i.dispose();
        });
        
        this._super();
    };    
    
    //virtual
    itemsControl.prototype.onItemDeleted = function (item) {
        ///<summary>Disposes of deleted items</summary> 
        ///<param name="item" type="wo.view" optional="false">The item deleted</param>  
        
        item.dispose();
    };

    itemsControl.prototype._createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        ///<param name="model" type="Any" optional="false">The model for the view to create</param>
        ///<returns type="wo.view">The newly created item</returns>
        
        var item = this.createItem(model);
        item.__woBag.createdByWipeout = true;
        return item;
    };

    // virtual
    itemsControl.prototype.createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        ///<param name="model" type="Any" optional="false">The model for the view to create</param>
        ///<returns type="wo.view">The newly created item</returns>
        return new wipeout.base.view(this.itemTemplateId(), model);        
    };

    itemsControl.prototype.reDrawItems = function () {
        ///<summary>Destroys and re-draws all view models</summary>
        var models = this.itemSource() || [];
        var values = this.items();
        values.length = models.length;
        for (var i = 0, ii = models.length; i < ii; i++) {
            values[i] = this._createItem(models[i]);
        }

        this.items.valueHasMutated();
    };

    return itemsControl;
});


Class("wipeout.base.routedEvent", function () {
    
    var routedEvent = function() {
        ///<summary>A routed event is triggerd on a visual and travels up to ancestor visuals all the way to the root of the application</summary>
    };

    routedEvent.prototype.trigger = function(triggerOnVisual, eventArgs) {
        ///<summary>Trigger a routed event on a visual</summary>
        ///<param name="triggerOnVisual" type="wo.visual" optional="false">The visual where the routed event starts</param>
        ///<param name="eventArgs" type="Any" optional="true">The event args to bubble up with the routed event</param>
        
        triggerOnVisual.triggerRoutedEvent(this, new wipeout.base.routedEventArgs(eventArgs, triggerOnVisual));
    };
    
    routedEvent.prototype.unRegister = function (callback, triggerOnVisual, context /* optional */) {
        ///<summary>Unregister a routed event on a visual</summary>
        ///<param name="callback" type="Function" optional="false">The callback to un-register</param>
        ///<param name="triggerOnVisual" type="wo.visual" optional="false">The visual passed into the register function</param>
        ///<param name="context" type="Any" optional="true">The original context passed into the register function</param>
        ///<returns type="Boolean">Whether the event registration was found or not</returns>         
        return triggerOnVisual.unRegisterRoutedEvent(this, callback, context);
    };
    
    routedEvent.prototype.register = function(callback, triggerOnVisual, context /* optional */) {
        ///<summary>Register a routed event on a visual</summary>
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="triggerOnVisual" type="wo.visual" optional="false">The visual registered to the routed event</param>
        ///<param name="context" type="Any" optional="true">The context "this" to use within the callback</param>
        ///<returns type="wo.eventRegistration">A dispose function</returns>         
        
        return triggerOnVisual.registerRoutedEvent(this, callback, context);
    };
    
    return routedEvent;
});

Class("wipeout.base.routedEventArgs", function () {
    
    var routedEventArgs = function(eventArgs, originator) { 
        ///<summary>Arguments passed to routed event handlers. Set handled to true to stop routed event propogation</summary>
        ///<param name="eventArgs" type="Any" optional="true">The inner event args</param>
        ///<param name="originator" type="Any" optional="false">A pointer to event raise object</param>
        
        ///<Summary type="Boolean">Signals whether the routed event has been handled and should not propagate any further</Summary>
        this.handled = false;
        
        ///<Summary type="Any">The original event args used when the routedEvent has been triggered</Summary>
        this.data = eventArgs;
        
        ///<Summary type="Any">The object which triggered the event</Summary>
        this.originator = originator;
    };
    
    return routedEventArgs;
});
    

Class("wipeout.base.routedEventRegistration", function () {
    
    var routedEventRegistration = function(routedEvent) {  
        ///<summary>Holds routed event registration details</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        
        ///<Summary type="wo.routedEvent">The routed event</Summary>
        this.routedEvent = routedEvent;
        
        ///<Summary type="wo.event">An inner event to handler triggering callbacks</Summary>
        this.event = new wipeout.base.event();        
    };
    
    routedEventRegistration.prototype.dispose = function() {
        ///<summary>Dispose of the callbacks associated with this registration</summary>
        this.event.dispose();
    };
    
    return routedEventRegistration;
});


Class("wipeout.base.routedEventModel", function () {
    
    
    var routedEventModel = wipeout.base.object.extend(function () {
        ///<summary>The base class for models if they wish to invoke routed events on their viewModel</summary>
        
        ///<Summary type="wo.event">The even twhich will trigger a routed event on the owning view</Summary>
        this.__triggerRoutedEventOnVM = new wipeout.base.event();
    }, "routedEventModel");
        
    routedEventModel.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event which will propogate to any view models where this object is it's model and continue to bubble from there</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to trigger</param>
        ///<param name="eventArgs" type="Any" optional="true">The routed event args</param>
        
        // Used by wo.model to acertain when a routed event should be fired
        this.__triggerRoutedEventOnVM.trigger({routedEvent: routedEvent, eventArgs: eventArgs});
    };
    
    return routedEventModel;
});


Class("wipeout.bindings.bindingBase", function () {
        
    var bindingBase = wipeout.base.disposable.extend(function(element) {
        ///<summary>A knockout binding</summary>   
        ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>

        this._super();

        if(!element)
            throw "ArgumnetNullException";

        ///<Summary type="String">the binding id</Summary>
        this.bindingId = wipeout.bindings.bindingBase.uniqueId();
        
        ///<Summary type="Object">metadata for the binding</Summary>
        this.bindingMeta = {};
        
        ///<Summary type="Node">the element to bind to</Summary>
        this.element = element;
        if(!this.getParentElement())
            throw "Cannot apply a \"wipeout.bindings.bindingBase\" binding on an element without a parent node.";
        
        var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
        if(!bindings)
            bindings = wipeout.utils.domData.set(this.element, wipeout.bindings.bindingBase.dataKey, []);

        enumerate(bindings, function(binding) {
            if(binding.bindingMeta.controlsDescendantBindings)
                throw "There is already a binding on this element which controls children.";
        });

        bindings.push(this);

        wipeout.bindings.bindingBase.registered[this.bindingId] = this;

        ///<Summary type="HTMLElement">the parent of the element to bind to</Summary>
        this.parentElement = this.getParentElement();
        
        this.moved(null, this.parentElement);
    }, "bindingBase");
    
    bindingBase.getParentElement = function(element) {
        ///<summary>Get the parent element of a node. (browser safe)</summary>
        ///<param name="element" type="HTMLElement" optional="false">The node to get the parent of</param>
        ///<returns type="HTMLElement">The node to get the parent of</returns>
        
        // IE sometimes has null for parent element of a comment
        return element.parentElement || element.parentNode;
    };
    
    bindingBase.prototype.getParentElement = function() {
        ///<summary>Get the parent element of a node this.element. (browser safe)</summary>
        ///<returns type="HTMLElement">The node to get the parent of</returns>
        
        // IE sometimes has null for parent element of a comment
        return bindingBase.getParentElement(this.element);
    };
    
    bindingBase.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary>
        
        this._super();

        this.moved(this.parentElement, null);

        var i;
        var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
        while((i = bindings.indexOf(this)) !== -1)
            bindings.splice(i, 1);

        delete this.element;
        delete this.parentElement;
        delete wipeout.bindings.bindingBase.registered[this.bindingId];
    };
    
    bindingBase.prototype.checkHasMoved = function() {
        ///<summary>Check whether the element that this binding is on has moved</summary>
        ///<returns type="Boolean">The node to get the parent of</returns>
        
        return this.getParentElement() !== this.parentElement;
    };
    
    bindingBase.prototype.hasMoved = function() {
        ///<summary>Perform actions if the element that this binding is on has moved</summary>
        
        if(this.checkHasMoved()) {
            this.moved(this.parentElement, this.getParentElement());
            this.parentElement = this.getParentElement();
        }
    };
    
    // virtual
    bindingBase.prototype.moved = function(oldParentElement, newParentElement) {
        ///<summary>Perform actions after the element that this binding is on has moved</summary>
        ///<param name="oldParentElement" type="HTMLElement" optional="false">The old parent element</param>
        ///<param name="newParentElement" type="HTMLElement" optional="false">The new parent element</param>
    };
    
    // a placeholder for all bindings
    bindingBase.registered = {};
    
    bindingBase.uniqueId = (function () {
        var i = Math.floor(Math.random() * 1000000000); 
        return function () {
            ///<summary>Returns a unique Id for a view</summary>    
            ///<returns type="String"></returns>

            return "binding-" + (++i);
        };
    })();
    
    bindingBase.getBindings = function(node, bindingType) {
        ///<summary>Get all bindings on a node and it's decendant elements. Does not return bindings of element which control their own decendant bindings</summary>
        ///<param name="node" type="HTMLElement" optional="false">The element to get bindings from</param>
        ///<param name="bindingType" type="Function" optional="true">The type of binding to find</param>
        ///<returns type="Array" generic0="wipeout.base.bindingBase">The node to get the parent of</returns>
        
        if(bindingType && !(bindingType instanceof Function)) throw "Invalid binding type";

        var stop = false;
        var bindings = [];
        enumerate(wipeout.utils.domData.get(node, wipeout.bindings.bindingBase.dataKey), function(binding) {
            if(!bindingType || binding instanceof bindingType) {
                bindings.push(binding);
                stop |= binding.bindingMeta.controlsDescendantBindings;
            }
        });

        if(!stop) {
            wipeout.utils.ko.enumerateOverChildren(node, function(child) {
                enumerate(wipeout.bindings.bindingBase.getBindings(child, bindingType), function(binding) {
                    bindings.push(binding);
                });
            });
        }

        return bindings;                
    };
    
    // the key for bindings
    bindingBase.dataKey = "wipeout.bindings.bindingBase";
    
    //TODO: can I put in a generic init function?
    
    return bindingBase;
});


Binding("itemsControl", true, function () {
    
    var itemsControlTemplate = "";
    
    var itemsTemplate = null;
    var staticConstructor = function() {
              
        if(itemsTemplate) return;
        var tmp = "<!-- ko ic-render: null";
        if(DEBUG) 
            tmp += ", wipeout-type: 'items[' + wipeout.utils.ko.peek($index) + ']'";

        tmp += " --><!-- /ko -->";
        
        if(itemsTemplate) return;
        itemsTemplate = wipeout.base.contentControl.createAnonymousTemplate(tmp);
    };
    
    var test = function(viewModel) {
        var ic = wipeout.utils.ko.peek(viewModel);
        if(ic && !(ic instanceof wipeout.base.itemsControl)) throw "This binding can only be used on an itemsControl";
    }
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the itemsControl binding</summary>
        
        test(viewModel);        
        staticConstructor();
        return ko.bindingHandlers.template.init.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the itemsControl binding</summary>
        
        test(viewModel);
        return ko.bindingHandlers.template.update.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var utils = {
        createAccessor: function(vm) {
            ///<summary>Create a value accessor for the template binding</summary>
            vm = wipeout.utils.ko.peek(vm);
            return function() {
                return {
                    name: itemsTemplate,
                    foreach: vm.items,
                    templateEngine: wipeout.template.engine.instance
                };
            }
        }        
    };
    
    return {
        init: init,
        update: update,
        utils: utils
    };
});

Binding("ic-render", true, function () {
    
    return {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            ///<summary>Initialize the ic-render binding</summary>
            
            var binding = new wipeout.bindings.render(element, bindingContext.$data, allBindingsAccessor, bindingContext.$parentContext.extend({$index:bindingContext.$index}));                
            binding.render(wipeout.utils.ko.peek(bindingContext.$data));
        }
    };
});

Binding("render", true, function () {
    
    var render = wipeout.bindings.bindingBase.extend(function(element, value, allBindingsAccessor, bindingContext) { 
        ///<summary>A knockout binding to render a wo.view</summary>
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="value" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        this._super(element);

        ///<Summary type="Object">metadata for the binding</Summary>
        this.bindingMeta = ko.bindingHandlers.template.init(this.element, wipeout.bindings.render.createValueAccessor(value), allBindingsAccessor, null, bindingContext);
        
        ///<Summary type="Function">Other bindings on the element</Summary>
        this.allBindingsAccessor = allBindingsAccessor;
        
        ///<Summary type="ko.bindingContext">The binding context</Summary>
        this.bindingContext = bindingContext;

        if(ko.isObservable(value)) {
            var val = value.peek();
            this.subscribed = value.subscribe(function(newVal) {
                if(newVal === val)
                    return;

                try {
                    this.reRender(newVal);
                } finally {
                    val = newVal;
                }
            }, this);
        }
    }, "render");
    
    render.prototype.moved = function(oldParentElement, newParentElement) {
        ///<summary>Perform actions after the element that this binding is on has moved</summary>
        ///<param name="oldParentElement" type="HTMLElement" optional="false">The old parent element</param>
        ///<param name="newParentElement" type="HTMLElement" optional="false">The new parent element</param>
        
        this._super(oldParentElement, newParentElement);
        if(DEBUG && !wipeout.settings.suppressWarnings && this.value) {
            for(var i = 0, ii = this.value.__woBag.nodes.length; i < ii; i++) {
                if(wipeout.utils.ko.parentElement(this.value.__woBag.nodes[i]) !== this.value.__woBag.rootHtmlElement) {
                    console.warn("Only part of this view model was moved. Un moved nodes will be deleted or orphaned with their bindings cleared when this view model is re-rendered or disposed.");
                    break;
                }
            };
        }
    };
    
    render.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary>

        this.unRender();

        this._super();     

        if(this.subscribed) {
            this.subscribed.dispose();
            delete this.subscribed;
        }            
    };
    
    render.prototype.reRender = function(value) {
        ///<summary>Re render the value</summary>
        ///<param name="value" type="wo.view" optional="false">The value to render</param>
        
        this.unRender();
        this.render(value);
    };
    
    render.prototype.unTemplate = function() {
        ///<summary>Removes and disposes (if necessary) of all of the children of the visual</summary>

        if(!this.value) return;

        // delete all template items
        enumerate(this.value.templateItems, function(item, i) {            
            delete this.value.templateItems[i];
        }, this);

        // clean up all child nodes
        var oc, child = ko.virtualElements.firstChild(this.element);
        while (child) {
            oc = child;
            child = ko.virtualElements.nextSibling(child);
            wipeout.utils.html.cleanNode(oc);
            wipeout.bindings.bindingBase.getParentElement(oc).removeChild(oc);
        }

        // clear references to html nodes in view
        this.value.__woBag.nodes.length = 0;
    };
    
    render.prototype.unRender = function() {
        ///<summary>Un renders all of the content of the binding</summary>

        if(!this.value) return;

        this.unTemplate();
        this.value.onUnrender();
        if(this.value.__woBag.rootHtmlElement) {
            // disassociate the visual from its root element and empty the root element
            wipeout.utils.domData.set(this.value.__woBag.rootHtmlElement, wipeout.bindings.wipeout.utils.wipeoutKey, undefined); 
            delete this.value.__woBag.rootHtmlElement;
        }

        if(this.templateChangedSubscription)
            this.value.disposeOf(this.templateChangedSubscription);

        this.value.disposeOf(this.onDisposeEventSubscription);

        delete this.onDisposeEventSubscription;
        delete this.value;
        delete this.templateChangedSubscription;
    };
    
    render.prototype.render = function (newVal) {
        ///<summary>Render a given value</summary>
        ///<param name="newVal" type="wo.view" optional="false">The value to render</param>
        
        if(this.value || this.templateChangedSubscription)
            throw "This binding is already rendering a visual. Call unRender before rendering again.";

        if(!(this.value = newVal))
            return;

        if (!(this.value instanceof wipeout.base.visual))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";

        if (this.value.__woBag.rootHtmlElement)
            throw "This visual has already been rendered. Call its unRender() function before rendering again.";

        wipeout.utils.domData.set(this.element, wipeout.bindings.wipeout.utils.wipeoutKey, this.value);
        this.value.__woBag.rootHtmlElement = this.element;

        var subscription1 = this.value.__woBag.disposed.register(this.unRender, this);
        this.onDisposeEventSubscription = this.value.registerDisposable(subscription1);

        var subscription2 = this.value.templateId.subscribe(this.onTemplateChanged, this);
        this.templateChangedSubscription = this.value.registerDisposable(subscription2);
        this.onTemplateChanged(this.value.templateId.peek());
    };
    
    render.prototype.onTemplateChanged = function(newVal) {
        ///<summary>Apply the template of the value to the binding element</summary>  
        ///<param name="newVal" type="wo.view" optional="false">The value to render</param>      
        
        var _this = this;
        function reRender() {
            if(_this.value && _this.value.templateId.peek() !== newVal) return;
            _this.doRendering();
        }

        this.unTemplate();

        if(newVal && wipeout.settings.asynchronousTemplates) {
            ko.virtualElements.prepend(this.element, wipeout.utils.html.createTemplatePlaceholder(this.value));
            wipeout.template.asyncLoader.instance.load(newVal, reRender);
        } else {
            reRender();
        }
    };
    
    render.prototype.doRendering = function() {
        ///<summary>Do the rendering</summary>  

        ko.bindingHandlers.template.update(this.element, wipeout.bindings.render.createValueAccessor(this.value), this.allBindingsAccessor, null, this.bindingContext);

        var bindings = this.allBindingsAccessor();
        if(bindings["wipeout-type"])
            wipeout.bindings["wipeout-type"].utils.comment(this.element, bindings["wipeout-type"]);
    };
    
    render.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="valueAccessor" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>

        var binding = new wipeout.bindings.render(element, valueAccessor(), allBindingsAccessor, bindingContext);                
        binding.render(wipeout.utils.ko.peek(valueAccessor()));
        return binding.bindingMeta;
    };
    
    render.createValueAccessor = function(value) {
        ///<summary>Create a value accessor for the knockout template binding.</summary>
        ///<param name="value" type="wo.view" optional="false">The value to render</param>      

        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            value = wipeout.utils.ko.peek(value);

            // use the knockout vanilla template engine to render nothing
            if(!(value instanceof wipeout.base.visual))
                 return {
                     name: wipeout.base.visual.getBlankTemplateId()
                 };

            var output = {
                templateEngine: wipeout.template.engine.instance,
                name: value.templateId.peek(),
                afterRender: function(nodes, context) {
                    var old = [];
                    enumerate(value.__woBag.nodes, function(node) {
                        old.push(node);
                    });

                    value.__woBag.nodes.length = 0;
                    enumerate(nodes || [], function(node) {
                        value.__woBag.nodes.push(node);
                    });                            

                    value.onRendered(old, nodes);
                }
            };

            // do not move this to upper definition, knokout regards undefined as a value in this case and will use it as the current binding context
            if(!value.shareParentScope)
                output.data = value;

            return output;
        };
    };
    
    return render;
});


Binding("wipeout-type", true, function () {
    
    var wipeoutTypeKey = "wipeout-type";    
    
    // placeholder for binding which does nothing    
    return {
        init: function() {
            ///<summary>Initialize the wipeout-type control binding. Calling this binding does not actually do anything. It is gererally called from the render binding</summary>
        },
        utils: {
            comment: function(element, text) {
                ///<summary>Initialize the wipeout-type control binding. This binding does not actually do anything</summary>
                text = wipeout.utils.ko.peek(text);
                
                if(element.nodeType === 1) {
                    if(element.childNodes.length)
                        element.insertBefore(document.createComment(text), element.childNodes[0]);
                    else
                        element.appendChild(document.createComment(text));
                } else if(element.nodeType === 8) {
                    var originalText;
                    if(!(originalText = ko.utils.domData.get(element, wipeoutTypeKey))) {
                        ko.utils.domData.set(element, wipeoutTypeKey, originalText = element.textContent);
                    }
                    
                    element.textContent = originalText + " wipeout-type: " + text;
                }
            }
        }
    };
});


Binding("wipeout", true, function () {
    
    var _wipeout = wipeout.bindings.render.extend(function(element, type, allBindingsAccessor, viewModel, bindingContext) {  
        ///<summary>Initialize the render binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="type" type="Function" optional="false">The type of the view model to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>

        if(!(type instanceof Function))
            throw "Invalid view type";

        ///<Summary type="wo.view">The view to render</Summary>
        this.renderedView = new type();
        if(!(this.renderedView instanceof wipeout.base.view))
            throw "Invalid view type";

        this._super(element, this.renderedView, allBindingsAccessor, bindingContext);

        if (this.renderedView.shareParentScope)
            throw "The root of an application cannot share its parents scope";

        this.renderedView.model(viewModel);                   
        this.render(this.renderedView);
        
        ///<Summary type="Function">The render method is overridden to prevent re-rendering</Summary>
        this.render = function() { throw "Cannont render this binding a second time, use the render binding instead"; };

        this.renderedView.onApplicationInitialized();
    }, "wipeout");
    
    _wipeout.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary> 
        
        this._super();
        this.renderedView.dispose();
    };
    
    _wipeout.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wipeout binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="valueAccessor" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        return new wipeout.bindings.wipeout(element, valueAccessor(), allBindingsAccessor, viewModel, bindingContext).bindingMeta;
    };
    
    _wipeout.utils = {
        wipeoutKey: "__wipeout"
    };
    
    return _wipeout;
});

// Render From Script
Binding("wo", true, function () {
    
    var wo = wipeout.bindings.render.extend(function(element, value, allBindingsAccessor, bindingContext) {
        ///<summary>Initialize the wo binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="value" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        var view = wo.create(value);
        this._super(element, view, allBindingsAccessor, bindingContext);
        view.__woBag.createdByWipeout = true;
        view._initialize(wipeout.template.engine.xmlCache[value.initXml], bindingContext);

        if(value.id) {
            var current = bindingContext;
            while(current.$data.shareParentScope)
                current = current.$parentContext;

            current.$data.templateItems[value.id] = view;
        }

        this.render(view);
        
        ///<Summary type="Function">The render method is overridden to prevent re-rendering</Summary>
        this.render = function() { throw "Cannot render this binding a second time, use the render binding instead"; };
    }, "wo");
    
    wo.prototype.dispose = function() {
        ///<summary>Diospose of this binding</summary> 
        
        this.removeFromParentTemplateItems();
        var value = this.value;
        this._super();
        value.dispose();
    };
    
    wo.prototype.removeFromParentTemplateItems = function() {
        ///<summary>Remove the rendered view from the template items of its parent</summary>
        
        if (this.parentElement && this.value.id) {
            wipeout.bindings.wo.removeFromParentTemplateItems(this.parentElement, this.value.id);
        }
    };
    
    wo.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wo binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="valueAccessor" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        return new wipeout.bindings.wo(element, valueAccessor(), allBindingsAccessor, bindingContext).bindingMeta;
    };
    
    wo.removeFromParentTemplateItems = function(parentElement, id) {
        ///<summary>Remove an item with the specified id from the template items of the closest wo.view to the parentElement which does not have shared parent scope</summary> 
        ///<param name="parentElement" type="HTMLElement" optional="false">The element to begin the search for the correct wo.view from</param>
        ///<param name="id" type="String" optional="false">The id of the element to delete</param>
        ///<returns type="Boolean">Whether a delete was performed</returns>
        
        var parent = wipeout.utils.html.getViewModel(parentElement);
        while (parent && parent.shareParentScope) {
            parent = parent.getParent();
        }

        if(parent)
            return delete parent.templateItems[id];
        
        return false;
    };
    
    wo.create = function(value) {
        ///<summary>Create an object from the output of the wo template engine</summary>
        ///<param name="value" type="Object" optional="false">The template engine output</param>
        ///<returns type="Any">An object</returns>
        
        if(!value.type) {
            throw "Cannot create an instance of \"" + value.name + "\"";
        }
        
        return new value.type();
    };
    
    return wo;
});

Class("wipeout.profile.profiler", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    var profiler = wipeout.base.object.extend(function(vm) {
        jQ();
        this.vm = vm;
        this.cssClass = "wipeout-profiler-" + profiler.newId();
    });
    
    profiler.createStyle = function() {
        if(profiler.style)
            return;
        
        profiler.style = document.createElement("style");     
        $("body").append(profiler.style);   
    };
    
    profiler.prototype.allNodes = function() {
        var $elements = $(wipeout.utils.html.getAllChildren(this.vm.__woBag.rootHtmlElement));
        return $elements.find('*').add($elements);
    };
    
    var eventNamespace = ".wipeoutProfiler";
    profiler.prototype.profile = function() {
        profiler.createStyle();
        
        var vm = this.vm;
        
        var _this = this;
        this.allNodes().addClass(_this.cssClass).on("click" + eventNamespace, function (e) {
                e.preventDefault();
                e.stopPropagation();

                wipeout.profile.utils.popup(wipeout.profile.utils.generateInfo(vm));
            });
        
        //profiler.style.innerHTML += "." + this.cssClass + " {background-color:#" + wipeout.profile.utils.generateColour() + " !important;}";
        profiler.style.innerHTML += "." + this.cssClass + " {background-color:#efcdd9 !important;}";
    };
    
    profiler.prototype.dispose = function() {
        // TODO: where nodeType = 1
        this.allNodes()
            .off("click" + eventNamespace)
            .removeClass(this.cssClass);
    };
        
    profiler.newId = (function () {
        var i = 0;
        return function() {
            return ++i;
        };
    })();
    
    function queue() {
        this.items = [];
    };
    
    queue.prototype.push = function(callback) {
        var _this = this;
        var cb = function() {
            
            _this.items.splice(_this.items.indexOf(cb), 1);
            
            callback();
                        
            if (_this.items.length)
                _this.items.splice(0, 1)[0](_this);
        };
        
        this.items.push(cb);
        
        if(this.items[0] === cb)
            cb();
    };
    
    profiler.profile = function() {
        var timeout;
        var q = new queue();
        var currentElement = null;
        var currentProfiler = {dispose: function(){}};
        $("body").on("mouseover", function(e) {
            if(!e.fromElement || currentElement === e.fromElement) return;
            
            currentElement = e.fromElement;
            var vm = wipeout.utils.html.getViewModel(currentElement);
            if(!vm || vm === currentProfiler.vm) return;
                        
            if(timeout) clearTimeout(timeout);
            
            // makes it less jumpy
            timeout = setTimeout(function() {
                // like thread.lock
                q.push(function() {
                    currentProfiler.dispose();
                    currentProfiler = new profiler(vm);
                    currentProfiler.profile();
                });
            }, 100);
        });
    };
    
    return profiler;
});

Class("wipeout.profile.utils", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    return {
        generateColour: function() {
            var red = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);
            var green = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);
            var blue = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);

            return red.toString(16) + green.toString(16) + blue.toString(16);
        },
        generateInfo: function(vm) {
            return vm.__woBag.rootHtmlElement.textContent;
        },
        popup: function(htmlString) {
            var $content = $('<div style="z-index: 100000; position: fixed; top: 10%; left: 10%; background-color: white; height: 80%; width: 80%">\
                <div>' + htmlString + '</div>\
                <button id="wipeoutProfileCloseButton">Close</button>\
            </div>');

            $content.find("#wipeoutProfileCloseButton").on("click", function() {
                $(this).parent().remove();
            });

            $("body").append($content[0]);
        }
    };
});

Class("wipeout.template.asyncLoader", function () {
    
    var asyncLoader = function() {
        ///<summary>Loads remote templates and runs callbacks when the template is added to the DOM</summary>
                
        ///<Summary type="Object">individual template loaders</Summary>
        this.pending = {};
    };
    
    asyncLoader.prototype.load = function(templateId, success) {
        ///<summary>Load a template</summary>
        ///<param name="templateId" type="string" optional="false">The url for the template to load. This will also be the id when the template is loaded</param>
        ///<param name="success" type="Function" optional="true">Run when the template exists in the DOM</param>
        if (!this.pending[templateId])
            this.pending[templateId] = new loader(templateId);
            
        this.pending[templateId].add(success || function() {});
    };
    
    function loader(templateName) {
        ///<summary>Private class for loading templates asynchronously</summary>
        ///<param name="templateName" type="string" optional="false">The name and url of this template</param>
        
        // signifies whether the template has been sucessfully loaded or not
        this._success = wipeout.base.contentControl.templateExists(templateName);
        
        // specifies success callbacks for when template is loaded. If this property in null, the loading process has completed
        this._callbacks = this._success ? null : [];
        
        // the name and url of the template to load
        this.templateName = templateName;
        
        if(!this._success) {
            var _this = this;
            wipeout.utils.obj.ajax({
                type: "GET",
                url: templateName,
                success: function(result) {                
                    wipeout.base.contentControl.createTemplate(templateName, result.responseText);                

                    _this._success = true;
                    var callbacks = _this._callbacks;
                    delete _this._callbacks;
                    for(var i = 0, ii = callbacks.length; i < ii; i++) {
                        callbacks[i]();
                    }
                },
                error: function() {
                    delete _this._callbacks;
                    _this._success = false;
                    throw "Could not locate template \"" + templateName + "\"";
                }
            });
        }
    }
    
    loader.prototype.add = function(success) {
        ///<summary>Call success when this template is loaded</summary>
        ///<param name="success" type="Function" optional="false">The callback</param>
        
        if(this._callbacks)
            this._callbacks.push(success);
        else if(this._success)
            success();
        else
            throw "Could not load template \"" + this.templateName + "\"";
    }
    
    asyncLoader.instance = new asyncLoader();
    
    return asyncLoader;
});


Class("wipeout.template.engine", function () {
    
    var engine = function() {
        ///<summary>The wipeout template engine, inherits from ko.templateEngine</summary>
    };
    engine.prototype = new ko.templateEngine();
    
    var $find = /\$find/;
    var $call = /\$call/;
    engine.createJavaScriptEvaluatorFunction = function(script) {
        ///<summary>Modify a block of script so that it's running context is bindingContext.$data first and biningContext second</summary>
        ///<param name="script" type="String">The script to modify</param>
        ///<returns type="Function">The compiled script</returns>
        
        var f = $find.test(script);
        var find = f ? "\n\tvar $find = wipeout.utils.find.create(bindingContext);" : "";
        
        // reuse existing $find if possible
        var call = $call.test(script) ? "\n\tvar $call = wipeout.utils.call.create(" + (f ? "$find" : "wipeout.utils.find.create(bindingContext)") + ");" : "";
        
        return new Function("bindingContext", "with(bindingContext) {" + find + call + "\n\twith($data) {\n\t\treturn " + script + ";\n\t}\n}");
    }
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        ///<summary>Add a function to the static script cache or cretate and add a function from a string</summary>
        ///<param name="script" type="String or Function">A function or string to add to the script cache. A string will be passed through createJavaScriptEvaluatorFunction before being added as a Function</param>
        ///<returns type="String">A reference to the newly created script</returns>
        var scriptId = engine.newScriptId();
        
        if(script instanceof Function) {
            engine.scriptCache[scriptId] = script;
        } else {        
            engine.scriptCache[scriptId] = engine.createJavaScriptEvaluatorFunction(script); 
        }
               
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        ///<summary>Add a function to the static script cache or cretate and add a function from a string</summary>
        ///<param name="script" type="String or Function">A function or string to add to the script cache. A string will be passed through createJavaScriptEvaluatorFunction before being added as a Function</param>
        ///<returns type="String">A reference to the newly created script</returns>
        return engine.createJavaScriptEvaluatorBlock(script);
    };
    
    engine.prototype.rewriteTemplate = function (template, rewriterCallback, templateDocument) {
        ///<summary>First re-write the template via knockout, then re-write the template via wipeout</summary>
        ///<param name="template" type="String">The id of the template</param>
        ///<param name="rewriterCallback" type="Function">A function which will do the re-writing</param>
        ///<param name="templateDocument">The owner document</param>
        
        var script = document.getElementById(template);
        if (script instanceof HTMLElement) {        
            // if it is an anonymous template it will already have been rewritten
            if (!engine.scriptHasBeenReWritten.test(script.textContent)) {
                ko.templateEngine.prototype.rewriteTemplate.call(this, template, rewriterCallback, templateDocument);
            } else {
                this.makeTemplateSource(template, templateDocument).data("isRewritten", true);
            }
            
            this.wipeoutRewrite(script, rewriterCallback);
        } else {
            ko.templateEngine.prototype.rewriteTemplate.call(this, template, rewriterCallback, templateDocument);
        }
    };
    
    engine.wipeoutRewrite = function(xmlElement, rewriterCallback) {
        ///<summary>Recursively go through an xml element and replace all view models with render comments</summary>
        ///<param name="xmlElement" type="Element">The template</param>
        ///<param name="rewriterCallback" type="Function">A function which will do the re-writing (provided by knockout)</param>
        if(wipeout.base.visual.reservedTags[xmlElement.nodeName]) {
            for(var i = 0; i < xmlElement.childNodes.length; i++)
                if(xmlElement.childNodes[i].nodeType === 1)
                    engine.wipeoutRewrite(xmlElement.childNodes[i], rewriterCallback);
        } else {
            var newScriptId = engine.newScriptId();
            engine.xmlCache[newScriptId] = xmlElement;
            
            var tags = "<!-- ko";
            if(DEBUG)
                tags += " wipeout-type: '" + xmlElement.nodeName + "',";
            
            var id = engine.getId(xmlElement);
            if(id)
                id = "'" + id + "'";
            tags += " wo: { type: " + xmlElement.nodeName + ", id: " + id + ", name: '" + xmlElement.nodeName + "', initXml: '" + newScriptId + "'} --><!-- /ko -->";
            
            var nodes = wipeout.utils.html.parseXml("<root>" + rewriterCallback(tags) + "</root>");
            while (nodes.childNodes.length) {
                var node = nodes.childNodes[0];
                node.parentNode.removeChild(node);
                xmlElement.parentNode.insertBefore(node, xmlElement);
            }
            
            xmlElement.parentNode.removeChild(xmlElement);
        }
    };
    
    engine.getId = function(xmlElement) {
        ///<summary>Get the id property of the xmlElement if any</summary>
        ///<param name="xmlElement" type="Element">Pull the id attribute from an element if possible</param>
        ///<returns type="String">The id or null</returns>
        for(var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {
            if(xmlElement.attributes[i].nodeName === "id") {
                return xmlElement.attributes[i].value;
            }
        }
        
        return null;
    };
    
    engine.prototype.wipeoutRewrite = function(script, rewriterCallback) {
        ///<summary>Replace all wipeout views with render bindings</summary>
        ///<param name="script" type="HTMLElement">The template</param>
        ///<param name="rewriterCallback" type="Function">A function which will do the re-writing (provided by knockout)</param>
        
        var ser = new XMLSerializer();
        var xmlTemplate = wipeout.utils.html.parseXml("<root>" + script.textContent + "</root>");
        
        var scriptContent = [];
        // do not use ii, xmlTemplate.childNodes may change
        for(var i = 0; i < xmlTemplate.childNodes.length; i++) {            
            if(xmlTemplate.childNodes[i].nodeType === 1)
                engine.wipeoutRewrite(xmlTemplate.childNodes[i], rewriterCallback);
            
            scriptContent.push(ser.serializeToString(xmlTemplate.childNodes[i]));
        }
        
        script.textContent = scriptContent.join("");
    };
    
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        ///<summary>Build html from a template source</summary>
        ///<param name="templateSource" type="Object">The template</param>
        ///<param name="bindingContext" type="ko.bindingContext">The current binding context to apply to the template</param>
        ///<param name="options" type="Object">The knockout template options</param>
        ///<returns type="Array">An array of html nodes to insert</returns>
        
        // if data is not a view, cannot render.
        if (!(bindingContext.$data instanceof wipeout.base.view))
            return [];
        
        var cached = templateSource['data']('precompiled');
        if (!cached) {
            cached = new wipeout.template.htmlBuilder(templateSource.text());
            templateSource['data']('precompiled', cached);
        }
        
        var output;
        
        // wrap in a computed so that observable evaluations will not propogate to the template engine
        ko.dependentObservable(function() {
            output = cached.render(bindingContext)
        }, this).dispose();
        
        return output;
    };
    
    // override functions for the sake of documentation
    if(DEBUG) {
        var override = function(toOverride) {
            engine.prototype[toOverride] = function () {
                ///<summary>Knockout native function</summary>
                
                ko.templateEngine.prototype[toOverride].apply(this, arguments);
            };
        };
        
        override("isTemplateRewritten");
        override("makeTemplateSource");
        override("renderTemplate");
    }
    
    engine.newScriptId = (function() {        
        var i = Math.floor(Math.random() * 10000);        
        return function() {
            ///<summary>Get a unique name for a script</summary>
            ///<returns type="String">A unique id</returns>
            return (++i).toString();
        };
    })();
    
    engine.xmlCache = {};
    engine.scriptCache = {};
    engine.openCodeTag = "<!-- wipeout_code: {"
    engine.closeCodeTag = "} -->";
    engine.scriptHasBeenReWritten = RegExp(engine.openCodeTag.replace("{", "\{") + "[0-9]+" + engine.closeCodeTag.replace("}", "\}"));
    
    engine.instance = new engine();
    
    return engine;
});

Class("wipeout.template.htmlBuilder", function () {
    
    var htmlBuilder = function(xmlTemplate) {
        ///<summary>Pre-compile that needed to render html from a binding context from a given template</summary>
        ///<param name="xmlTemplate" type="Element">The template to build html from</param>
        
        ///<Summary type="Array" generic0="Any">Pre rendered strings or string generating functions which make up the final html</Summary>
        this.preRendered = [];
        this.generatePreRender(xmlTemplate);
    };
    
    htmlBuilder.prototype.render = function(bindingContext) {
        ///<summary>Build html elements from a binding context</summary>
        ///<param name="bindingContext" type="ko.bindingContext">The bindingContext to build html from</param>
        //<returns type="Array">An array of elements</returns>
        
        var contexts = [];
        var returnVal = [];
        for(var i = 0, ii = this.preRendered.length; i < ii; i++) {
            if(this.preRendered[i] instanceof Function) {                    
                var rendered = this.preRendered[i](bindingContext);                  
                returnVal.push(rendered);
            } else {
                returnVal.push(this.preRendered[i]);
            }
        }
        
        var html = wipeout.utils.html.createElements(returnVal.join(""));
        enumerate(htmlBuilder.getTemplateIds({childNodes: html}), function(item, id) {
            bindingContext.$data.templateItems[id] = item;
        });
            
        if (bindingContext.$data instanceof wipeout.base.view)
            bindingContext.$data.onInitialized();
        
        return html;
    };
    
    htmlBuilder.prototype.generatePreRender = function(templateString) {
        ///<summary>Pre compile render code</summary>
        ///<param name="templateString" type="String">The template</param>
                   
        // need to convert to xml and back as string is an XML string, not a HTML string
        var xmlTemplate = wipeout.utils.html.parseXml("<root>" + templateString + "</root>");
        
        var template = wipeout.template.htmlBuilder.generateTemplate(xmlTemplate);
        
        var open = wipeout.template.engine.openCodeTag;
        var close = wipeout.template.engine.closeCodeTag;
        this.preRendered.length = 0;
        
        var startTag, endTag;
        while((startTag = template.indexOf(open)) !== -1) {
            this.preRendered.push(template.substr(0, startTag));
            template = template.substr(startTag);
            
            endTag = template.indexOf(close);
            if(endTag === -1) {
                throw "Invalid wipeout_code tag.";
            }
            
            this.preRendered.push((function(scriptId) {
                return wipeout.template.engine.scriptCache[scriptId];
            })(template.substr(open.length, endTag - open.length)));
                        
            template = template.substr(endTag + close.length);
        }
                
        this.preRendered.push(template);
    };
    
    htmlBuilder.getTemplateIds = function (element) {
        ///<summary>Return all html elements with an id</summary>
        ///<param name="element">The parent element to query</param>
        ///<returns type="Object">A dictionary of elements and ids</returns>
        
        var ids = {};
        enumerate(element.childNodes, function(node) {
            if(node.nodeType === 1) {
                for(var j = 0, jj = node.attributes.length; j < jj; j++) {
                    if(node.attributes[j].nodeName === "id") {
                        ids[node.attributes[j].nodeValue] = node;
                        break;
                    }
                }
                
                // look at child elements
                enumerate(htmlBuilder.getTemplateIds(node), function(element, id) {
                    ids[id] = element;
                });
            }                
        });
        
        return ids;
    };
    
    htmlBuilder.generateTemplate = function(xmlTemplate) { 
        ///<summary>Convert an xml template to a string</summary>
        ///<param name="xmlTemplate" type="Element">The template</param>
        ///<returns type="String">A string version of the template</returns>
        
        var result = [];
        var ser = new XMLSerializer();
        
        enumerate(xmlTemplate.childNodes, function(child) {            
            if(child.nodeType == 1) {
                
                // create copy with no child nodes
                var ch = wipeout.utils.html.parseXml(ser.serializeToString(child));
                while (ch.childNodes.length) {
                    ch.removeChild(ch.childNodes[0]);
                }
                
                var html = wipeout.utils.html.createElement(ser.serializeToString(ch));
                html.innerHTML = wipeout.template.htmlBuilder.generateTemplate(child);                
                result.push(wipeout.utils.html.outerHTML(html));
            } else if(child.nodeType === 3) {
                result.push(child.data);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
        
        return result.join("");
    };
    
    return htmlBuilder;
});

Class("wipeout.utils.bindingDomManipulationWorker", function () { 
    
    var bindingDomManipulationWorker = wipeout.utils.domManipulationWorkerBase.extend(function() {   
        ///<summary>Cleanup wipeout state using a list of registered bindings. This class for legacy browsers which do not support mutation observers</summary>
        
        this._super();
    });
    
    bindingDomManipulationWorker.prototype.finish = function() {
        ///<summary>Cleanup any moved or removed nodes</summary>
        
        enumerate(wipeout.bindings.bindingBase.registered, function(binding) {
            if(binding.checkHasMoved() && this._mutations.indexOf(binding.element) === -1)
                this._mutations.push(binding.element);
        }, this);
        
        this._super();
    };
    
    return bindingDomManipulationWorker;
});

Class("wipeout.utils.call", function () {
    
    var call = wipeout.base.object.extend(function(find) {
        ///<summary>Extends find functionality to call functions with the correct context and custom arguments</summary>
        ///<param name="find" type="wo.find" optional="false">The find functionality</param>
        
        this._super();

        ///<Summary type="wo.find">The worker used to find the root object</Summary>
        this.find = find;
    }, "call");
    
    call.prototype.call = function(searchTermOrFilters, filters) {
        ///<summary>Find an item given a search term and filters. Call a method with it's dot(...) method and pass in custom argument with it's arg(...) method</summary>
        ///<param name="searchTermOrFilters" type="Any" optional="false">Search term or filters to be passed to find</param>
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

/* Not currently used
Class("wipeout.utils.dictionary", function () {
    var dictionary = function() {
        this._items = {
            keys: [],
            values: []
        };
    };
    
    dictionary.prototype.add = function(key, value) {
        var existing = this._items.keys.indexOf(key);
        
        if (existing === -1) {
            this._items.keys.push(key);
            this._items.values.push(value);
        } else {
            this._items.values[existing] = value;
        }
    };
    
    dictionary.prototype.remove = function(key) {
        var existing = this._items.keys.indexOf(key);
        
        if(existing !== -1) {
            this._items.keys.splice(existing, 1);
            this._items.values.splice(existing, 1);
        }
    };
    
    dictionary.prototype.allKeys = function() {
        return wipeout.utils.obj.copyArray(this._items.keys);
    };
    
    dictionary.prototype.containsKey = function(key) {
        return this._items.keys.indexOf(key) !== -1;
    };
    
    dictionary.prototype.value = function(key) {
        return this._items.values[this._items.keys.indexOf(key)];
    };
    
    return dictionary;
});*/

Class("wipeout.utils.domData", function () {
    var domDataKey = "__wipeout_domData";
    
    function domData() {
        ///<summary>Append data to dom elemenents</summary>
    }
    
    function store(element) {
        ///<summary>Lazy create and get the dom data store for an element</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<returns type="Object">The data store for this element</returns>
        
        if(!element) throw "Invalid html element";
        return element[domDataKey] = element[domDataKey] || {};
    }
    
    domData.get = function(element, key) {
        ///<summary>Get data from an element</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<param name="key" type="String" optional="true">The data to get</param>
        ///<returns type="Object">The value of this key</returns>
        
        return arguments.length > 1 ? store(element)[key] : store(element);
    };
    
    domData.set = function(element, key, value) {
        ///<summary>Set data on an element</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<param name="key" type="String" optional="false">The key of data to set</param>
        ///<param name="value" type="Any" optional="false">The data to set</param>
        ///<returns type="Any">The value</returns>
        
        return store(element)[key] = value;
    };
    
    domData.clear = function(element, key) {
        ///<summary>Clear an elements data</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<param name="key" type="String" optional="true">The key of data to clear</param>
        
        if(key) {
            delete store(element)[key];
        } else {
            delete element[domDataKey];
        }
    };
    
    return domData;
});

Class("wipeout.utils.find", function () {
    
    var find = wipeout.base.object.extend(function(bindingContext) {
        ///<summary>Find an ancestor from the binding context</summary>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The ancestor chain</param>
        this._super();

        ///<Summary type="ko.bindingContext">the binding context to use when finding objects</Summary>
        this.bindingContext = bindingContext;
    }, "find");
    
    find.prototype.find = function(searchTermOrFilters, filters) {
        ///<summary>Find an ancestor item based on the search term and filters</summary>
        ///<param name="searchTermOrFilters" type="Any" optional="false">If an object, will be used as extra filters. If a function, will be used as an $instanceof filter. If a String will be used as an &ancestory filter</param>
        ///<param name="filters" type="Object" optional="false">Items to filter the output by</param>
        ///<returns type="Any">The search result</returns>
        
        var temp = {};

        if(filters) {
            for(var i in filters)
                temp[i] = filters[i];
        }

        // destroy object ref
        filters = temp;            
        if(!filters.$number) {
            filters.$number = 0;
        }

        // shortcut for having constructor as search term
        if(searchTermOrFilters && searchTermOrFilters.constructor === Function) {
            filters.$instanceOf = searchTermOrFilters;
        // shortcut for having filters as search term
        } else if(searchTermOrFilters && searchTermOrFilters.constructor !== String) {
            for(var i in searchTermOrFilters)
                filters[i] = searchTermOrFilters[i];
        } else {
            filters.$ancestry = wipeout.utils.obj.trim(searchTermOrFilters);
        }     

        if(!filters.$number && filters.$n) {
            filters.$number = filters.$n;
        }     

        if(!filters.$instanceOf && filters.$i) {
            filters.$instanceOf = filters.$i;
        }    

        if(!filters.$instanceOf && filters.$instanceof) {
            filters.$instanceOf = filters.$instanceof;
        }

        if(!filters.$ancestry && filters.$a) {
            filters.$ancestry = filters.$a;
        }

        if(!filters.$type && filters.$t) {
            filters.$type = filters.$t;
        }
        
        var getModel = filters.$m || filters.$model;

        delete filters.$m;
        delete filters.$model;
        delete filters.$n;
        delete filters.$instanceof;
        delete filters.$i;
        delete filters.$a;
        delete filters.$t;

        return this._find(filters, getModel);
    };
    
    find.prototype._find = function(filters, getModel) {  
        ///<summary>Find an ancestor item based on the filters and whether view models or models are to be returned</summary>
        ///<param name="filters" type="Object" optional="false">Items to filter the output by</param>
        ///<param name="getModel" type="Boolean" optional="true">Specify that models are to be searched</param>
        ///<returns type="Any">The search result</returns>
            
        if(!this.bindingContext ||!this.bindingContext.$parentContext)
            return null;
        
        var getItem = getModel ? 
            function(item) {
                return item && item.$data instanceof wo.view ? item.$data.model() : null;
            } : 
            function(item) { 
                return item ? item.$data : null;
            };

        var currentItem, currentContext = this.bindingContext;
        for (var index = filters.$number; index >= 0 && currentContext; index--) {
            var i = 0;

            currentContext = currentContext.$parentContext;

            // continue to loop until we find a binding context which matches the search term and filters
            while(!wipeout.utils.find.is(currentItem = getItem(currentContext), filters, i) && currentContext) {
                currentContext = currentContext.$parentContext;
                i++;
            }
        }

        return currentItem;
    };
    
    find.create = function(bindingContext) {
        ///<summary>Get a function wich points directly to (new wo.find(..)).find(...)</summary>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The find functionality</param>
        ///<returns type="Function">The find function</returns>
        
        var f = new wipeout.utils.find(bindingContext);

        return function(searchTerm, filters) {
            return f.find(searchTerm, filters);
        };
    };
    
    // regular expressions used by the find class
    find.regex = {
        ancestors: /^(great)*(grand){0,1}parent$/,
        great: /great/g,
        grand: /grand/g
    };
    
    find.$type = function(currentItem, searchTerm, index) {
        ///<summary>Find an item based on exact type matching</summary>
        ///<param name="currentItem" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="searchTerm" type="Function" optional="false">The value of $type in the search filter</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
        
        return currentItem && currentItem.constructor === searchTerm;
    };
    
    find.$ancestry = function(currentItem, searchTerm, index) {
        ///<summary>Find an item based on its ancestory. (Parent, grandparent, etc...)</summary>
        ///<param name="currentItem" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="searchTerm" type="String" optional="false">The value of $ancestry in the search filter</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
                
        searchTerm = (searchTerm || "").toLowerCase();

        // invalid search term which passes regex
        if(searchTerm.indexOf("greatparent") !== -1) return false;

        var total = 0;
        var g = searchTerm.match(wipeout.utils.find.regex.great);
        if(g)
            total += g.length;
        g = searchTerm.match(wipeout.utils.find.regex.grand);
        if(g)
            total += g.length;

        return total === index;
    };
    
    find.$instanceOf = function(currentItem, searchTerm, index) {
        ///<summary>Find an item based on instanceof type matching</summary>
        ///<param name="currentItem" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="searchTerm" type="Function" optional="false">The value of $instanceof in the search filter</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
        
        if(!currentItem || !searchTerm || searchTerm.constructor !== Function)
            return false;

        return currentItem instanceof searchTerm;
    };
    
    find.is = function(item, filters, index) {
        ///<summary>Find an item based on the given filters</summary>
        ///<param name="item" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="filters" type="Object" optional="false">The filters</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
        
        if (!item)
            return false;
        
        for (var i in filters) {
            if (i === "$number") continue;

            if (i[0] === "$") {
                if(!wipeout.utils.find[i](item, filters[i], index))
                    return false;
            } else if (filters[i] !== item[i]) {
                return false;
            }
        }

        return true;
    };
    
    return find;
});



Class("wipeout.utils.html", function () { 
        
    var outerHTML = function(element) {
        ///<summary>Browser agnostic outerHTML function</summary>
        ///<param name="element" type="HTMLElement">The elemet to get the outer html</param>
        ///<returns type="String">The outer html of the input</returns>
        
        if(!element) return null;
        
        if(element.constructor === HTMLHtmlElement) throw "Cannot serialize a Html element using outerHTML";
        
        var tagName = element.nodeType === 1 ? (specialTags[element.tagName.toLowerCase()] || "div") : "div";
        var div = document.createElement(tagName);
        div.appendChild(element.cloneNode(true));
        
        return div.innerHTML;        
    };  
    
    var validHtmlCharacter = /[a-zA-Z0-9]/;
    var getTagName = function(openingTag) {
        ///<summary>Get the tag name of the first element in the string</summary>
        ///<param name="openingTag" type="String">A string of html</param>
        ///<returns type="String">The name of the first tag</returns>
        
        openingTag = openingTag.replace(/^\s+|\s+$/g, "");
        if(!openingTag || openingTag[0] !== "<")
            throw "Invalid html tag";
        
        openingTag = openingTag.substring(1).replace(/^\s+|\s+$/g, "");
        
        for(var i = 0, ii = openingTag.length; i < ii; i++) {
            if(!validHtmlCharacter.test(openingTag[i]))
                break;
        }
        
        return openingTag.substring(0, i);
    };
    
    var stripHtmlComments = /<\!--[^>]*-->/g;
    var getFirstTagName = function(htmlContent) {
        ///<summary>Get the tag name of the first element in the string</summary>
        ///<param name="htmlContent" type="String">A string of html</param>
        ///<returns type="String">The name of the first tag</returns>
        
        htmlContent = htmlContent.replace(stripHtmlComments, "").replace(/^\s+|\s+$/g, "");
        var i = 0;
        if((i = htmlContent.indexOf("<")) === -1)
            return null;
        
        return getTagName(htmlContent.substring(i));
    };
        
    // tags which cannot go into a <div /> tag, along with the tag they should go into
    var specialTags = {
        area: "map",
        base: "head",
        basefont: "head",
        body: "html",
        caption: "table",
        col: "colgroup",
        colgroup: "table",
        command : "menu",
        frame: "frameset",
        frameset: "html",
        head: "html",
        keygen: "form",
        li: "ul",
        optgroup: "select",
        option: "select",
        rp: "rt",
        rt: "ruby",
        source: "audio",
        tbody: "table",
        td: "tr",
        tfoot: "table",
        th: "tr",
        thead: "table",
        tr: "tbody"
    };
    
    // tags which, if the root, wipeout will refuse to create
    var cannotCreateTags = {
        html:true,
        basefont: true,
        base: true,
        body: true,
        frame: true,
        frameset: true,
        head: true
    };
    
    function firstChildOfType(parentElement, childType) {
        for(var i = 0, ii = parentElement.childNodes.length; i < ii; i++) {
            var child = parentElement.childNodes[i];
            if (child.nodeType === 1 && wipeout.utils.obj.trimToLower(child.tagName) === wipeout.utils.obj.trimToLower(childType)) {
                return child;
            }
        }
    }
    
    // tags which are readonly once created in IE
    var ieReadonlyElements = {
        audio: true,
        col: true, 
        colgroup: true,
        frameset: true,
        head: true,
        rp: true,
        rt: true,
        ruby: true,
        select: true,
        style: true,
        table: true,
        tbody: true,
        tfooy: true,
        thead: true,
        title: true,
        tr: true
    };
    
    // firefox replaces some tags with others
    var replaceTags = {
        keygen: "select"
    };
    
    var createElement = function(htmlString) {
        ///<summary>Create a html element from a string</summary>
        ///<param name="htmlString" type="String">A string of html</param>
        ///<returns type="HTMLElement">The first element in the string as a HTMLElement</returns>
        
        var tagName = wipeout.utils.obj.trimToLower(getTagName(htmlString));
        if(cannotCreateTags[tagName]) throw "Cannot create an instance of the \"" + tagName + "\" tag.";
        
        var parentTagName = specialTags[tagName] || "div";
        
        // the innerHTML for some tags is readonly in IE
        if(ko.utils.ieVersion && ieReadonlyElements[parentTagName])
            return firstChildOfType(createElement("<" + parentTagName + ">" + htmlString + "</" + parentTagName + ">"), tagName);
            
        var parent = document.createElement(parentTagName);
        parent.innerHTML = htmlString;
        
        function getElement(tagName) {
            if(!tagName) return null;
            
            for(var i  = 0, ii = parent.childNodes.length; i < ii; i++) {
                // IE might create some other elements along with the one specified
                if(parent.childNodes[i].nodeType === 1 && parent.childNodes[i].tagName.toLowerCase() === tagName) {
                    var element = parent.childNodes[i];
                    parent.removeChild(element);
                    return element;
                }
            }
            
            return null;
        }
        
        return getElement(tagName) || getElement(replaceTags[tagName]);
    }; 
       
    var createElements = function(htmlString) {
        ///<summary>Create an array of html elements from a string</summary>
        ///<param name="htmlString" type="String">A string of html</param>
        ///<returns type="HTMLElement">The string as an array of HTMLElements</returns>
        
        if(htmlString == null) return [];
        
        var sibling = getFirstTagName(htmlString) || "div";
        var parent = specialTags[getTagName("<" + sibling + "/>")] || "div";
        
        // add wrapping elements so that text element won't be trimmed
        htmlString = "<" + sibling + "></" + sibling + ">" + htmlString + "<" + sibling + "></" + sibling + ">";
        
        var div = document.createElement(parent);
        div.innerHTML = htmlString;
        
        var output = [];
        while(div.firstChild) {
            output.push(div.firstChild);
            div.removeChild(div.firstChild);
        }
        
        // remove added divs
        output.splice(0, 1);
        output.splice(output.length - 1, 1);
        
        return output;
    };  
 
    var getAllChildren = function (element) {
        ///<summary>Get all of the children of a html element or knockout virtual element</summary>
        ///<param name="element" type="HTMLNode">An element or knockout virtual element</param>
        ///<returns type="Array" generic0="HTMLNode">All of the nodes in the element</returns>
        
        var children = [];
        if (wipeout.utils.ko.isVirtual(element)) {
            var parent = wipeout.utils.ko.parentElement(element);
            
            // find index of "element"
            for (var i = 0, ii = parent.childNodes.length; i < ii; i++) {
                if (parent.childNodes[i] === element)
                    break;
            }
 
            i++;
 
            // use previous i
            // get all children of the virtual element. It is ok to get more than
            // just the children as the next block will break out when un wanted nodes are reached
            for (var ii = parent.childNodes.length; i < ii; i++) {
                children.push(parent.childNodes[i]);
            }
        } else {
            children = element.childNodes;
        }
 
        var output = [];
        var depth = 0;
 
        for (var i = 0, ii = children.length; i < ii; i++) {
            if (wipeout.utils.ko.isVirtualClosing(children[i])) {
                depth--;
                
                // we are in a virtual parent element
                if (depth < 0) return output;
                continue;
            }
 
            // we are in a virtual child element
            if (depth > 0)
                continue;
 
            output.push(children[i]);
            
            // the next element will be in a virtual child
            if (wipeout.utils.ko.isVirtual(children[i]))
                depth++;
        }
 
        return output;
    };
    
    var getViewModel = function(forHtmlNode) {
        ///<summary>Get the view model associated with a html node</summary>
        ///<param name="forHtmlNode" type="HTMLNode">The element which is the root node of a wo.view</param>
        ///<returns type="wo.view">The view model associated with this node, or null</returns>
        var vm = wipeout.utils.domData.get(forHtmlNode, wipeout.bindings.wipeout.utils.wipeoutKey);
        if(vm)
            return vm;
        
        var parent = wipeout.utils.ko.parentElement(forHtmlNode);
        if(parent)
            return getViewModel(parent);
        
        return null;
    };
    
    var createTemplatePlaceholder = function(forViewModel) {
        ///<summary>Create a html node so serve as a temporary template while the template loads asynchronously</summary>
        ///<param name="forViewModel" type="wo.view">The view to which this temp template will be applied. May be null</param>
        ///<returns type="HTMLElement">A new html element to use as a placeholder template</returns>
        
        return createElement("<span>Loading template</span>");
    };
    
    var loadTemplate = function(templateId) {
        ///<summary>Asynchronously load a template</summary>
        ///<param name="templateId" type="String">The url and subsequent template id of the template</param>
        
        wipeout.template.asyncLoader.instance.load(templateId);
    };
    
    var cleanNode = function(node) {
        ///<summary>Clean down and dispose of all of the bindings (ko and wo) associated with this node and its children</summary> 
        ///<param name="node" type="HTMLNode" optional="false">The node</param>
        
        var bindings = wipeout.utils.domData.get(node, wipeout.bindings.bindingBase.dataKey);
        
        // check if children have to be disposed
        var controlChildren = false;
        enumerate(bindings, function(binding) {
            controlChildren |= binding.bindingMeta.controlsDescendantBindings;
        });

        // dispose of all children
        if(!controlChildren) {
            var child = ko.virtualElements.firstChild(node);
            while (child) {
                cleanNode(child);
                child = ko.virtualElements.nextSibling(child);
            }
        }
        
        // dispose of all wo bindings
        enumerate(bindings, function(binding) {
            binding.dispose();
        });

        // clear ko and wo data
        wipeout.utils.domData.clear(node, wipeout.bindings.bindingBase.dataKey);
        ko.cleanNode(node);
    };
    
    var html = function(htmlManipulationLogic) {
        ///<summary>If html elements are to be moved or deleted, wrap the move logic in a call to this function to ensure disposal of unused view models</summary> 
        ///<param name="htmlManipulationLogic" type="Function" optional="false">A callback to manipulate html</param>
        
        wipeout.utils.htmlAsync(function(cleanupCallback) {
            htmlManipulationLogic();
            cleanupCallback();
        });
    };
    
    try {
        //http://stackoverflow.com/questions/11563554/how-do-i-detect-xml-parsing-errors-when-using-javascripts-domparser-in-a-cross
        var parseErrorNamespace = new DOMParser().parseFromString('<', 'text/xml').getElementsByTagName("parsererror")[0].namespaceURI;
    } catch (e) {
        // IE throws an exception on invalid xml
    }
    
    var parseXml = function(xmlString) {  
        ///<summary>Parse a string into an xm ldocumen</summary> 
        ///<param name="xmlString" type="String" optional="false">the xml string</param>
        ///<returns type="Element" optional="false">Xml</returns>
        
        var xmlTemplate = new DOMParser().parseFromString(xmlString, "application/xml");        
        if(xmlTemplate.getElementsByTagNameNS(parseErrorNamespace, 'parsererror').length) {
			throw "Invalid xml template:\n" + new XMLSerializer().serializeToString(xmlTemplate.firstChild);
		}
        
        return xmlTemplate.documentElement;
    };
    
    html.parseXml = parseXml;
    html.cleanNode = cleanNode;
    html.cannotCreateTags = cannotCreateTags;
    html.createTemplatePlaceholder = createTemplatePlaceholder;
    html.specialTags = specialTags;
    html.getFirstTagName = getFirstTagName;
    html.getTagName = getTagName;
    html.getAllChildren = getAllChildren;
    html.outerHTML = outerHTML;
    html.createElement = createElement;
    html.createElements = createElements;
    html.getViewModel = getViewModel
    
    return html;    
});


Class("wipeout.utils.htmlAsync", function () { 
    
    var asyncHandler = (function() {
        
        var actions = [];
        
        var mutations = [];
        var worker = null;
        function run() {
            if(worker || !actions.length) return;
            
            worker = window.MutationObserver ? 
                new wipeout.utils.mutationObserverDomManipulationWorker() :
                new wipeout.utils.bindingDomManipulationWorker();
            
            var hf = function() {
                // ensure it can only be called once
                if(hf === null)
                    return;
                
                hf = null;         
                setTimeout(function() {
                    handleFinished();
                }, 1);
            }
            
            actions.splice(0, 1)[0](hf);
            
            // set timeout to cleanup automatically after 10 seconds
            setTimeout(function() {
                if(!hf) return;
                    
                if(!wipeout.settings.suppressWarnings)
                    console.error("Cleanup callback for async move method was not called. Cleanup has been automatically called, which may cause undesired behaviour.");
                
                hf();
            }, wipeout.settings.htmlAsyncTimeout > 0 ? wipeout.settings.htmlAsyncTimeout : 10000);
        }
        
        function handleFinished() { 
            worker.finish();
            worker = null;
            run();
        }
        
        return {
            add: function(action) {
                actions.push(action);
                run();
            }
        };
    }());
    
    var htmlAsync = function(moveFunctionality) {
        ///<summary>If html elements are to be moved or deleted asynchronusly, wrap the move logic in a call to this function to ensure disposal of unused view models. The moveFunctionality callback will get a callback argumnet which MUST BE CALLED after the move is complete. If not called after a certain length of time (specified by wipeout.settings.htmlAsyncTimeout) the callback will be invoked automatically to allow other moves to take place.</summary> 
        ///<param name="htmlManipulationLogic" type="Function" optional="false">A callback to manipulate html which accepts a callback to be invoked after the move</param>
        
        if(!(moveFunctionality instanceof Function)) throw "Invalid move functionality";
        asyncHandler.add(moveFunctionality);
    };
    
    return htmlAsync;
});



Class("wipeout.utils.ko", function () {
        
    var _ko = function() { };
    
    _ko.version = function() {
        ///<summary>Get the current knockout version as an array of numbers</summary>
        ///<returns type="Array" generic0="Number">The knockout version</returns>
        
        if(!ko || !ko.version)
            return null;
        
        var version = ko.version.split(".");
        for(var i = 0, ii = version.length; i < ii; i++)
            version[i] = parseInt(version[i]);
        
        return version;
    };   
    
    _ko.peek = function(input) {
        ///<summary>Like ko.unwrap, but peeks instead</summary>
        ///<param name="input" type="Any">An observable or regular object</param>
        ///<returns type="Any">The value of the observable or object</returns>
        
        if(ko.isObservable(input))
            return input.peek();
        else
            return input;
    };
    
    _ko.array = {
        diff: {
            added: "added", 
            deleted: "deleted",
            retained: "retained"
        }
    };
    
    _ko.parentElement = function(node) {
        ///<summary>Returns the parent element or parent knockout virtual element of a node</summary>
        ///<param name="node" type="HTMLNode">The child element</param>
        ///<returns type="HTMLNode">The parent</returns>
        var depth = 0;
        var current = node.previousSibling;
        while(current) {
            if(_ko.isVirtual(current)) {
                if(depth < 0)
                    depth++;
                else
                    return current;
            } else if(_ko.isVirtualClosing(current)) {
                depth--;
            }

            current = current.previousSibling;
        }

        return node.parentNode;
    };
    
    // copied from knockout
    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";
    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*-->$/ : /^\s*ko(?:\s+(.+\s*\:[\s\S]*))?\s*$/;
    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
    
    // copied from knockout
    _ko.isVirtual = function(node) {
        ///<summary>Whether a html node is a knockout virtual element or not</summary>
        ///<param name="node" type="HTMLNode">The node to test</param>
        ///<returns type="Boolean"></returns>
        return (node.nodeType == 8) && (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
    };
    
    // copied from knockout
    _ko.isVirtualClosing = function(node) {
        ///<summary>Whether a html node is a knockout virtual element closing tag</summary>
        ///<param name="node" type="HTMLNode">The node to test</param>
        ///<returns type="Boolean"></returns>
        return (node.nodeType == 8) && (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(endCommentRegex);
    };
    
    _ko.enumerateOverChildren = function(node, callback) {
        ///<summary>Enumerate over the children of an element or ko virtual element</summary>
        ///<param name="node" type="HTMLNode">The parent</param>
        ///<param name="callback" type="Function">The callback to apply to each node</param>
        
        node = ko.virtualElements.firstChild(node);
        while (node) {
            callback(node);
            node = ko.virtualElements.nextSibling(node);
        }
    };
    
    return _ko;
});

Class("wipeout.utils.mutationObserverDomManipulationWorker", function () { 
    
    var mutationObserverDomManipulationWorker = wipeout.utils.domManipulationWorkerBase.extend(function() {
        ///<summary>Cleanup wipeout state using a global mutation observer</summary>
             
        this._super();   
        var _this = this;
        
        ///<Summary type="MutrationObserver">The mutation observer used</Summary>
        this._observer = new MutationObserver(function(mutations) {
            _this.appendRemovedNodes(mutations);
        });
        
        this._observer.observe(document.body, {childList: true, subtree: true});
    });
    
    mutationObserverDomManipulationWorker.prototype.appendRemovedNodes = function(mutations) {
        ///<summary>Add all removed nodes in the mutations paramater to the list of mutations</summary>
        ///<param name="mutations" type="Array" generic0="Object" optional="false">Mutations from a mutation observer</param>
        
        enumerate(mutations, function(mutation) {
            enumerate(mutation.removedNodes, function(node) {
                if(this._mutations.indexOf(node) === -1)
                    this._mutations.push(node);
            }, this);
        }, this);
    };
    
    mutationObserverDomManipulationWorker.prototype.finish = function() {
        ///<summary>Cleanup any moved or removed nodes</summary>
        
        this._observer.disconnect();
        delete this._observer;
        
        this._super();
    };
    
    return mutationObserverDomManipulationWorker;
});

window.wo = {};
enumerate(wipeout.base, function(item, i) {
    window.wo[i] = item;
});

enumerate(wipeout.utils, function(item, i) {
    window.wo[i] = item;
});


window.wipeout = wipeout;
var DEBUG = wo.DEBUG = true;

})();
