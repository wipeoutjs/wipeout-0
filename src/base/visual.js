
Class("wpfko.base.visual", function () {
    
    var visual = wpfko.base.object.extend(function (templateId) {
        ///<summary>Base class for anything with a visual element. Interacts with the wipeout template engine to render content</summary>
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
            ko.virtualElements.emptyNode(this.__woBag.rootHtmlElement);
        }
    };
        
    visual.prototype.unRender = function() {
        ///<summary>Prepares a visual to be re-rendered</summary>
        
        this.onUnrender();
        
        this.unTemplate();
                
        if(this.__woBag.rootHtmlElement) {
            // disassociate the visual from its root element and empty the root element
            ko.utils.domData.set(this.__woBag.rootHtmlElement, wpfko.bindings.wipeout.utils.wpfkoKey, undefined); 
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
    visual.getParentElement = function(element) {
        ///<summary>Gets the parent or virtual parent of the element</summary>
        
        var depth = 0;
        var current = element.previousSibling;
        while(current) {
            if(wpfko.utils.ko.virtualElements.isVirtualClosing(current)) {
                depth--;
            }
            
            if(wpfko.utils.ko.virtualElements.isVirtual(current)) {
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
        var current = visual.getParentElement(this.__woBag.rootHtmlElement);
        while(current) {
            if(nextTarget = ko.utils.domData.get(current, wpfko.bindings.wipeout.utils.wpfkoKey)) {
                return nextTarget;
            }
            
            current = visual.getParentElement(current);
        }        
    };
    
    visual.prototype.unRegisterRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {  
        ///<summary>Unregister from a routed event. The callback and callback context must tbe the same as those passed in during registration</summary>      
        for(var i = 0, ii = this.__woBag.routedEventSubscriptions.length; i < ii; i++) {
            if(this.__woBag.routedEventSubscriptions[i].routedEvent === routedEvent) {
                this.__woBag.routedEventSubscriptions[i].event.unRegister(callback, context);
                return;
            }
        }  
    };
    
    visual.prototype.registerRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {
        ///<summary>Register for a routed event</summary>    
        
        var rev;
        for(var i = 0, ii = this.__woBag.routedEventSubscriptions.length; i < ii; i++) {
            if(this.__woBag.routedEventSubscriptions[i].routedEvent === routedEvent) {
                rev = this.__woBag.routedEventSubscriptions[i];
                break;
            }
        }
        
        if(!rev) {
            rev = new wpfko.base.routedEventRegistration(routedEvent);
            this.__woBag.routedEventSubscriptions.push(rev);
        }
        
        rev.event.register(callback, callbackContext);
    };
    
    visual.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event. The event will bubble upwards to all ancestors of this visual. Overrides wo.object.triggerRoutedEvent</summary>    
        if(!(eventArgs instanceof wpfko.base.routedEventArgs)) {
            eventArgs = new wpfko.base.routedEventArgs(eventArgs, this);
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
    visual.prototype.rootHtmlChanged = function (oldValue, newValue) {
        ///<summary>Triggered each time after a template is rendered</summary>    
    };
        
    // virtual
    visual.prototype.onUnrender = function () {
        ///<summary>Triggered just before a visual is un rendered</summary>    
    };
        
    // virtual
    visual.prototype.applicationInitialized = function () {
        ///<summary>Triggered after the entire application has been initialized. Will only be triggered on the viewModel created directly by the wpfko binding</summary>    
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
        wpfko.utils.obj.enumerate(wpfko.utils.html.getAllChildren(rootElement), function (child) {
            wpfko.utils.obj.enumerate(visual.visualGraph(child), output.push, output);
        });
 
        var vm = ko.utils.domData.get(rootElement, wpfko.bindings.wipeout.utils.wpfkoKey);        
        if (vm) {
            return [{ viewModel: vm, display: displayFunction(vm), children: output}];
        }
 
        return output;
    };
    
    // list of html tags which will not be treated as objects
    visual.reservedTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    
    return visual;
});