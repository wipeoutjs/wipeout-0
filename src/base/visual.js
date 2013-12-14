
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var visual = wpfko.base.object.extend(function (templateId) {
        this._super();
        
        this.templateItems = {};   
        this.renderedChildren = [];
        
        this._rootHtmlElement = null;
        
        this._routedEventSubscriptions = [];
        
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());
    });
    
    visual._afterRendered = function(nodes, context) {
        var old = context.nodes || [];
        context.nodes = nodes;
        context.rootHtmlChanged(old, nodes);
    };
    
    visual.prototype.dispose = function() {
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
        
        this._rootHtmlElement = null;
                
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++)
            this._routedEventSubscriptions[i].event.dispose();        
        this._routedEventSubscriptions.length = 0;
    };
    
    visual.prototype.unRegisterRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {        
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++) {
            if(this._routedEventSubscriptions[i].routedEvent === routedEvent) {
                this._routedEventSubscriptions[i].event.unRegister(callback, context);
                return;
            }
        }  
    };
    
    visual.prototype.registerRoutedEvent = function(routedEvent, callback, callbackContext /* optional */) {
        
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
        for(var i = 0, ii = this._routedEventSubscriptions.length; i < ii; i++) {
            if(eventArgs.handled) return;
            if(this._routedEventSubscriptions[i].routedEvent === routedEvent) {
                this._routedEventSubscriptions[i].event.trigger(eventArgs);
            }
        }
        
        if(!eventArgs.handled) {
            var nextTarget;
            var current = this._rootHtmlElement.parentNode;
            while(current) {
                if(nextTarget = ko.utils.domData.get(current, wpfko.ko.bindings.wpfko.utils.wpfkoKey)) {
                    nextTarget.triggerRoutedEvent(routedEvent, eventArgs);
                }
                
                current = current.parentNode;
            }
        }
    };
        
    // virtual
    visual.prototype.rootHtmlChanged = function (oldValue, newValue) {
    };
    
    visual.getDefaultTemplateId = (function () {
        var templateId = null;
        return function () {
            if (!templateId) {
                templateId = wpfko.base.contentControl.createAnonymousTemplate("<span>No template has been specified</span>");
            }

            return templateId;
        };
    })();
    
    visual.getBlankTemplateId = (function () {
        var templateId = null;
        return function () {
            if (!templateId) {
                templateId = wpfko.base.contentControl.createAnonymousTemplate("");
            }

            return templateId;
        };
    })(); 
    
    // list of html tags which will not be treated as objects
    visual.reservedTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    
    wpfko.base.visual = visual;
})();