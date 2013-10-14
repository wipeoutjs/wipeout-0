

(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.base = wpfko.base || {};

    var visual = wpfko.base.object.extend(function (templateId) {
        this._super();
        
        this._templateItems = {};
        
        this.templateId = ko.observable(templateId || visual.getDefaultTemplateId());
        this.setTemplate = ko.observable();
        this._htmlTemplateId = ko.observable();
                
        this.templateId.subscribe(this.reGenerate, this);
        this.reGenerate();
        
        // flag to stop progress of recursive code
        var setTemplate = {};
    
        // bind template and template id together
        this.setTemplate.subscribe(function (newValue) {
            if (newValue === setTemplate) return;
    
            this.templateId(visual.createAnonymousTemplate(newValue));
    
            // clear value. there is no reason to have large strings like this in memory
            this.setTemplate(setTemplate);
        }, this);
    });
    
    visual.prototype.createSubscribableChildBindingContext = function(child) {
        return ko.computed(function() { 
            var ctxt = this.bindingContext();
            return ctxt ? ctxt.createChildContext(child) : null;
        }, this);
    };
    
    visual.prototype.reGenerate = function() {
        
        // delete any items created for the old template
        for(var i in this._templateItems)
            delete this._templateItems[i];
        
        var templateId = this.templateId();
        if(!templateId) {
            this._htmlTemplateId(visual.getBlankTemplateId());
            return;
        }            
        
        var template = document.getElementById(this.templateId());   
        if(!template || !template.innerHTML) {
            this._htmlTemplateId(visual.getBlankTemplateId());
            return;
        }
        
        var nodes = [];
        var ser = new XMLSerializer();
        
        // parse template into XML
        var xmlTemplate = new DOMParser().parseFromString("<root>" + template.innerHTML + "</root>", "application/xml").documentElement;
        
        var generateHtml = function(xmlNode, nodeId) {
            var nodes = [];
            // if element and not html element
            if (xmlNode.nodeType == 1 && visual.reservedTags.indexOf(xmlNode.nodeName.toLowerCase()) === -1) {
                // create object
                this._templateItems[nodeId] = wpfko.util.obj.createObject(xmlNode.nodeName);
                
                // initalize properties and get bound values
                var bindingNodes = this._templateItems[nodeId].initialize(xmlNode);
                
                // switch context
                nodes.push(wpfko.util.html.createElement("<!-- ko with: _templateItems['" + nodeId + "'] -->"));
                
                // add bindings to dom so that knockout can pick them up
                for(var j = 0, jj = bindingNodes.length; j < jj; j++) {
                    nodes.push(bindingNodes[j]);                    
                }
                
                // set template
                nodes.push(wpfko.util.html.createElement("<!-- ko template: { name: _htmlTemplateId, afterRender: _afterRendered } -->"));
                nodes.push(wpfko.util.html.createElement("<!-- /ko -->"));
                nodes.push(wpfko.util.html.createElement("<!-- /ko -->"));
            } else if(xmlNode.nodeType == 1) {
                var children = []
                while (xmlNode.childNodes.length) {
                    children.push(xmlNode.childNodes[0]);
                    xmlNode.removeChild(xmlNode.childNodes[0]);
                }
                
                var html = wpfko.util.html.createElement(ser.serializeToString(xmlNode));
                for(var i = 0, ii = children.length; i < ii; i++) {                    
                    var n = generateHtml.call(this, children[i], nodeId + "_" + i);
                    for(var j = 0, jj = n.length; j < jj; j++) {
                        html.appendChild(n[j]);
                    }
                }
                
                nodes.push(html);                
            } else {
                // create html and add to script
                var html = ser.serializeToString(xmlNode);
                nodes.push(wpfko.util.html.createElement(html));
            }
            
            return nodes;
        };
        
        for (var i = 0, ii = xmlTemplate.childNodes.length; i < ii; i++) {
            var n = generateHtml.call(this, xmlTemplate.childNodes[i], i);
            for(var j = 0, jj = n.length; j < jj; j++) {
                nodes.push(n[j]);
            }
        }
        
        // create new html template from compiled nodes
        var htmlTemplateId = "__html_" + templateId;        
        if(!document.getElementById(htmlTemplateId)) {
            var div = document.createElement("div");
            var script = document.createElement("script");
            script.setAttribute("id", htmlTemplateId);
            script.setAttribute("type", "text/html");
            for (var i = 0, ii = nodes.length; i < ii; i++) {
                div.appendChild(nodes[i]);
            }
            
            script.innerHTML = div.innerHTML;
            
            //TODO: cleanup/standardise
            document.body.appendChild(script);
        }
        
        this._htmlTemplateId(htmlTemplateId);
    };
    
    
    visual.prototype._afterRendered = function(nodes, context) {
        var old = this.nodes || [];
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
                templateId = visual.createAnonymousTemplate("<span>No template has been specified</span>");
            }

            return templateId;
        };
    })();
    
    visual.getBlankTemplateId = (function () {
        var templateId = null;
        return function () {
            if (!templateId) {
                templateId = visual.createAnonymousTemplate("");
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
                document.body.appendChild(templateArea);
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
            templateArea.innerHTML += '<script type="text/xml" id="' + id + '" data-templatehash="' + hash + '">' + templateString + '</script>';
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