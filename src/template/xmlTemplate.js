
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplate) {
        
        this._builders = [];
                
        xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplate + "</root>", "application/xml").documentElement;
        
        this._addBuilders(xmlTemplate);
        this.render = wpfko.template.xmlTemplate.generateRender(xmlTemplate);
    }
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    _xmlTemplate.isCustomElement = function(xmlElement) {
        return xmlElement.nodeType == 1 && wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName.toLowerCase()) === -1;
    };
    
    _xmlTemplate.prototype.rebuild = function(subject) {
        subject._templateItems = subject._templateItems || {};    
        for(var i in subject._templateItems) {
            if(subject._templateItems[i].dispose) {
                subject._templateItems[i].dispose();
            }
            
            delete subject._templateItems[i];
        }
        
        for(var i = 0, ii = this._builders.length; i < ii; i++) {
            this._builders[i](subject);
        }
    };
    
    _xmlTemplate.prototype._addBuilders = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        enumerate(xmlTemplate.childNodes, function(child, i) {
            if(_xmlTemplate.isCustomElement(child)) {
                this._builders.push(function(obj) {
                    obj._templateItems[itemPrefix + i] = wpfko.util.obj.createObject(child.nodeName);
                    
                    //TODO: take from view and put in this class
                    obj._templateItems[itemPrefix + i].initialize(child);
                });
            } else if(child.nodeType == 1) {
                this._addBuilders(child, itemPrefix + i);
            } // non elements have no place here but we do want to enumerate over them to keep index in sync
        }, this);
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
    
    _xmlTemplate.generateRender = function(xmlTemplate) {
        var open = wpfko.template.engine.openCodeTag;
        var close = wpfko.template.engine.closeCodeTag;
        
        var template = wpfko.template.xmlTemplate.generateTemplate(xmlTemplate);
                 
        var startTag, endTag;
        var result = [];
        while((startTag = template.indexOf(open)) !== -1) {
            result.push(template.substr(0, startTag));
            template = template.substr(startTag);
            
            endTag = template.indexOf(close);
            if(endTag === -1) {
                throw "##"; //TODO
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
                    if(rendered instanceof wpfko.util.switchBindingContext) {
                        if(rendered.bindingContext) {
                            contexts.push(bindingContext);
                            bindingContext = rendered.bindingContext;
                        } else {
                            bindingContext = contexts.pop();
                        }
                    } else {                    
                        returnVal.push(rendered);
                    }
                } else {
                    returnVal.push(result[i]);
                }
            }
            
            return returnVal.join("");
        };
    };
    
    _xmlTemplate.generateTemplate = function(xmlTemplate, itemPrefix) {  
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        var addBindingAttributes = function(attr) {
            // reserved
            if(attr.nodeName === "constructor") return;
            //TODO: dispose of bindings            
            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("$data.bind('" + attr.nodeName + "', " + attr.value + ")"));
        };
        
        var addBindings = function(element) {
            if(!_xmlTemplate.elementHasModelBinding(element))
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("ko.utils.unwrapObservable($data.model) == null ? $data.bind('model', $parent.model) : null"));
            
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
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext()"));
                        }
                    });                                
                };
                
                recursive(child);
                
                result.push("<!-- ko renderChild: _templateItems[\"" + itemPrefix + i + "\"] --><!-- /ko -->\n");
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext()"));
                
            } else if(child.nodeType == 1) {
                
                // create copy with no child nodes
                var ch = new DOMParser().parseFromString(ser.serializeToString(child), "application/xml").documentElement;
                while (ch.childNodes.length) {
                    ch.removeChild(ch.childNodes[0]);
                }
                
                var html = wpfko.util.html.createElement(ser.serializeToString(ch));
                html.innerHTML = wpfko.template.xmlTemplate.generateTemplate(child, itemPrefix + i);                
                result.push(html.outerHTML);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
        
        return result.join("");
    };
    
    wpfko.template.xmlTemplate = _xmlTemplate;
})();