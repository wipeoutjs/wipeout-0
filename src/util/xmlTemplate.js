
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplate) {
                
        xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplate + "</root>", "application/xml").documentElement;
        
        this.builder = wpfko.util.xmlTemplate.generateBuilder(xmlTemplate);
        this.render = wpfko.util.xmlTemplate.generateRender(xmlTemplate);
    }
    
    var enumerate = function(items, callback) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback(items[i], i);
        }        
    };
    
    _xmlTemplate.isCustomElement = function(xmlElement) {
        return xmlElement.nodeType == 1 && wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName.toLowerCase()) === -1;
    };
    
    _xmlTemplate.generateBuilder = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var builders = [];
        enumerate(xmlTemplate.childNodes, function(child, i) {
            if(_xmlTemplate.isCustomElement(child)) {
                builders.push(function(obj) {
                    obj._templateItems[itemPrefix + i] = wpfko.util.obj.createObject(child.nodeName);
                    obj._templateItems[itemPrefix + i].initialize(child);
                });
            } else if(child.nodeType == 1) {
                builders.push(_xmlTemplate.generateBuilder(child, itemPrefix + i));
            } // non elements have no place here but we do want to enumerate over them to keep index in sync
        });
        
        return function(object) {
            object._templateItems = object._templateItems || {};
            
            for(var i = 0, ii = builders.length; i < ii; i++) {
                builders[i](object);
            }
        }
    };
    
    _xmlTemplate.elementHasModelBinding = function(element) {
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            if(element.attributes[i].nodeName === "model")
                return true;
        }
        
        for(var i = 0, ii = element.children.length; i < ii; i++) {
            if(element.children[i].nodeName === "model")
                return true;
        }
        
        return false;
    };
    
    _xmlTemplate.constructorExists = function(constructor) {
        
        constructor = constructor.split(".");
        var current = window;
        for(var i = 0, ii = constructor.length; i < ii; i++) {
            current = current[constructor[i]];
            if(!current) return false;
        }
        
        return current instanceof Function;
    };
    var open = "<!-- wpfko_code: {", close = "} -->";
    
    _xmlTemplate.generateRender = function(xmlTemplate) {
        var template = wpfko.util.xmlTemplate.generateTemplate(xmlTemplate);
                 
        var startTag, endTag;
        var result = [];
        while((startTag = template.indexOf(open)) !== -1) {
            result.push(template.substr(0, startTag));
            template = template.substr(startTag);
            
            endTag = template.indexOf(close);
            if(endTag === -1) {
                throw "##";
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
            debugger;
            var returnVal = [];
            for(var i = 0; i < ii; i++) {
                if(result[i] instanceof Function) {
                    
                    var rendered = result[i](bindingContext);
                    if(rendered instanceof wpfko.util.switchBindingContext) {
                        bindingContext = rendered.bindingContext;
                    } else {                    
                        returnVal.push(rendered);
                    }
                }
                else
                    returnVal.push(result[i]);
            }
            
            return returnVal.join("");
        };
    };
    
    wpfko.util.switchBindingContext = function(bindingContext) {
        this.bindingContext = bindingContext;
    }
    
    _xmlTemplate.generateTemplate = function(xmlTemplate, itemPrefix) {   
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        var addBindingAttributes = function(attr) {
            // reserved
            if(attr.nodeName === "constructor") return;
            result.push("<!-- ko bind: { property: '" + attr.nodeName + "', value: " + attr.value + " } -->");
            result.push("<!-- /ko -->\n");
        };
        
        var addBindings = function(element) {
            if(!_xmlTemplate.elementHasModelBinding(element))
                addBindingAttributes({ nodeName: "model", value: "$parent.model" });
            
            enumerate(element.attributes, addBindingAttributes);
        };
        
        enumerate(xmlTemplate.childNodes, function(child, i) {            
            if(_xmlTemplate.isCustomElement(child)) {                
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext(arguments[0].createChildContext(_templateItems[\"" + itemPrefix + i + "\"]))"));
                addBindings(child);
                 
                var recursive = function(element) {
                    enumerate(element.children, function(element) {  
                        var constructorOk = false;
                        enumerate(element.attributes, function(attr) {
                            constructorOk |= attr.nodeName === "constructor" && _xmlTemplate.constructorExists(attr.value);
                        });
                        
                        if(constructorOk) {
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext(arguments[0].createChildContext(" + element.nodeName + "))"));
                            addBindings(element);                        
                            enumerate(element.children, recursive);
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext($parentContext)"));
                        }
                    });                                
                };
                
                recursive(child);
                
                result.push("<!-- ko template: { name: xmlTemplateId, afterRender: _afterRendered } -->");
                result.push("<!-- /ko -->\n");
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext($parentContext)"));
                
                /*
                result.push("<!-- ko with: _templateItems[\"" + itemPrefix + i + "\"] -->\n");
                addBindings(child);
                 
                var recursive = function(element) {
                    enumerate(element.children, function(element) {  
                        var constructorOk = false;
                        enumerate(element.attributes, function(attr) {
                            constructorOk |= attr.nodeName === "constructor" && _xmlTemplate.constructorExists(attr.value);
                        });
                        
                        if(constructorOk) {
                            result.push("<!-- ko with: " + element.nodeName + " -->\n");
                            addBindings(element);                        
                            enumerate(element.children, recursive);
                            result.push("<!-- /ko -->\n");
                        }
                    });                                
                };
                
                recursive(child);
                
                result.push("<!-- ko template: { name: xmlTemplateId, afterRender: _afterRendered } -->");
                result.push("<!-- /ko -->\n");
                result.push("<!-- /ko -->\n");*/
                
            } else if(child.nodeType == 1) {
                
                // create copy
                var ch = new DOMParser().parseFromString(ser.serializeToString(child), "application/xml").documentElement;
                while (ch.childNodes.length) {
                    ch.removeChild(ch.childNodes[0]);
                }
                
                var html = wpfko.util.html.createElement(ser.serializeToString(ch));
                html.innerHTML = wpfko.util.xmlTemplate.generateTemplate(child, itemPrefix + i);                
                result.push(html.outerHTML);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
        
        return result.join("");
    }
    
    _xmlTemplate.prototype.saveTemplate = function(templateString) {
                
        var script = document.getElementById(this.htmlTemplateId);
        if(!script) {
            script = document.createElement("script");
            script.setAttribute("id", this.htmlTemplateId);
            script.setAttribute("type", "text/html");
            document.body.appendChild(script);
        }
        
        script.innerHTML = templateString;     
    }
    
    _xmlTemplate.cache = {};
    
    wpfko.util.xmlTemplate = _xmlTemplate;
})();