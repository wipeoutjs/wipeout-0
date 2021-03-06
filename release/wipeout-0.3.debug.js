(function () { 
//"use strict"; - cannot use strict right now. any functions defined in strict mode are not accesable via arguments.callee.caller, which is used by _super
var wipeout = {};
    
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
    
    var random = function(max) {
        ///<summary>Random int generator</summary>
        ///<param name="max" type="Number">The maximum value</param>
        ///<returns type="Number">A random number</returns>
        return Math.floor(Math.random() * max);
    };
    
    var obj = function() { };
    obj.parseBool = parseBool;
    obj.trimToLower = trimToLower;
    obj.trim = trim;
    obj.enumerate = enumerate;
    obj.enumerateDesc = enumerateDesc;
    obj.getObject = getObject;
    obj.createObject = createObject;
    obj.copyArray = copyArray;
    obj.random = random;
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
        
        // static functions
        for (var p in this)
            if (this.hasOwnProperty(p) && this[p] && this[p].constructor === Function && this[p] !== object.clearVirtualCache)
                childClass[p] = this[p];
 
        // use eval so that browser debugger will get class name
        if(className && DEBUG) {
            if(!validFunctionCharacters.test(className)) {
                throw "Invalid class name. The class name is for debug purposes and can contain alphanumeric characters only";
            }
            
            // or rather, YUI doesn't like eval, use new function
            new Function("childClass", "parentClass", "\
            function " + className + "() { this.constructor = childClass; }\
            " + className + ".prototype = parentClass.prototype;\
            childClass.prototype = new " + className + "();")(childClass, this);
        } else {        
            var prototypeTracker = function() { this.constructor = childClass; }     
            prototypeTracker.prototype = this.prototype;
            childClass.prototype = new prototypeTracker();
        }
        
        return childClass;
    };

    return object;
});


Class("wipeout.base.disposable", function () {
    
    var disposable = wipeout.base.object.extend(function (disposeFunction) {
        ///<summary>An object which will dispose of something</summary>   
        ///<param name="disposeFunction" type="Function" optional="false">A dispose function</param>
        this._super();
        
        this.disposeFunction = disposeFunction;
    });
    
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
        
        //Specifies whether this object should be used as a binding context. If false, the binding context of this object will be it's parent. 
        this.woInvisible = this.constructor.woInvisibleDefault;
        
        //Dictionary of items created within the current template. The items can be visuals or html elements
        this.templateItems = {};
        
        //The template of the visual, giving it an appearance
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());
        
        //A bag to put objects needed for the lifecycle of this object and its properties
        this.__woBag = {
            disposables: {},
            createdByWipeout: false,
            rootHtmlElement: null,
            routedEventSubscriptions: [],
            renderedChildren: []
        };
    }, "visual");
    
    visual.woInvisibleDefault = false;
    
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
    
    visual.prototype.registerDisposable = (function() {
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
    
    visual.prototype.unTemplate = function() {
        ///<summary>Removes and disposes (if necessary) all of the children of the visual</summary>
        
        // dispose of all rendered children
        enumerate(this.__woBag.renderedChildren.splice(0, this.__woBag.renderedChildren.length), function(child) {
            if(child instanceof visual) { 
                if(child.__woBag.createdByWipeout)
                    child.dispose();
                else
                    child.unRender();
            }
        });
        
        // delete all template items
        enumerate(this.templateItems, function(item, i) {            
            delete this.templateItems[i];
        }, this);
        
        if(this.__woBag.rootHtmlElement) {
            //IE does not have document.contains
            var doc = document.contains ? document : document.getElementsByTagName("body")[0];
            if(doc) {
                if(doc.contains(this.__woBag.rootHtmlElement))
                    ko.virtualElements.emptyNode(this.__woBag.rootHtmlElement);
                else
                    console.warn("Warning, could not dispose of html element correctly. This element has been manually moved from the DOM (not by knockout)");
            } else {
                try {
                    ko.virtualElements.emptyNode(this.__woBag.rootHtmlElement);
                } catch(e) {
                    console.warn("Warning, could not dispose of html element correctly. This element has been manually moved from the DOM (not by knockout)");
                }
            }
        }
    };
        
    visual.prototype.unRender = function() {
        ///<summary>Prepares a visual to be re-rendered</summary>
        
        this.onUnrender();
        
        this.unTemplate();
                
        if(this.__woBag.rootHtmlElement) {
            // disassociate the visual from its root element and empty the root element
            ko.utils.domData.set(this.__woBag.rootHtmlElement, wipeout.bindings.wipeout.utils.wipeoutKey, undefined); 
            delete this.__woBag.rootHtmlElement;
        }
    };
    
    visual.prototype.dispose = function() {
        ///<summary>Dispose of this visual</summary>
        
        this.unRender();
        
        // dispose of any computeds
        for(var i in this)
            if(ko.isObservable(this[i]) && this[i].dispose instanceof Function)
                this[i].dispose();
                
        // dispose of routed event subscriptions
        enumerate(this.__woBag.routedEventSubscriptions.splice(0, this.__woBag.routedEventSubscriptions.length), function(event) {
            event.dispose();
        });
    };
    
    //TODO: move to util
    visual.getParentElement = function(node) {
        ///<summary>Gets the parent or virtual parent of the element</summary>
        ///<param name="node" type="HTMLNode" optional="false">The node to find the parent of</param>
        ///<returns type="HTMLNode">The parent element</returns>    
        
        var depth = 0;
        var current = node.previousSibling;
        while(current) {
            if(wipeout.utils.ko.virtualElements.isVirtualClosing(current)) {
                depth--;
            }
            
            if(wipeout.utils.ko.virtualElements.isVirtual(current)) {
                if(depth === 0)
                    return current;
                
                depth++;
            }
            
            current = current.previousSibling;
        }
        
        return node.parentNode;
    };
    
    visual.prototype.getParents = function() {
        ///<summary>Gets an array of the entire tree of ancestor visual objects</summary>
        ///<returns type="Array" generic0="wo.view" arrayType="wo.view">A tree of ancestor view models</returns>
        var current = this;
        var parents = [];
        while(current) {
            parents.push(current);
            current = current.getParent();
        }
        
        return parents;
    };
    
    visual.prototype.getParent = function() {
        ///<summary>Get the parent visual of this visual</summary>
        ///<returns type="wo.view">The parent view model</returns>
        if(this.__woBag.rootHtmlElement == null)
            return null;
        
        var nextTarget;
        var current = visual.getParentElement(this.__woBag.rootHtmlElement);
        while(current) {
            if(nextTarget = ko.utils.domData.get(current, wipeout.bindings.wipeout.utils.wipeoutKey)) {
                return nextTarget;
            }
            
            current = visual.getParentElement(current);
        }
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
    
    visual.prototype.registerRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {
        ///<summary>Register for a routed event</summary>   
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        ///<param name="callbackContext" type="Any" optional="true">The context "this" to use within the callback</param>
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
        
        return rev.event.register(callback, callbackContext);
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
 
        var vm = ko.utils.domData.get(rootElement, wipeout.bindings.wipeout.utils.wipeoutKey);        
        if (vm) {
            return [{ viewModel: vm, display: displayFunction(vm), children: output}];
        }
 
        return output;
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

    var modelRoutedEventKey = "wo.view.modelRoutedEvents";
    
    var view = wipeout.base.visual.extend(function (templateId, model /*optional*/) {        
        ///<summary>Extends on the visual class to provide expected MVVM functionality, such as a model and bindings</summary>  
        ///<param name="templateId" type="String" optional="true">An initial template id</param>
        ///<param name="model" type="Any" optional="true">An initial model</param>

        this._super(templateId);
        
        if(model === undefined)
            model = null;
        
        //The model of view. If not set, it will default to the model of its parent view
        this.model = ko.observable(model);
        
        this.registerDisposable(this.model.subscribe(function(newVal) {
            try {
                this.onModelChanged(model, newVal);
            } finally {
                model = newVal;
            }                                          
        }, this).dispose);
                                
        //Placeholder to store binding disposeal objects
        this.__woBag.bindings = {};
    }, "view"); 
    
    view.setObservable = function(obj, property, value) {
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
            this.__woBag[modelRoutedEventKey].dispose();
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
    
    view.elementHasModelBinding = function(element) {
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
    
    view.reservedPropertyNames = ["constructor", "constructor-tw", "id","id-tw"];
    
    //TODO private
    view.prototype.initialize = function(propertiesXml, parentBindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        ///<param name="propertiesXml" type="Element" optional="false">An XML element containing property setters for the view</param>
        ///<param name="parentBindingContext" type="ko.bindingContext" optional="false">The binding context of the wipeout node just above this one</param>
        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        if(!propertiesXml)
            return;
        
        var prop = propertiesXml.getAttribute("woInvisible");
        if(prop)
            this.woInvisible = parseBool(prop);
                
        if(!view.elementHasModelBinding(propertiesXml) && wipeout.utils.ko.peek(this.model) == null) {
            this.bind('model', parentBindingContext.$data.model);
        }
        
        var bindingContext = this.woInvisible ? parentBindingContext : parentBindingContext.createChildContext(this);        
        enumerate(propertiesXml.attributes, function(attr) {
            // reserved
            if(view.reservedPropertyNames.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = 
",\
            function(val) {\
                if(!ko.isObservable(" + attr.value + "))\
                    throw 'Two way bindings must be between 2 observables';\
                " + attr.value + "(val);\
            }";
            }
            
            try {
                bindingContext.__$woCurrent = this;
                wipeout.template.engine.createJavaScriptEvaluatorFunction(
        "(function() {\
            __$woCurrent.bind('" + name + "', function() {\
                return " + attr.value + ";\
            }" + setter + ");\
\
            return '';\
        })()"
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
                    val.initialize(child, bindingContext);
                }
                
                view.setObservable(this, child.nodeName, val);
            }
        }, this);
    };
    
    view.objectParser = {
        "json": function (value) {
            //TODO: browser compatability
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
        
    view.prototype.onModelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="oldValue" type="Any" optional="false">The old model</param>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>
        
        if(oldValue !== newValue) {
            this.disposeOf(this.__woBag[modelRoutedEventKey]);        
            if(newValue instanceof wipeout.base.routedEventModel) {
                this.__woBag[modelRoutedEventKey] = this.registerDisposable(newValue.__triggerRoutedEventOnVM.register(this.onModelRoutedEvent, this).dispose);
            }
        }
    };
    
    view.prototype.onModelRoutedEvent = function (eventArgs) {
        ///<summary>When the model of this class fires a routed event, catch it and continue the traversal upwards</summary>
        ///<param name="eventArgs" type="wo.routedEventArgs" optional="false">The routed event args</param>
        
        if(!(eventArgs.routedEvent instanceof wipeout.base.routedEvent)) throw "Invaid routed event";
        
        this.triggerRoutedEvent(eventArgs.routedEvent, eventArgs.eventArgs);
    }

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


Class("wipeout.base.contentControl", function () {    

    var contentControl = wipeout.base.view.extend(function (templateId, model) {
        ///<summary>Expands on visual and view functionality to allow the setting of anonymous templates</summary>
        ///<param name="templateId" type="string" optional="true">The template id. If not set, defaults to a blank template</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        this._super(templateId || wipeout.base.visual.getBlankTemplateId(), model);

        //The template which corresponds to the templateId for this item
        this.template = contentControl.createTemplatePropertyFor(this.templateId, this);
    }, "contentControl");
    
//TODO: comments, observable<String>
    contentControl.createTemplatePropertyFor = function(templateIdObservable, owner) {
        ///<summary>Creates a computed for a template property which is bound to the templateIdObservable property</summary>
        ///<param name="templateIdObservable" type="String" optional="false">The observable containing the templateId to create a template property for</param>
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
            owner.registerDisposable(output.dispose);
        
        return output;
    };
    
    var dataTemplateHash = "data-templatehash";  
    var tmp = (function () {
        var templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);
        
        var lazyCreateTemplateArea = function() {
            if (!templateArea) {
                templateArea = wipeout.utils.html.createElement("<div style='display: none'></div>");
                document.body.appendChild(templateArea);
            }
        };

        return { 
            create: function (templateString, forceCreate) {
                ///<summary>Creates an anonymous template within the DOM and returns its id</summary>
                ///<param name="templateString" type="String" optional="false">Gets a template id for an anonymous template</param>
                ///<param name="forceCreate" type="Boolean" optional="true">Force the creation of a new template, regardless of whether there is an existing clone</param>
                ///<returns type="String">The template id</returns>
                
                lazyCreateTemplateArea();

                templateString = trim(templateString);
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
                templateArea.innerHTML += '<script type="text/xml" id="' + id + '" ' + dataTemplateHash + '="' + hash + '">' + templateString + '</script>';
                return id;
            },
            del: function(templateId) {
                ///<summary>Deletes an anonymous template with the given id</summary>
                ///<param name="templateId" type="String" optional="false">The id of the template to delete</param>
                ///<returns type="void"></returns>
                lazyCreateTemplateArea();
            
                for (var j = 0; j < templateArea.childNodes.length; j++) {
                    if (templateArea.childNodes[j].nodeType === 1 &&
                    templateArea.childNodes[j].nodeName === "SCRIPT" &&
                    templateArea.childNodes[j].id === templateId) {
                        templateArea.removeChild(templateArea.childNodes[j]);
                        j--;
                    }
                }
            }
        };
    })();  
    
    contentControl.createAnonymousTemplate = tmp.create;
    contentControl.deleteAnonymousTemplate = tmp.del;

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
        this._super(dispose);    
                                                          
        this.callback = callback;
        this.context = context;
    });;
});

Class("wipeout.base.event", function () {
    
    var event = function() {
        ///<summary>Defines a new event with register and trigger functinality</summary>
        
        //Array of callbacks to fire when event is triggered
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
    
    event.prototype.register = function(callback, context /* optional */) {
        ///<summary>Subscribe to an event</summary>
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="context" type="Any" optional="true">The context "this" to use within the calback</param>
        ///<returns type="wo.eventRegistration">An object with the details of the registration, including a dispose() function</returns>
        
        if(!(callback instanceof Function))
            throw "Invalid event callback";
        
        var reg = this._registrations;
        var evnt = { 
            callback: callback, 
            context: context == null ? window : context,
            dispose: function() {
                var index = reg.indexOf(evnt);
                if(index >= 0)
                    reg.splice(index, 1);
            }
        };
        
        this._registrations.push(evnt);
        
        return new wipeout.base.eventRegistration(evnt.callback, evnt.context, evnt.dispose);
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
        
        // if true, the template will be rendered, otherwise a blank template is rendered
        this.condition = ko.observable();
        
        // the template to render if the condition is false. Defaults to a blank template
        this.elseTemplateId = ko.observable(_if.blankTemplateId);
        this.registerDisposable(this.elseTemplateId.subscribe(this.elseTemplateChanged, this).dispose);
        
        // anonymous version of elseTemplateId
        this.elseTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.elseTemplateId, this);
        
        // stores the template id if the condition is false
        this.__cachedTemplateId = this.templateId();
        
        this.registerDisposable(this.condition.subscribe(this.onConditionChanged, this).dispose);
        this.registerDisposable(this.templateId.subscribe(this.copyTemplateId, this).dispose);
        
        this.copyTemplateId(this.templateId());
    }, "_if");
    
    // picked up by wipeout.base.visual constructor
    _if.woInvisibleDefault = true;
    
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

        //The id of the template to render for each item
        this.itemTemplateId = ko.observable(itemTemplateId);

        //The template which corresponds to the itemTemplateId for this object
        this.itemTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.itemTemplateId, this);
        
        //An array of models to render
        this.itemSource = ko.observableArray([]);
        
        //An array of viewmodels, each corresponding to a mode in the itemSource property
        this.items = ko.observableArray([]);

        if(wipeout.utils.ko.version()[0] < 3) {
            itemsControl.subscribeV2.call(this);
        } else {
            itemsControl.subscribeV3.call(this);
        }
        
        this.registerDisposable(this.items.subscribe(this.syncModelsAndViewModels, this).dispose);

        itemTemplateId = this.itemTemplateId.peek();
        this.registerDisposable(this.itemTemplateId.subscribe(function (newValue) {
            if (itemTemplateId !== newValue) {
                try {
                    this.reDrawItems();
                } finally {
                    itemTemplateId = newValue;
                }
            }
        }, this).dispose);
    }, "itemsControl");
    
    //TODO: private
    itemsControl.subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl</summary>
        var initialItemSource = this.itemSource.peek();
        this.registerDisposable(this.itemSource.subscribe(function() {
            try {
                if(this.modelsAndViewModelsAreSynched())
                    return;
                this._itemSourceChanged(ko.utils.compareArrays(initialItemSource, arguments[0] || []));
            } finally {
                initialItemSource = wipeout.utils.obj.copyArray(arguments[0] || []);
            }
        }, this).dispose);
        
        var initialItems = this.items.peek();
        this.registerDisposable(this.items.subscribe(function() {
            try {
                this._itemsChanged(ko.utils.compareArrays(initialItems, arguments[0] || []));
            } finally {
                initialItems = wipeout.utils.obj.copyArray(arguments[0] || []);
            }
        }, this).dispose);        
    };
    
    //TODO: private
    itemsControl.subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        this.registerDisposable(this.itemSource.subscribe(this._itemSourceChanged, this, "arrayChange").dispose);
        this.registerDisposable(this.items.subscribe(this._itemsChanged, this, "arrayChange").dispose);
        
    };
    
    //TODO: private
    itemsControl.prototype.syncModelsAndViewModels = function() {
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

    //TODO: private
    itemsControl.prototype.modelsAndViewModelsAreSynched = function() {
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
    
    //virtual
    itemsControl.prototype.onItemDeleted = function (item) {
        ///<summary>Disposes of deleted items</summary> 
        ///<param name="item" type="wo.view" optional="false">The item deleted</param>       
        var renderedChild = this.__woBag.renderedChildren.indexOf(item);
        if(renderedChild !== -1)
            this.__woBag.renderedChildren.splice(renderedChild, 1);
        
        item.dispose();
    };

    // virtual
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
        
        //Signals whether the routed event has been handled and should not propagate any further
        this.handled = false;
        
        //The original event args used when the routedEvent has been triggered
        this.data = eventArgs;
        
        //The object which triggered the event
        this.originator = originator;
    };
    
    return routedEventArgs;
});
    

Class("wipeout.base.routedEventRegistration", function () {
    //TODO: private
    var routedEventRegistration = function(routedEvent) {  
        ///<summary>Holds routed event registration details</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        
        // The routed event
        this.routedEvent = routedEvent;
        
        //An inner event to handler triggering callbacks
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
        
        this.__triggerRoutedEventOnVM = new wo.event();
    });
        
    routedEventModel.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event which will propogate to any view models where this object is it's model and continue to bubble from there</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to trigger</param>
        ///<param name="eventArgs" type="Any" optional="true">The routed event args</param>
        
        // Used by wo.model to acertain when a routed event should be fired
        this.__triggerRoutedEventOnVM.trigger({routedEvent: routedEvent, eventArgs: eventArgs});
    };
    
    return routedEventModel;
});


Binding("itemsControl", true, function () {
    
    var itemsControlTemplate = "";
    
    var itemsTemplate = null;
    var staticConstructor = function() {
              
        if(itemsTemplate) return;
        var tmp = "<!-- ko ic-render: $data";
        if(DEBUG) 
            tmp += ", wipeout-type: 'items[' + wipeout.utils.ko.peek($index) + ']'";

        tmp += " --><!-- /ko -->";
        
        itemsTemplate = wipeout.base.contentControl.createAnonymousTemplate(tmp);
    };
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the itemsControl binding</summary>
        var ic = wipeout.utils.ko.peek(viewModel);
        if(ic && !(ic instanceof wipeout.base.itemsControl)) throw "This binding can only be used on an itemsControl";
        
        staticConstructor();
        return ko.bindingHandlers.template.init.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the itemsControl binding</summary>
        var ic = wipeout.utils.ko.peek(viewModel);
        if(ic && !(ic instanceof wipeout.base.itemsControl)) throw "This binding can only be used on an itemsControl";
        
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
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the ic-render binding</summary>
        
        return wipeout.bindings.render.init.call(this, element, valueAccessor, allBindingsAccessor, bindingContext.$parent, bindingContext.$parentContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the ic-render binding</summary>
        
        return wipeout.bindings.render.update.call(this, element, valueAccessor, allBindingsAccessor, bindingContext.$parent, bindingContext.$parentContext);
    };
    
    return {
        init: init,
        update: update
    };
});


Binding("render", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary>
        return ko.bindingHandlers.template.init.call(this, element, wipeout.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };

    var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the render binding</summary>
        
        var child = wipeout.utils.ko.peek(wipeout.utils.ko.peek(valueAccessor()));
        if ((viewModel && !(viewModel instanceof wipeout.base.visual)) || (child && !(child instanceof wipeout.base.visual)))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";
        
        if(child && viewModel && child === viewModel)
            throw "A wo.visual cannot be a child of itself.";
        
        if (child && child.__woBag.rootHtmlElement)
            throw "This visual has already been rendered. Call its unRender() function before rendering again.";
        
        var _this = this;
        var templateChanged = function() {
            if(child)
                child.unTemplate();
                
            ko.bindingHandlers.template.update.call(_this, element, wipeout.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, child, bindingContext);
            
            var bindings = allBindingsAccessor();
            if(bindings["wipeout-type"])
                wipeout.bindings["wipeout-type"].utils.comment(element, bindings["wipeout-type"]);
        };
        
        var previous = ko.utils.domData.get(element, wipeout.bindings.wipeout.utils.wipeoutKey); 
        if(previous instanceof wipeout.base.visual) {
            if(previous.__woBag.createdByWipeout)    
                previous.dispose();
            else    
                previous.unRender();
        }
        
        if (child) {            
            ko.utils.domData.set(element, wipeout.bindings.wipeout.utils.wipeoutKey, child);
            child.__woBag.rootHtmlElement = element;
            if (viewModel)
                viewModel.__woBag.renderedChildren.push(child);
            
            child.templateId.subscribe(templateChanged);
        }
        
        templateChanged();
    };
    
    var createValueAccessor = function(oldValueAccessor) {
        ///<summary>Create a value accessor for the knockout template binding.</summary>
        
        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            var child = oldValueAccessor();
            var _child = ko.utils.unwrapObservable(child);
            
            var output = {
                templateEngine: wipeout.template.engine.instance,
                name: _child ? _child.templateId.peek() : "",                
                afterRender: _child ? function(nodes, context) { 
                    
                    var old = _child.nodes || [];
                    _child.nodes = nodes;
                    _child.onRendered(old, nodes);
                } : undefined
            };
            
            if(child && !child.woInvisible)
                output.data = child || {};
                
            return output;
        };
    };
    
    return {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
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
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wipeout binding. The wipeout binding is the entry point into a wipeout application</summary>

        //TODO: knockout standard way of controling element        
        //TODO: add optional inline properties to binding   
        
        if(ko.utils.domData.get(element, wipeout.bindings.wipeout.utils.wipeoutKey))
            throw "This element is already bound to another model";
        
        var type = valueAccessor();
        if(!type)
            throw "Invalid view type";
            
        var view = new type();
        if(!(view instanceof wipeout.base.view))
            throw "Invalid view type";        
        
        view.model(viewModel);   
        
        var output = ko.bindingHandlers.render.init.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        ko.bindingHandlers.render.update.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        
        view.onApplicationInitialized();
        
        return output;
    };
    
    var createValueAccessor = function(view) {
        ///<summary>Create a value accessor for the render binding.</summary>
        return function() {
            return view;
        };
    };
     
    return {
        init: init,
        utils: {
            createValueAccessor: createValueAccessor,
            wipeoutKey: "__wipeout"
        }
    };
});

// Render From Script
Binding("wo", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wo binding. The wo binding renders viewmodels. It is mostly used internally by wipeout</summary>
        
        var vals = wipeout.template.engine.scriptCache[valueAccessor()](bindingContext);
        if(vals.id) {
            var current = bindingContext;
            while(current.$data.woInvisible)
                current = current.$parentContext;
            
            current.$data.templateItems[vals.id] = vals.vm;
        }
        
        var init = wipeout.bindings.render.init.call(this, element, function() { return vals.vm; }, allBindingsAccessor, viewModel, bindingContext);
        wipeout.bindings.render.update.call(this, element, function() { return vals.vm; }, allBindingsAccessor, viewModel, bindingContext);
        return init;
    };
    
    return {
        init: init
    };
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


Class("wipeout.template.engine", function () {
    
    var engine = function() {
        ///<summary>The wipeout template engine, inherits from ko.templateEngine</summary>
    };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorFunction = function(script) {
        ///<summary>Modify a block of script so that it's running context is bindingContext.$data first and biningContext second</summary>
        ///<param name="script" type="String">The script to modify</param>
        ///<returns type="Function">The compiled script</returns>
        return new Function("bindingContext", "with(bindingContext) {\n\twith($data) {\n\t\treturn " + script + ";\n\t}\n}");
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
        ///<param name="templateDocument"></param>
        
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
            engine.scriptCache[newScriptId] = function(parentBindingContext) {
                var vm = wipeout.utils.obj.createObject(xmlElement.nodeName);    
                if(!(vm instanceof wipeout.base.view)) throw "Only wo.view elements can be created in this way";
                vm.__woBag.createdByWipeout = true;
                vm.initialize(xmlElement, parentBindingContext);                
                return {
                    vm: vm,
                    id: engine.getId(xmlElement)
                };
            };
            
            var tags = "<!-- ko";
            if(DEBUG)
                tags += " wipeout-type: '" + xmlElement.nodeName + "',";
            
            tags += " wo: " + newScriptId + " --><!-- /ko -->";
            
            var nodes = new DOMParser().parseFromString("<root>" + rewriterCallback(tags) + "</root>", "application/xml").documentElement;
            while(nodes.childNodes.length) {
                var node = nodes.childNodes[0];
                node.parentNode.removeChild(node);
                xmlElement.parentNode.insertBefore(node, xmlElement);
            };
            
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
        var xmlTemplate = new DOMParser().parseFromString("<root>" + script.textContent + "</root>", "application/xml").documentElement;        
        if(xmlTemplate.firstChild && xmlTemplate.firstChild.nodeName === "parsererror") {
            //TODO: copy pasted
			throw "Invalid xml template:\n" + ser.serializeToString(xmlTemplate.firstChild);
		}
        
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
        //TODO: check object types
        ///<param name="templateSource" type="Object">The template</param>
        ///<param name="bindingContext" type="ko.bindingContext">The current binding context to apply to the template</param>
        ///<param name="options" type="Object">The knockout template options</param>
        ///<returns type="Array">An array of html nodes to insert</returns>
        
        // if data is not a view, cannot render.
        //TODO: default to native template engine
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
        
        // pre rendered strings or string generating functions which make up the final html
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
        ///<param name="templateString">The template</param>
                   
        // need to convert to xml and back as string is an XML string, not a HTML string
        var xmlTemplate = new DOMParser().parseFromString("<root>" + templateString + "</root>", "application/xml").documentElement;        
        if(xmlTemplate.firstChild && xmlTemplate.firstChild.nodeName === "parsererror") {
			var ser = new XMLSerializer();
			throw "Invalid xml template:\n" + ser.serializeToString(xmlTemplate.firstChild);
		}
        
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
    
    //TODO: this is done at render time, can it be cached?
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
        ///<returns type="String">A string version of the template<returns>
        var result = [];
        var ser = new XMLSerializer();
        
        enumerate(xmlTemplate.childNodes, function(child) {            
            if(child.nodeType == 1) {
                
                // create copy with no child nodes
                var ch = new DOMParser().parseFromString(ser.serializeToString(child), "application/xml").documentElement;
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
        if (wipeout.utils.ko.virtualElements.isVirtual(element)) {
            var parent = wipeout.utils.ko.virtualElements.parentElement(element);
            
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
            if (wipeout.utils.ko.virtualElements.isVirtualClosing(children[i])) {
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
            if (wipeout.utils.ko.virtualElements.isVirtual(children[i]))
                depth++;
        }
 
        return output;
    };
    
    var getViewModel = function(forHtmlNode) {
        ///<summary>Get the view model associated with a html node</summary>
        ///<param name="forHtmlNode" type="HTMLNode">The element which is the root node of a wo.view</param>
        ///<returns type="wo.view">The view model associated with this node, or null</returns>
        var vm = ko.utils.domData.get(forHtmlNode, wipeout.bindings.wipeout.utils.wipeoutKey);
        if(vm)
            return vm;
        
        var parent = wipeout.utils.ko.virtualElements.parentElement(forHtmlNode);
        if(parent)
            return getViewModel(parent);
        
        return null;
    };
    
    var html = function() { };
    
    html.cannotCreateTags = cannotCreateTags;
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
    
    //TODO: this
    _ko.isObservableArray = function(test) {
        ///<summary>Like ko.isObservable, but for observableArrays</summary>
        ///<param name="test" type="Any">An object to test</param>
        ///<returns type="Boolean"></returns>
        return ko.isObservable(test) && test.push && test.push.constructor === Function;
    };
    
    _ko.virtualElements = {
        parentElement: function(node) {
            ///<summary>Returns the parent element or parent knockout virtual element of a node</summary>
            ///<param name="node" type="HTMLNode">The child element</param>
            ///<returns type="HTMLNode">The parent</returns>
            var current = node.previousSibling;
            while(current) {
                if(_ko.virtualElements.isVirtual(current)) {
                    return current;
                }
                
                current = current.previousSibling;
            }
            
            return node.parentNode;
        },
        //TODO: this
        isVirtual: function(node) {
            ///<summary>Whether a html node is a knockout virtual element or not</summary>
            ///<param name="node" type="HTMLNode">The node to test</param>
            ///<returns type="Boolean"></returns>
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0;
        },
        //TODO: this
        isVirtualClosing: function(node) {
            ///<summary>Whether a html node is a knockout virtual element closing tag</summary>
            ///<param name="node" type="HTMLNode">The node to test</param>
            ///<returns type="Boolean"></returns>
            return node.nodeType === 8 && trim(node.nodeValue) === "/ko";
        }
    };
    
    return _ko;
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
