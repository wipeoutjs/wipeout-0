
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplateId) {
        
        if(!xmlTemplateId) throw "Invalid template";        
        var xmlTemplateElement = document.getElementById(xmlTemplateId);
        if(!xmlTemplateElement) throw "Could not find template \"" + xmlTemplateId + "\"";
        
        var xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplateElement.innerHTML + "</root>", "application/xml").documentElement;
        
        this.xmlTemplateId = xmlTemplateId;
        this.htmlTemplateId = "__html_" + xmlTemplateId;
        this.builder = wpfko.util.xmlTemplate.generateBuilder(xmlTemplate);
        
        var htmlTemplate = wpfko.util.xmlTemplate.generateTemplate(xmlTemplate);
        this.saveTemplate(htmlTemplate);
    }
    
    var enumerate = function(element, callback) {
        
        for(var i = 0, ii = element.childNodes.length; i < ii; i++) {
            callback(element.childNodes[i], i);
        }        
    };
    
    var enumerateEl = function(element, callback) {
        
        for(var i = 0, ii = element.children.length; i < ii; i++) {
            callback(element.children[i], i);
        }        
    };
    
    var enumerateAttr = function(element, callback) {
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            callback(element.attributes[i], i);
        }        
    };
    
    _xmlTemplate.isCustomElement = function(xmlElement) {
        return xmlElement.nodeType == 1 && wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName.toLowerCase()) === -1;
    };
    
    _xmlTemplate.generateBuilder = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var builders = [];
        enumerate(xmlTemplate, function(child, i) {
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
            
            enumerateAttr(element, addBindingAttributes);
        };
        
        enumerate(xmlTemplate, function(child, i) {            
            if(_xmlTemplate.isCustomElement(child)) {
                result.push("<!-- ko with: _templateItems[\"" + itemPrefix + i + "\"] -->\n");
                addBindings(child);
                 
                var recursive = function(element) {
                    enumerateEl(element, function(element) {  
                        var constructorOk = false;
                        enumerateAttr(element, function(attr) {
                            constructorOk |= attr.nodeName === "constructor" && _xmlTemplate.constructorExists(attr.value);
                        });
                        
                        if(constructorOk) {
                            result.push("<!-- ko with: " + element.nodeName + " -->\n");
                            addBindings(element);                        
                            enumerateEl(element, recursive);
                            result.push("<!-- /ko -->\n");
                        }
                    });                                
                };
                
                recursive(child);
                
                result.push("<!-- ko template: { name: _htmlTemplateId } -->");
                result.push("<!-- /ko -->\n");
                result.push("<!-- /ko -->\n");
                
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