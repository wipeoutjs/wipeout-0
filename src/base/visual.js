
    var wpfko = wpfko || {};
    wpfko.base = wpfko.base || {};

(function () {
    
    var visual = wpfko.base.object.extend(function (templateId) {
        this._super();
        
        this._templateItems = {};
        
        this.xmlTemplateId = ko.observable(templateId || visual.getDefaultTemplateId());
        this._htmlTemplateId = ko.observable();
                
        this.xmlTemplateId.subscribe(this.reGenerate, this);
        this.reGenerate();
    });
    
    visual.prototype.reGenerate = function() {
        
        var templateId = this.xmlTemplateId();
        if(!wpfko.util.xmlTemplate.cache[templateId]) {
            wpfko.util.xmlTemplate.cache[templateId] = new wpfko.util.xmlTemplate(templateId);
        }
        
        for(var i in this._templateItems) {
            delete this._templateItems[i];
        }
        
        wpfko.util.xmlTemplate.cache[templateId].builder(this);        
        this._htmlTemplateId(wpfko.util.xmlTemplate.cache[templateId].htmlTemplateId);
    };
    
    
    visual.prototype._afterRendered = function(nodes, context) {
        var old = this.nodes || [];
        this.nodes = nodes;
        context.rootHtmlChanged(old, nodes);
    };
        
    // virtual
    visual.prototype.rootHtmlChanged = function (oldValue, newValue) {
    };

    // add jquery selection if available
    if(window.jQuery) {
        
        var $ = window.jQuery;
        visual.$ = function(elements, jquerySelector) {
            if (!elements || elements.length) {
                return $();
            }
    
            // select from the root of the template and filter out results which
            // are not part of this element
            return $(jquerySelector, elements[0].parentElement).filter(function () {
                var ancestorTree = $(this).add($(this).parents());
                for (var i = 0, ii = ancestorTree.length; i < ii; i++) {
                    if (elements.indexOf(ancestorTree[i]) !== -1)
                        return true;
                }
    
                return false;
            });
        };
        
        visual.prototype.$ = function (jquerySelector) {
            return visual.$(this.nodes, jquerySelector);
        };
    }
    
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