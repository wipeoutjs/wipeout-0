

(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.base = wpfko.base || {};

    var visual = wpfko.base.object.extend(function (templateId) {
        this._super();
        
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());
        this.setTemplate = ko.observable();
        // not observable array, as we do not that functionality here
        this.nodes = ko.observable([]);
        this.bindingContext = ko.observable();
        this.childBindingContext = ko.observable();
        
        this.bindingContext.subscribe(function(newVal) { this.childBindingContext(newVal ? newVal.createChildContext(this) : null); }, this);
        
        // flag to stop progress of recursive code
        var setTemplate = {};

        // bind template and template id together
        this.setTemplate.subscribe(function (newValue) {
            if (newValue === setTemplate) return;

            this.templateId(visual.createAnonymousTemplate(newValue));

            // clear value. there is no reason to have large strings like this in memory
            this.setTemplate(setTemplate);
        }, this);  
        
        this.nodes.deepSubscribe(this.rootHtmlChanged, this);
    });
    
    visual.prototype.reGenerate = function() {
        
        // clean up old nodes which are to be deleted
        var oldNodes = this.nodes();
        if(oldNodes) {
            for(var i = 0, ii = oldNodes.length; i < ii; i++) {
                if(oldNodes.parentElement) {
                    oldNodes.parentElement.removeChild(oldNodes);
                }
            }            
        }
        
        var templateId = this.templateId();
        if(!templateId) {
            this.nodes([]);
            return;
        }            
        
        var template = document.getElementById(this.templateId());   
        if(!template || !template.innerHTML) {
            this.nodes([]);
            return;
        }
        
        var xmlTemplate = new DOMParser().parseFromString("<root>" + template.innerHTML + "</root>", "application/xml").documentElement;
        
        var nodes = [];
        var ser = new XMLSerializer();
        for (var i = 0, ii = xmlTemplate.childNodes.length; i < ii; i++) {

            if (xmlTemplate.childNodes[i].nodeType == 1 && visual.reservedTags.indexOf(xmlTemplate.childNodes[i].nodeName.toLowerCase()) === -1) {
                
                var view = wpfko.util.obj.createObject(xmlTemplate.childNodes[i].nodeName);
                
                view.initialize(this.childBindingContext, xmlTemplate.childNodes[i]);
                view.reGenerate();
                var n = view.nodes();
                for(var j = 0, jj = n.length; j < jj; j++) {
                    nodes.push(n[j]);
                }
            } else {
                var html = ser.serializeToString(xmlTemplate.childNodes[i]);
                nodes.push(wpfko.util.html.createElement(html));
            }
        }
        
        this.nodes(nodes);
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
            return visual.$(this.nodes(nodes), jquerySelector);
        };
    }
    
    visual.getDefaultTemplateId = (function () {
        var templateId = null;
        return function () {
            if (!templateId) {
                templateId = visual.createAnonymousTemplate("<span>No template has been specified</span>");
            }

            return templateId;
        };
    })();    
    
    visual.createAnonymousTemplate = (function () {
        var templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);

        return function (templateString) {

            // lazy create div to place anonymous templates
            if (!templateArea) {
                templateArea = wpfko.util.html.createElement("<div style='display: none'></div>");
                document.getElementsByTagName("body")[0].appendChild(templateArea);
            }

            templateString = templateString.replace(/^\s+|\s+$/g, '');
            var hash = visual.hashCode(templateString).toString();

            // if we can, reuse an existing anonymous template
            for (var j = 0, jj = templateArea.children.length; j < jj; j++) {
                if (templateArea.children[j].nodeName === "SCRIPT" &&
                templateArea.children[j].id &&
                // first use a hash to avoid computationally expensive string compare if possible
                templateArea.children[j].attributes["data-templatehash"] &&
                templateArea.children[j].attributes["data-templatehash"].nodeValue === hash &&
                templateArea.children[j].innerHTML === templateString) {
                    return children[j].id;
                }
            }

            var id = "AnonymousTemplate" + (++i);
            templateArea.innerHTML += '<script type="text/html" id="' + id + '" data-templatehash="' + hash + '">' + templateString + '</script>';
            return id;
        };
    })();

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    visual.hashCode = function (str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0, ii = str.length; i < ii; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
    
    // list of html tags which will not be treated as objects
    visual.reservedTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    
    wpfko.base.visual = visual;
})();