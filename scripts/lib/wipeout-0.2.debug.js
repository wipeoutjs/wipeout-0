(function () { 
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var object = function () {
        ///<summary>The object class is the base class for all wipeout objects. It has base functionality for inheritance and parent methods</summary>
    };
    
    var cachedSuperMethods = {
        parents:[],
        children:[]
    };
    
    object.prototype._super = function() {        
        ///<summary>Call the current method or constructor of the parent class with arguments</summary>
        
        // try to find a cached version to skip lookup of parent class method
        var superIndex = cachedSuperMethods.children.indexOf(arguments.callee.caller);
        var cached = superIndex === -1 ? null : cachedSuperMethods.parents[superIndex];
        
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
                for(var method in inheritanceTree[i]) {
                    if(inheritanceTree[i][method] === arguments.callee.caller) {
                        
                        for(var j = i - 1; j >= 0; j--) {
                            if(inheritanceTree[j][method] !== arguments.callee.caller) {
                                cached = inheritanceTree[j][method];
                                
                                // map the current method to the method it overrides
                                cachedSuperMethods.children.push(arguments.callee.caller);
                                cachedSuperMethods.parents.push(cached);
                                
                                break;
                            }
                        }
                        
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
        ///<summary>Use prototype inheritance to inherit from this class. Supports "instanceof" checks</summary>
 
        // static items
        for (var p in this)
            if (this.hasOwnProperty(p)) childClass[p] = this[p];
 
        // will ensure any subsequent changes to the parent class will reflect in child class
        function prototypeTracker() { this.constructor = childClass; }
 
        prototypeTracker.prototype = this.prototype;
 
        // inherit
        childClass.prototype = new prototypeTracker();
        return childClass;
    };

    wpfko.base.object = object;
})();


var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var visual = wpfko.base.object.extend(function (templateId) {
        ///<summary>Base class for anything with a visual element. Interacts with the wipeout template engine to render content</summary>
        this._super();
        
        //Dictionary of items created within the current template. The items can be visuals or html elements
        this.templateItems = {};
        
        //TODO: is this different to templateItems?
        //Array of visuals created within the current template.
        this.renderedChildren = [];        
        
        //The html element or virtual element which is the root node of the template of this visual
        this._rootHtmlElement = null;        
        
        //Collection event subsciptions for routed events triggered on this object
        this._routedEventSubscriptions = [];
        
        //The template of the visual, giving it an appearance
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());
    });
    
    visual._afterRendered = function(nodes, context) {
        ///<summary>Used by the render binding to trigger the rootHtmlChanged method</summary>
        var old = context.nodes || [];
        context.nodes = nodes;
        context.rootHtmlChanged(old, nodes);
    };
    
    visual.prototype.dispose = function() {
        ///<summary>Dispose of this visual</summary>
        
        // dispose of any computeds
        for(var i in this)
            if(ko.isObservable(this[i]) && this[i].dispose instanceof Function)
                this[i].dispose();
        
        // dispose of all template items
        for(var i in this.templateItems)
            if(this.templateItems[i] instanceof visual) 
                this.templateItems[i].dispose();
        
        // dispose of all rendered children
        for(var i = 0, ii = this.renderedChildren.length; i < ii; i++)
            if(this.renderedChildren[i] instanceof visual) 
                this.renderedChildren[i].dispose();
        
        this.renderedChildren.length = 0;
        this._rootHtmlElement = null;
                
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++)
            this._routedEventSubscriptions[i].event.dispose();        
        this._routedEventSubscriptions.length = 0;
    };
    
    //TODO: move to util
    visual.getParentElement = function(element) {
        ///<summary>Gets the parent or virtual parent of the element</summary>
        
        var depth = 0;
        var current = element.previousSibling;
        while(current) {
            if(wpfko.util.ko.virtualElements.isVirtualClosing(current)) {
                depth--;
            }
            
            if(wpfko.util.ko.virtualElements.isVirtual(current)) {
                if(depth === 0)
                    return current;
                
                depth++;
            }
            
            current = current.previousSibling;
        }
        
        return element.parentElement;
    };
    
    visual.prototype.getParents = function() {
        ///<summary>Gets an array of the entire tree of ancestor visual objects</summary>
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
        var nextTarget;
        var current = visual.getParentElement(this._rootHtmlElement);
        while(current) {
            if(nextTarget = ko.utils.domData.get(current, wpfko.ko.bindings.wpfko.utils.wpfkoKey)) {
                return nextTarget;
            }
            
            current = visual.getParentElement(current);
        }        
    };
    
    visual.prototype.unRegisterRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {  
        ///<summary>Unregister from a routed event. The callback and callback context must tbe the same as those passed in during registration</summary>      
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++) {
            if(this._routedEventSubscriptions[i].routedEvent === routedEvent) {
                this._routedEventSubscriptions[i].event.unRegister(callback, context);
                return;
            }
        }  
    };
    
    visual.prototype.registerRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {
        ///<summary>Register for a routed event</summary>    
        
        var rev;
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++) {
            if(this._routedEventSubscriptions[i].routedEvent === routedEvent) {
                rev = this._routedEventSubscriptions[i];
                break;
            }
        }
        
        if(!rev) {
            rev = new wpfko.base.routedEventRegistration(routedEvent);
            this._routedEventSubscriptions.push(rev);
        }
        
        rev.event.register(callback, callbackContext);
    };
    
    visual.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event. The event will bubble upwards to all ancestors of this visual</summary>    
        if(!(eventArgs instanceof wpfko.base.routedEventArgs)) {
            eventArgs = new wpfko.base.routedEventArgs(eventArgs, this);
        }
        
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++) {
            if(eventArgs.handled) return;
            if(this._routedEventSubscriptions[i].routedEvent === routedEvent) {
                this._routedEventSubscriptions[i].event.trigger(eventArgs);
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
    visual.prototype.rootHtmlChanged = function (oldValue, newValue) {
        ///<summary>Triggered each time after a template is rendered</summary>    
    };
    
    visual.getDefaultTemplateId = (function () {
        var templateId = null;
        return function () {
            ///<summary>Returns the Id for the default template</summary>    
            if (!templateId) {
                templateId = wpfko.base.contentControl.createAnonymousTemplate("<span>No template has been specified</span>");
            }

            return templateId;
        };
    })();
    
    visual.getBlankTemplateId = (function () {
        var templateId = null;
        return function () {
            ///<summary>Returns the Id for an empty template</summary>    
            if (!templateId) {
                templateId = wpfko.base.contentControl.createAnonymousTemplate("");
            }

            return templateId;
        };
    })();
        
    visual.visualGraph = function (rootElement, displayFunction) {
        ///<summary>Compiles a tree of all visual elements in a block of html, starting at the rootElement</summary>    
        if (!rootElement)
            return [];
 
        displayFunction = displayFunction || function() { return typeof arguments[0]; };
 
        var output = [];
        wpfko.util.obj.enumerate(wpfko.util.html.getAllChildren(rootElement), function (child) {
            wpfko.util.obj.enumerate(visual.visualGraph(child), output.push, output);
        });
 
        var vm = ko.utils.domData.get(rootElement, wpfko.ko.bindings.wpfko.utils.wpfkoKey);        
        if (vm) {
            return [{ viewModel: vm, display: displayFunction(vm), children: output}];
        }
 
        return output;
    };
    
    // list of html tags which will not be treated as objects
    visual.reservedTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    
    wpfko.base.visual = visual;
})();


    var wpfko = wpfko || {};
    wpfko.base = wpfko.base || {};

(function () {    

    var view = wpfko.base.visual.extend(function (templateId, model /*optional*/) {        
        ///<summary>Extends on the visual class to provide expected MVVM functionality, such as a model and bindings</summary>    

        this._super(templateId);
        
        //The model of view. If not set, it will default to the model of its parent view
        this.model = ko.observable(model || null);
        
        var model = null;
        this.model.subscribe(function(newVal) {
            try {
                this.modelChanged(model, newVal);
            } finally {
                model = newVal;
            }                                          
        }, this);
        
        //Placeholder to store binding disposeal objects
        this._bindings = {};
    });    
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    var setObservable = function(obj, property, value) {
        if(ko.isObservable(obj[property])) {
            obj[property](ko.utils.unwrapObservable(value));
        } else {
            obj[property] = ko.utils.unwrapObservable(value);
        }
    };
    
    // virtual
    view.prototype.onInitialized = function() {
        ///<summary>Called by the template engine after a view is created and all of its properties are set</summary>    
    }
    
    view.prototype.dispose = function() {
        ///<summary>Dispose of view specific items</summary>    
        this._super();
        
        for(var i in this._bindings)
            this._bindings[i].dispose();
    };
    
    view.prototype.bind = function(property, valueAccessor, twoWay) {
        ///<summary>Bind the value returned by valueAccessor to this[property]</summary>
        
        if(twoWay && (!ko.isObservable(this[property]) || !ko.isObservable(valueAccessor())))
           throw 'Two way bindings must be between 2 observables';
           
        if(this._bindings[property]) {
            this._bindings[property].dispose();
            delete this._bindings[property];
        }
        
        var toBind = ko.dependentObservable({ 
            read: function() { return ko.utils.unwrapObservable(valueAccessor()); },
            write: twoWay ? function() { var va = valueAccessor(); if(va) va(arguments[0]); } : undefined
        });                                 
        
        setObservable(this, property, toBind.peek());
        var subscription1 = toBind.subscribe(function(newVal) {
            setObservable(this, property, newVal);
        }, this);
        
        var subscription2 = twoWay ?
            this[property].subscribe(function(newVal) {
                setObservable({x: toBind}, "x", newVal);
            }, this) :
            null;
        
        this._bindings[property] = {
            dispose: function() {
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
            }
        };
    };
    
    view.reservedPropertyNames = ["constructor", "constructor-tw", "id","id-tw"];
    
    //TODO private
    view.prototype.initialize = function(propertiesXml, bindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        if(!propertiesXml)
            return;
                
        if(!wpfko.template.htmlBuilder.elementHasModelBinding(propertiesXml) && wpfko.util.ko.peek(this.model) == null) {
            this.bind('model', bindingContext.$parent.model);
        }
        
        enumerate(propertiesXml.attributes, function(attr) {
            // reserved
            if(view.reservedPropertyNames.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = ",\n\t\t\tfunction(val) {\n\t\t\t\tif(!ko.isObservable(" + attr.value + "))\n\t\t\t\t\tthrow 'Two way bindings must be between 2 observables';\n\t\t\t\t" + attr.value + "(val);\n\t\t\t}";
            }
            
            wpfko.template.engine.createJavaScriptEvaluatorFunction("(function() {\n\t\t\t$data.bind('" + name + "', function() {\n\t\t\t\treturn " + attr.value + ";\n\t\t\t}" + setter + ");\n\n\t\t\treturn '';\n\t\t})()")(bindingContext);
        });
        
        enumerate(propertiesXml.childNodes, function(child, i) {
            
            if(child.nodeType !== 1) return;
            
            // default
            var type = "string";
            for(var j = 0, jj = child.attributes.length; j < jj; j++) {
                if(child.attributes[j].nodeName === "constructor" && child.attributes[j].nodeValue) {
                    type = child.attributes[j].nodeValue;
                    break;
                }
            }
            
            if (view.objectParser[type.replace(/^\s+|\s+$/g, '').toLowerCase()]) {
                var innerHTML = [];
                var ser = ser || new XMLSerializer();
                for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                    innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }
            
                var val = view.objectParser[type.replace(/^\s+|\s+$/g, '').toLowerCase()](innerHTML.join(""));
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }
            } else {
                var val = wpfko.util.obj.createObject(type);
                val.initialize(child, bindingContext.createChildContext(val));
                
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }     
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
            var tmp = value.replace(/^\s+|\s+$/g, '').toLowerCase();
            return tmp ? tmp !== "false" && tmp !== "0" : false;
        },
        "int": function (value) {
            return parseInt(value.replace(/^\s+|\s+$/g, ''));
        },
        "float": function (value) {
            return parseFloat(value.replace(/^\s+|\s+$/g, ''));
        },
        "regexp": function (value) {
            return new RegExp(value.replace(/^\s+|\s+$/g, ''));
        },
        "date": function (value) {
            return new Date(value.replace(/^\s+|\s+$/g, ''));
        }
    };
    
    // virtual
    view.prototype.modelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
    };

    wpfko.base.view = view;
})();



var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {    

    var contentControl = wpfko.base.view.extend(function (templateId) {
        ///<summary>Expands on visual and view functionality to allow the setting of anonymous templates</summary>
        this._super(templateId || wpfko.base.visual.getBlankTemplateId());

        //The template which corresponds to the templateId for this item
        this.template = contentControl.createTemplatePropertyFor(this.templateId, this);
    });
    
    contentControl.createTemplatePropertyFor = function(templateIdObservable, owner) {
        ///<summary>Creates a computed for a template property which is bound to the templateIdObservable property</summary>
        return ko.dependentObservable({
            read: function () {
                var script = document.getElementById(templateIdObservable());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                templateIdObservable(wpfko.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: owner
        });
    };
    
    var dataTemplateHash = "data-templatehash";    
    contentControl.createAnonymousTemplate = (function () {
        var templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);

        return function (templateString) {
            ///<summary>Creates an anonymous template within the DOM and returns its id</summary>

            // lazy create div to place anonymous templates
            if (!templateArea) {
                templateArea = wpfko.util.html.createElement("<div style='display: none'></div>");
                document.body.appendChild(templateArea);
            }

            templateString = templateString.replace(/^\s+|\s+$/g, '');
            var hash = contentControl.hashCode(templateString).toString();

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

            var id = "AnonymousTemplate" + (++i);
            templateArea.innerHTML += '<script type="text/xml" id="' + id + '" ' + dataTemplateHash + '="' + hash + '">' + templateString + '</script>';
            return id;
        };
    })();

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    contentControl.hashCode = function (str) {        
        ///<summary>Creates a rough has code for the given string</summary>
        var hash = 0;
        for (var i = 0, ii = str.length; i < ii; i++) {
            var ch = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash;
    };
    
    wpfko.base.contentControl = contentControl;
})();


var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var event = function() {
        ///<summary>Defines a new event with register and trigger functinality</summary>
        
        //Array of callbacks to fire when event is triggered
        this._registrations = [];
    };

    event.prototype.trigger = function(eventArgs) {
        ///<summary>Trigger the event, passing the eventArgs to each subscriber</summary>
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
            if(eventArgs instanceof wpfko.base.routedEventArgs && eventArgs.handled) return;
            
            this._registrations[i].callback.call(this._registrations[i].context, eventArgs);
        }
    };
    
    event.prototype.unRegister = function (callback, context /* optional */) {
        ///<summary>Un subscribe to an event. The callback and context must be the same as those passed in the original registration</summary>
        context = context == null ? window : context;
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
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
        
        return {
            callback: evnt.callback, 
            context: evnt.context,
            dispose: evnt.dispose
        };
    };
    
    wpfko.base.event = event;
})();


var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};
(function () {
    
    var deafaultTemplateId;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wpfko.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>");
    }
    
    var itemsControl = wpfko.base.contentControl.extend(function (templateId, itemTemplateId) {
        ///<summary>Bind a list of models (itemSource) to a list of view models (items) and render accordingly</summary>
        
        staticConstructor();
        this._super(templateId || deafaultTemplateId);

        //The id of the template to render for each item
        this.itemTemplateId = ko.observable(itemTemplateId);

        //The template which corresponds to the itemTemplateId for this object
        this.itemTemplate = wpfko.base.contentControl.createTemplatePropertyFor(this.itemTemplateId, this);
        
        //An array of models to render
        this.itemSource = ko.observableArray([]);
        
        //An array of viewmodels, each corresponding to a mode in the itemSource property
        this.items = ko.observableArray([]);

        if(wpfko.util.ko.version()[0] < 3) {
            itemsControl.subscribeV2.call(this);
        } else {
            itemsControl.subscribeV3.call(this);
        }
        
        this.items.subscribe(this.syncModelsAndViewModels, this);

        var itemTemplateId = this.itemTemplateId.peek();
        this.itemTemplateId.subscribe(function (newValue) {
            if (itemTemplateId !== newValue) {
                try {
                    this.reDrawItems();
                } finally {
                    itemTemplateId = newValue;
                }
            }
        }, this);
    });
    
    //TODO: private
    itemsControl.subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl</summary>
        var initial = this.itemSource.peek();
        this.itemSource.subscribe(function() {
            try {
                if(this.modelsAndViewModelsAreSynched())
                    return;
                this.itemsChanged(ko.utils.compareArrays(initial, arguments[0] || []));
            } finally {
                initial = wpfko.util.obj.copyArray(arguments[0] || []);
            }
        }, this);
        
    };
    
    //TODO: private
    itemsControl.subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        this.itemSource.subscribe(this.itemsChanged, this, "arrayChange");
        
    };
    
    //TODO: private
    itemsControl.prototype.syncModelsAndViewModels = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
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

    itemsControl.prototype.itemsChanged = function (changes) { 
        ///<summary>Adds, removes and moves view models depending on changes to the models array</summary>
        var items = this.items();
        var del = [], add = [], move = {}, delPadIndex = 0;
        for(var i = 0, ii = changes.length; i < ii; i++) {
            if(changes[i].status === wpfko.util.ko.array.diff.retained) continue;            
            else if(changes[i].status === wpfko.util.ko.array.diff.deleted) {
                del.push((function(change) {
                    return function() {
                        var removed = items.splice(change.index + delPadIndex, 1)[0];
                        if(change.moved != null)
                            move[change.moved + "." + change.index] = removed;
                        
                        delPadIndex--;
                    };
                })(changes[i]));
            } else if(changes[i].status === wpfko.util.ko.array.diff.added) {
                add.push((function(change) {
                    return function() {
                        var added = change.moved != null ? move[change.index + "." + change.moved] : this.createItem(change.value);
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

    // virtual
    itemsControl.prototype.createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        return new wpfko.base.view(this.itemTemplateId(), model);        
    }

    itemsControl.prototype.reDrawItems = function () {
        ///<summary>Destroys and re-draws all view models</summary>
        var models = this.itemSource() || [];
        var values = this.items();
        values.length = models.length;
        for (var i = 0, ii = models.length; i < ii; i++) {
            values[i] = this.createItem(models[i]);
        }

        this.items.valueHasMutated();
    };

    wpfko.base.itemsControl = itemsControl;
})();


var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var routedEvent = function() {
        ///<summary>A routed event is triggerd on a visual and travels up to ancestor visuals all the way to the root of the application</summary>
    };

    routedEvent.prototype.trigger = function(triggerOnVisual, eventArgs) {
        ///<summary>Trigger a routed event on a visual</summary>
        triggerOnVisual.triggerRoutedEvent(this, new routedEventArgs(eventArgs, triggerOnVisual));
    };
    
    routedEvent.prototype.unRegister = function (callback, triggerOnVisual, context /* optional */) {
        ///<summary>Unregister a routed event on a visual</summary>
        triggerOnVisual.unRegisterRoutedEvent(this, callback, context);
    }
    
    routedEvent.prototype.register = function(callback, triggerOnVisual, context /* optional */) {
        ///<summary>Register a routed event on a visual</summary>
        triggerOnVisual.registerRoutedEvent(this, callback, context);
    };
    
    wpfko.base.routedEvent = routedEvent;
    
    var routedEventArgs = function(eventArgs, originator) { 
        ///<summary>Arguments passed to routed event handlers. Set handled to true to stop routed event propogation</summary>
        
        //Signals whether the routed event has been handled and should not propagate any further
        this.handled = false;
        
        //The original event args used when the routedEvent has been triggered
        this.data = eventArgs;
        
        //The object which triggered the event
        this.originator = originator;
    };
    
    wpfko.base.routedEventArgs = routedEventArgs;
    
    //TODO: private
    var routedEventRegistration = function(routedEvent) {  
        ///<summary>Holds routed event registration details</summary>
        
        // The routed event
        this.routedEvent = routedEvent;
        
        //An inner event to handler triggering callbacks
        this.event = new wpfko.base.event();
    };
    
    wpfko.base.routedEventRegistration = routedEventRegistration;
})();

var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (!(viewModel instanceof wpfko.base.itemsControl))
            throw "This binding can only be used within the context of a wo.itemsControl";

        ko.virtualElements.emptyNode(element);
        if (wpfko.util.ko.version()[0] < 3) {
            utils.subscribeV2(element, viewModel, bindingContext);
        } else {
            utils.subscribeV3(element, viewModel, bindingContext);
        }

        itemsChanged(element, viewModel, bindingContext)(ko.utils.compareArrays([], viewModel.items.peek()));
    };
    
    var itemsChanged = function(element, viewModel, bindingContext) {
        return function(changes) {                
            var del = [], add = [], move = {}, delPadIndex = 0;
            for(var i = 0, ii = changes.length; i < ii; i++) {
                if(changes[i].status === wpfko.util.ko.array.diff.retained) continue;            
                else if(changes[i].status === wpfko.util.ko.array.diff.deleted) {
                    del.push((function(change) {
                        return function() {
                            if(change.moved != null) {
                                move[change.moved + "." + change.index] = { vm: change.value, elements: change.value._rootHtmlElement.__wpfko.allElements() };
                            } else {
                                ko.virtualElements.emptyNode(change.value._rootHtmlElement);
                            }
                            
                            // calculate a second time as value may have been changed by ko.virtualElements.emptyNode()
                            var elements = change.value._rootHtmlElement.__wpfko.allElements();
                            for(var j = 0, jj= elements.length; j< jj; j++) {
                                elements[j].parentNode.removeChild(elements[j]);
                            }
                            
                            if(change.moved == null)
                                change.value.dispose();
                            
                            delPadIndex--;
                        };
                    })(changes[i]));
                } else if(changes[i].status === wpfko.util.ko.array.diff.added) {
                    add.push((function(change) {
                        return function() {
                            var index= viewModel.items.indexOf(change.value);
                            if(change.moved != null) {  
                                var item = move[change.index + "." + change.moved];
                                if(index === 0) {
                                    for(var j = item.elements.length - 1; j >= 0; j--) {
                                        ko.virtualElements.prepend(element, item.elements[j]);
                                    }                                        
                                } else {
                                    var before = viewModel.items.peek()[index -1];
                                    for(var j = item.elements.length - 1; j >= 0; j--) {
                                        before._rootHtmlElement.__wpfko.insertAfter(item.elements[j]);
                                    }
                                }
                            } else {
                                var container = wpfko.util.html.createWpfkoComment();
                                if(index === 0) {
                                    ko.virtualElements.prepend(element, container.close);
                                    ko.virtualElements.prepend(element, container.open);   
                                } else {
                                    viewModel.items.peek()[index - 1]._rootHtmlElement.__wpfko.insertAfter(container.close);
                                    viewModel.items.peek()[index - 1]._rootHtmlElement.__wpfko.insertAfter(container.open);
                                }           
                                
                                var acc = (function(i) {
                                    return function() {
                                        return change.value;
                                    };
                                })(i);
                                
                                wpfko.ko.bindings.render.init(container.open, acc, acc, viewModel, bindingContext);
                                wpfko.ko.bindings.render.update(container.open, acc, acc, viewModel, bindingContext);
                            }
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
        }
    };
    
    var utils = {
        subscribeV2: function(element, viewModel, bindingContext) {            
            ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl<summary>            
            
            var items = wpfko.util.obj.copyArray(viewModel.items.peek());
            var handler = utils.itemsChanged(element, viewModel, bindingContext);
                        
            viewModel.items.subscribe(function() {            
                try {
                    var changes = ko.utils.compareArrays(items, arguments[0] || []);
                    handler(changes);
                } finally {
                    items = wpfko.util.obj.copyArray(viewModel.items.peek());
                }
            });
        },
        subscribeV3: function(element, viewModel, bindingContext) {            
            viewModel.items.subscribe(utils.itemsChanged(element, viewModel, bindingContext), window, "arrayChange");
        },
        itemsChanged: itemsChanged
    };
        
    wpfko.ko.bindings.itemsControl = {
        init: init,
        utils: utils
    };
            
    ko.bindingHandlers.itemsControl = {};
    ko.virtualElements.allowedBindings.itemsControl = true;
    for(var i in wpfko.ko.bindings.itemsControl) {
        if(i !== "utils") {
            ko.bindingHandlers.itemsControl[i] = wpfko.ko.bindings.itemsControl[i];
        }
    };
})();


var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
        
        var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return ko.bindingHandlers.template.init.call(this, element, wpfko.ko.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
        };

        var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var child = wpfko.util.ko.peek(valueAccessor());
            if ((viewModel && !(viewModel instanceof wpfko.base.visual)) || (child && !(child instanceof wpfko.base.visual)))
                throw "This binding can only be used to render a wo.visual within the context of a wo.visual";
            
            var _this = this;
            var templateChanged = function() {
                ko.bindingHandlers.template.update.call(_this, element, wpfko.ko.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, child, bindingContext);
            };

            if (child) {
                if (child._rootHtmlElement)
                    throw "This visual has already been rendered";
                
                ko.utils.domData.set(element, wpfko.ko.bindings.wpfko.utils.wpfkoKey, child);
                child._rootHtmlElement = element;
                if (viewModel) viewModel.renderedChildren.push(child);
                child.templateId.subscribe(templateChanged);
            }
            
            templateChanged();
        };
    
    var createValueAccessor = function(oldValueAccessor) {
        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            var child = oldValueAccessor();
            var _child = ko.utils.unwrapObservable(child);
            return {
                name: _child ? _child.templateId.peek() : "",
                data: child || {},
                afterRender: _child ? wpfko.base.visual._afterRendered : undefined
            }
        };
    };
    
    wpfko.ko.bindings.render = {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.render = {};
    ko.virtualElements.allowedBindings.render = true;
    for(var i in wpfko.ko.bindings.render) {
        if(i !== "utils") {
            ko.bindingHandlers.render[i] = wpfko.ko.bindings.render[i];
        }
    };
    
    // backwards compatibility
    ko.bindingHandlers.renderChild = {
        init: ko.bindingHandlers.render.init,
        update: ko.bindingHandlers.render.update
    }
})();


var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        //TODO: knockout standard way of controling element        
        //TODO: add optional inline properties to binding   
        
        if(ko.utils.domData.get(element, wpfko.ko.bindings.wpfko.utils.wpfkoKey))
            throw "This element is already bound to another model";
        
        var type = valueAccessor();
        if(!type)
            throw "Invalid view type";
            
        var view = new type();
        if(!(view instanceof wpfko.base.view))
            throw "Invalid view type";        
        
        view.model(viewModel);   
        
        var output = ko.bindingHandlers.render.init.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        ko.bindingHandlers.render.update.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        return output;
    };
    
    var createValueAccessor = function(view) {
        return function() {
            return view;
        };
    };
     
    wpfko.ko.bindings.wpfko = {
        init: init,
        utils: {
            createValueAccessor: createValueAccessor,
            wpfkoKey: "__wpfko"
        }
    };
            
    ko.bindingHandlers.wpfko = {};
    ko.virtualElements.allowedBindings.wpfko = true;
    for(var i in wpfko.ko.bindings.wpfko) {
        if(i !== "utils") {
            ko.bindingHandlers.wpfko[i] = wpfko.ko.bindings.wpfko[i];
        }
    };
})();


var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var engine = function() { };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorFunction = function(script) {
        return new Function("bindingContext", "with(bindingContext) {\n\twith($data) {\n\t\treturn " + script + ";\n\t}\n}");
    }
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        var scriptId = engine.newScriptId();
        
        if(script instanceof Function) {
            engine.scriptCache[scriptId] = script;
        } else {        
            engine.scriptCache[scriptId] = engine.createJavaScriptEvaluatorFunction(script); 
        }
               
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        return engine.createJavaScriptEvaluatorBlock(script);
    };    
    
    engine.prototype.isTemplateRewritten = function (template, templateDocument) {
        //TODO: if template is not a string
        if(template && template.constructor === String) {
            var script = document.getElementById(template);
            if(engine.scriptHasBeenReWritten.test(script.textContent))
                this.makeTemplateSource(template, templateDocument).data("isRewritten", true);
        }
        
        return ko.templateEngine.prototype.isTemplateRewritten.apply(this, arguments);
    };
    
    
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        
        // if data is not a view, cannot render.
        //TODO: default to native template engine
        if (!(bindingContext.$data instanceof wpfko.base.view))
            return [];
        
        var cached = templateSource['data']('precompiled');
        if (!cached) {
            cached = new wpfko.template.xmlTemplate(templateSource.text());
            templateSource['data']('precompiled', cached);
        }
        
        var output;
        
        // wrap in a computed so that observable evaluations will not propogate to the template engine
        ko.dependentObservable(function() {
            cached.rebuild(bindingContext);
            output = cached.render(bindingContext)
        }, this).dispose();
        
        return output;
    };
    
    engine.newScriptId = (function() {        
        var i = Math.floor(Math.random() * 10000);        
        return function() {
            return (++i).toString();
        };
    })();
    
    engine.scriptCache = {};
    engine.openCodeTag = "<!-- wpfko_code: {"
    engine.closeCodeTag = "} -->";
    engine.scriptHasBeenReWritten = RegExp(engine.openCodeTag.replace("{", "\{") + "[0-9]+" + engine.closeCodeTag.replace("}", "\}"));
    
    wpfko.template.engine = engine;    
    ko.setTemplateEngine(new engine());    
})();


var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var htmlBuilder = function(xmlTemplate) {
        
        this.render = htmlBuilder.generateRender(xmlTemplate);
    };
    
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    htmlBuilder.elementHasModelBinding = function(element) {
        
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
    
    htmlBuilder.constructorExists = function(constructor) {
        
        constructor = constructor.split(".");
        var current = window;
        for(var i = 0, ii = constructor.length; i < ii; i++) {
            current = current[constructor[i]];
            if(!current) return false;
        }
        
        return current instanceof Function;
    };
    
    htmlBuilder.generateRender = function(xmlTemplate) {
        var open = wpfko.template.engine.openCodeTag;
        var close = wpfko.template.engine.closeCodeTag;
        
        var template = wpfko.template.htmlBuilder.generateTemplate(xmlTemplate);
                 
        var startTag, endTag;
        var result = [];
        while((startTag = template.indexOf(open)) !== -1) {
            result.push(template.substr(0, startTag));
            template = template.substr(startTag);
            
            endTag = template.indexOf(close);
            if(endTag === -1) {
                throw "Invalid wpfko_code tag.";
            }
            
            result.push((function(scriptId) {
                return function(bindingContext) {                    
                    return wpfko.template.engine.scriptCache[scriptId](bindingContext);                    
                };
            })(template.substr(open.length, endTag - open.length)));
                        
            template = template.substr(endTag + close.length);
        }
                
        result.push(template);
        
        var ii = result.length;
        return function(bindingContext) {
            var contexts = [];
            var returnVal = [];
            for(var i = 0; i < ii; i++) {
                if(result[i] instanceof Function) {                    
                    var rendered = result[i](bindingContext);
                    if(rendered instanceof wpfko.template.switchBindingContext) {
                        if(rendered.bindingContext) {
                            contexts.push(bindingContext);
                            bindingContext = rendered.bindingContext;
                        } else {
                            // empty rendered.bindingContext signifies we revert to the parent binding context
                            bindingContext = contexts.pop();
                        }
                    } else {                    
                        returnVal.push(rendered);
                    }
                } else {
                    returnVal.push(result[i]);
                }
            }
            
            return wpfko.util.html.createElements(returnVal.join(""));
        };
    };
        
    htmlBuilder.renderFromMemo = function(bindingContext) {
        return ko.memoization.memoize(function(memo) { 
            var comment1 = document.createComment(' ko ');
            var comment2 = document.createComment(' /ko ');
            var p = wpfko.util.ko.virtualElements.parentElement(memo);
            ko.virtualElements.insertAfter(p, comment1, memo);
            ko.virtualElements.insertAfter(p, comment2, comment1);
                
            var acc = function() {
                return bindingContext.$data;
            };
            
            // renderFromMemo can only derive the parent/child from the binding context
            wpfko.ko.bindings.render.init(comment1, acc, acc, wpfko.util.ko.peek(bindingContext.$parentContext.$data), bindingContext.$parentContext);
            wpfko.ko.bindings.render.update(comment1, acc, acc, wpfko.util.ko.peek(bindingContext.$parentContext.$data), bindingContext.$parentContext);            
        });
    };
    
    htmlBuilder.emptySwitchBindingContext = function(bindingContext) {
        return new wpfko.template.switchBindingContext();
    };
    
    htmlBuilder.switchBindingContextToTemplateItem = function(templateItemId) {
        return function(bindingContext) {
            return new wpfko.template.switchBindingContext(bindingContext.createChildContext(bindingContext.$data.templateItems[templateItemId]));
        }
    };
    
    htmlBuilder.generateTemplate = function(xmlTemplate, itemPrefix) {  
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        enumerate(xmlTemplate.childNodes, function(child, i) {            
            if(wpfko.template.xmlTemplate.isCustomElement(child)) {     
                var id = wpfko.template.xmlTemplate.getId(child) || (itemPrefix + i);
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.switchBindingContextToTemplateItem(id)));                
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.renderFromMemo));
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.emptySwitchBindingContext));
                
            } else if(child.nodeType == 1) {
                
                // create copy with no child nodes
                var ch = new DOMParser().parseFromString(ser.serializeToString(child), "application/xml").documentElement;
                while (ch.childNodes.length) {
                    ch.removeChild(ch.childNodes[0]);
                }
                
                var html = wpfko.util.html.createElement(ser.serializeToString(ch));
                html.innerHTML = wpfko.template.htmlBuilder.generateTemplate(child, itemPrefix + i);                
                result.push(wpfko.util.html.outerHTML(html));
            } else if(child.nodeType === 3) {
                result.push(child.data);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
        
        return result.join("");
    };
    
    wpfko.template.htmlBuilder = htmlBuilder;
})();


var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    wpfko.template.switchBindingContext = function(bindingContext) {
        this.bindingContext = bindingContext;
    }
})();


var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var viewModelBuilder = function(xmlTemplate) {
        this._builders = [];
        this.elementsWithId = [];
        this._addBuilders(xmlTemplate);
    };
    
    viewModelBuilder.prototype.addReferencedElements = function(subject, renderedHtml) {
        
        enumerate(this.elementsWithId, function(id) {
            // normalize, input vals will be in an array, not html tree
            var current = {
                childNodes: renderedHtml
            };
            
            // get target node using psuedo xPath
            enumerate(id.split("."), function(val, i) {
                current = current.childNodes[parseInt(val)];
            });
            
            if(!current.id) throw "Unexpected exception, could not find element id";
            subject.templateItems[current.id] = current;
        });
    };    
    
    viewModelBuilder.prototype._addBuilders = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        enumerate(xmlTemplate.childNodes, function(child, i) {
            if(wpfko.template.xmlTemplate.isCustomElement(child)) {
                var id = wpfko.template.xmlTemplate.getId(child) || (itemPrefix + i);
                this._builders.push(function(bindingContext) {
                    bindingContext.$data.templateItems[id] = wpfko.util.obj.createObject(child.nodeName);
                    bindingContext.$data.templateItems[id].initialize(child, bindingContext.createChildContext(bindingContext.$data.templateItems[id]));
                });
            } else if(child.nodeType == 1) {
                // if the element has an id, record it so that it can be appended during the building of the object
                if(wpfko.template.xmlTemplate.getId(child))
                    this.elementsWithId.push(itemPrefix + i);
                
                this._addBuilders(child, itemPrefix + i);
            } // non elements have no place here but we do want to enumerate over them to keep index in sync
        }, this);
    };    
    
    viewModelBuilder.prototype.rebuild = function(bindingContext) {
        for(var i in bindingContext.$data.templateItems) {
            if(bindingContext.$data.templateItems[i] instanceof wpfko.base.visual) {
                bindingContext.$data.templateItems[i].dispose();
            }
            
            delete bindingContext.$data.templateItems[i];
        }
        
        for(var i = 0, ii = this._builders.length; i < ii; i++) {
            this._builders[i](bindingContext);
        }
    };
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    wpfko.template.viewModelBuilder = viewModelBuilder;
})();


var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var xmlTemplate = function(xmlTemplate) {
                
        xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplate + "</root>", "application/xml").documentElement;
        
        if(xmlTemplate.firstChild && xmlTemplate.firstChild.nodeName === "parsererror") {
			var ser = new XMLSerializer();
			throw "Invalid xml template:\n" + ser.serializeToString(xmlTemplate.firstChild);
		}
        
        this.viewModelBuilder = new wpfko.template.viewModelBuilder(xmlTemplate);
        this.htmlBuilder = new wpfko.template.htmlBuilder(xmlTemplate);
    }
    
    xmlTemplate.isCustomElement = function(xmlElement) {
        return xmlElement.nodeType == 1 && wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName.toLowerCase()) === -1;
    };
    
    xmlTemplate.getId = function(xmlElement) {
        for(var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {
            if(xmlElement.attributes[i].nodeName === "id") {
                return xmlElement.attributes[i].value;
            }
        }
        
        return null;
    };
    
    xmlTemplate.prototype.render = function(bindingContext) {        
        var html = this.htmlBuilder.render(bindingContext);
        this.viewModelBuilder.addReferencedElements(bindingContext.$data, html);
            
        if (bindingContext.$data instanceof wpfko.base.view)
            bindingContext.$data.onInitialized();
        
        return html;
    };
    
    xmlTemplate.prototype.rebuild = function(bindingContext) {
        this.viewModelBuilder.rebuild(bindingContext);
    };
    
    wpfko.template.xmlTemplate = xmlTemplate;
})();


var wpfko = wpfko || {};
wpfko.util = wpfko.util || {};

(function () { 
        
    var outerHTML = function(element) {
        if(!element) return null;
        
        var tagName = element.nodeType === 1 ? (specialTags[element.tagName.toLowerCase()] || "div") : "div";
        var div = document.createElement(tagName);
        div.innerHTML = element.outerHTML;
        
        return div.innerHTML;        
    };  
        
    //TODO: div might not be appropriate, eg, if html string is <li />
    var createElement = function(htmlString) {
        if(!htmlString) return null;
        var parent = document.createElement(specialTags[getTagName(htmlString)] || "div");
        parent.innerHTML = htmlString;
        var element = parent.firstChild;
        parent.removeChild(element);
        return element;        
    }; 
    
    var validHtmlCharacter = /[a-zA-Z0-9]/;
    var getTagName = function(openingTag) {
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
        htmlContent = htmlContent.replace(stripHtmlComments, "").replace(/^\s+|\s+$/g, "");
        var i = 0;
        if((i = htmlContent.indexOf("<")) === -1)
            return null;
        
        return getTagName(htmlContent.substring(i));
    };
    
    //TODO: More tags
    var specialTags = {
        td: "tr",
        th: "tr",
        tr: "tbody",
        col: "colgroup",
        colgroup: "table",
        tbody: "table",
        thead: "table",
        li: "ul"
    };
       
    //TODO: div might not be appropriate, eg, if html string is <li />
    var createElements = function(htmlString) {
        if(htmlString == null) return null;
        
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
    
    var createWpfkoComment = function() {
        
        var open = document.createComment(" ko ");   
        var close = document.createComment(" /ko ");
        
        open.__wpfko = {
            open: open,
            close: close,
            "delete": function() {
                var elements = open.__wpfko.allElements();
                for(var i = 0, ii = elements.length; i < ii; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            },
            allElements: function() {
                var output = [];
                var current = open;
                while(true) {
                    output.push(current);
                    if(current === close)
                        break;
                    
                    current = current.nextSibling;
                }
                
                return output;
            },
            insertAfter: function(element) {
                return close.nextSibling ? close.parentNode.insertBefore(element, close.nextSibling) : close.parentNode.appendChild(element);
            }
        };
        
        return open.__wpfko;        
    };
 
    var getAllChildren = function (element) {
        var children = [];
        if (wpfko.util.ko.virtualElements.isVirtual(element)) {
            var parent = wpfko.util.ko.virtualElements.parentElement(element);
            
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
            if (wpfko.util.ko.virtualElements.isVirtualClosing(children[i])) {
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
            if (wpfko.util.ko.virtualElements.isVirtual(children[i]))
                depth++;
        }
 
        return output;
    };
    
    wpfko.util.html = {
        specialTags: specialTags,
        getFirstTagName: getFirstTagName,
        getTagName: getTagName,
        getAllChildren: getAllChildren,
        outerHTML: outerHTML,
        createElement: createElement,
        createElements: createElements,
        createWpfkoComment: createWpfkoComment
    };    
})();


    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _ko = {};
    
    _ko.version = function() {
        
        if(!ko || !ko.version)
            return null;
        
        var version = ko.version.split(".");
        for(var i = 0, ii = version.length; i < ii; i++)
            version[i] = parseInt(version[i]);
        
        return version;
    };   
    
    _ko.peek = function(input) {
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
        return ko.isObservable(test) && test.push && test.push.constructor === Function;
    };
    
    _ko.virtualElements = {
        parentElement: function(element) {
            var current = element.previousSibling;
            while(current) {
                if(_ko.virtualElements.isVirtual(current)) {
                    return current;
                }
                
                current = current.previousSibling;
            }
            
            return element.parentNode;
        },
        isVirtual: function(node) {
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0;
        },
        isVirtualClosing: function(node) {
            return node.nodeType === 8 && node.nodeValue.replace(/^\s+|\s+$/g, '') === "/ko";
        },
        elementWithChildren: function(element) {
            if(!element) return [];
            
            if(!_ko.virtualElements.isVirtual(element)) return [element];
            
            var output = [element];
            var depth = 1;
            var current = element.nextSibling;
            while (depth > 0) {
                output.push(current);
                if(_ko.virtualElements.isVirtualClosing(current))
                    depth--;                
                else if(_ko.virtualElements.isVirtual(current))
                    depth++;
                
                current = current.nextSibling;
            }            
            
            return output;
        }
    };
    
    wpfko.util.ko = _ko;
})();


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

window["wpfko"] = wpfko;
window["wo"] = wpfko.base;
})();
