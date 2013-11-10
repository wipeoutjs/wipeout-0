
    var wpfko = wpfko || {};
    wpfko.base = wpfko.base || {};

(function () {
    
    var visual = wpfko.base.object.extend(function (templateId) {
        this._super();        
        this.templateItems = {};        
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());
    });
    
    // knockout specific function. The "this" will be window and the context object will be the instance
    visual._afterRendered = function(nodes, context) {
        var old = context.nodes || [];
        context.nodes = nodes;
        context.rootHtmlChanged(old, nodes);
    };
    
    visual.prototype.dispose = function() {
        for(var i in this.templateItems)
            if(this.templateItems[i] instanceof visual) 
                this.templateItems[i].dispose();
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