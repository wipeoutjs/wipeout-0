
Class("wpfko.base.visual", function () {
    
    var visual = wpfko.base.object.extend(function (templateId) {
        ///<summary>Base class for anything with a visual element. Interacts with the wipeout template engine to render content</summary>
        this._super();
        
        //Flag to let the wipeout template engine know how to dispose of this visual
        this.__createdByWipeout = false;
        
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
    }, "visual");
        
    visual.prototype.unRender = function() {
        ///<summary>Prepares a visual to be re-rendered</summary>
        
        this.onUnrender();
        
        // dispose of all template items
        enumerate(this.templateItems, function(item, i) {
            if(item instanceof visual) 
                item.dispose();
            
            delete this.templateItems[i];
            
            var index = this.renderedChildren.indexOf(item);
            if(index !== -1)
                this.renderedChildren.splice(index, 1);            
        }, this);
        
        // dispose of all rendered children
        enumerate(this.renderedChildren.splice(0, this.renderedChildren.length), function(child) {
            if(child instanceof visual) 
                child.dispose();
        });
        
        if(this._rootHtmlElement) {
            // disassociate the visual from its root element and empty the root element
            ko.utils.domData.set(this._rootHtmlElement, wpfko.bindings.wpfko.utils.wpfkoKey, undefined); 
            ko.virtualElements.emptyNode(this._rootHtmlElement);
            delete this._rootHtmlElement;
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
        enumerate(this._routedEventSubscriptions.splice(0, this._routedEventSubscriptions.length), function(event) {
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
        var current = visual.getParentElement(this._rootHtmlElement);
        while(current) {
            if(nextTarget = ko.utils.domData.get(current, wpfko.bindings.wpfko.utils.wpfkoKey)) {
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
 
        var vm = ko.utils.domData.get(rootElement, wpfko.bindings.wpfko.utils.wpfkoKey);        
        if (vm) {
            return [{ viewModel: vm, display: displayFunction(vm), children: output}];
        }
 
        return output;
    };
    
    // list of html tags which will not be treated as objects
    visual.reservedTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    
    return visual;
});