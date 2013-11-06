
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplate) {
        
        this._builders = [];
        this._htmlIds = [];
                
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
        for(var i in subject.templateItems) {
            if(subject.templateItems[i].dispose) {
                subject.templateItems[i].dispose();
            }
            
            delete subject.templateItems[i];
        }
        
        for(var i = 0, ii = this._builders.length; i < ii; i++) {
            this._builders[i](subject);
        }
    };
    
    _xmlTemplate.prototype.addReferencedElements = function(subject, renderedHtml) {
        
        enumerate(this._htmlIds, function(id) {
            // normalize, input vals will be in an array, not html tree
            var current = {
                childNodes: renderedHtml
            };
            
            enumerate(id.split("."), function(val, i) {
                current = current.childNodes[parseInt(val)];
            });
            
            if(!current.id) throw "Unexpected exception, could not find element id";
            subject.templateItems[current.id] = current;
        });
    }
    
    _xmlTemplate.prototype._addBuilders = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        enumerate(xmlTemplate.childNodes, function(child, i) {
            if(_xmlTemplate.isCustomElement(child)) {
                var id = _xmlTemplate.getId(child) || (itemPrefix + i);
                this._builders.push(function(obj) {
                    obj.templateItems[id] = wpfko.util.obj.createObject(child.nodeName);
                    obj.templateItems[id].initialize(child, obj);
                });
            } else if(child.nodeType == 1) {
                // if the element has an id, record it so that it can be appended during the building of the object
                if(_xmlTemplate.getId(child))
                    this._htmlIds.push(itemPrefix + i);
                
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
    
    _xmlTemplate.getId = function(xmlElement) {
        for(var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {
            if(xmlElement.attributes[i].nodeName === "id") {
                return xmlElement.attributes[i].value;
            }
        }
        
        return null;
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
        
    var parentElement = function(element) {
        var current = element.previousSibling;
        while(current) {
            if(current.nodeType === 8 && current.nodeValue.replace(/^\s+/,'').indexOf('ko') === 0) {
                return current;
            }
            
            current = current.previousSibling;
        }
        
        return element.parentElement;
    };
    
    var reserved = ["constructor", "id"];
    
    _xmlTemplate.renderChildFromMemo = function(memo, bindingContext) {
        
        var comment1 = document.createComment(' ko ');
        var comment2 = document.createComment(' /ko ');
        var p = parentElement(memo);
        ko.virtualElements.insertAfter(p, comment1, memo);
        ko.virtualElements.insertAfter(p, comment2, comment1);
            
        var acc = function() {
            return bindingContext.$data;
        };
        
        wpfko.ko.bindings.renderChild.init(comment1, acc, acc, ko.utils.unwrapObservable(bindingContext.$data), bindingContext);
        wpfko.ko.bindings.renderChild.update(comment1, acc, acc, ko.utils.unwrapObservable(bindingContext.$data), bindingContext);
        
        comment1.parentElement.removeChild(comment1);
        comment2.parentElement.removeChild(comment2);
    };
    
    _xmlTemplate.generateTemplate = function(xmlTemplate, itemPrefix) {  
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        var addBindingAttributes = function(attr) {
            // reserved
            if(reserved.indexOf(attr.nodeName) !== -1) return;
            //TODO: dispose of bindings
            //TODO: dispose of this and all created dependantObservables
            //TODO: remove memoization???
            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("ko.memoization.memoize(function() { ko.utils.unwrapObservable($data)._bindingQueue['" + attr.nodeName + "'] = function() { return ko.dependentObservable(function() { return ko.utils.unwrapObservable(" + attr.value + "); }); }; })"));
        };
        
        var addBindings = function(element) {
            if(!_xmlTemplate.elementHasModelBinding(element))
                //TODO: this is invalid. Need to check if existing model is null first
                addBindingAttributes({nodeName: "model", value: "$parent.model"});
            
            enumerate(element.attributes, addBindingAttributes);
        };
        
        enumerate(xmlTemplate.childNodes, function(child, i) {            
            if(_xmlTemplate.isCustomElement(child)) {     
                var id = _xmlTemplate.getId(child) || (itemPrefix + i);
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext(bindingContext.createChildContext(templateItems[\"" + id + "\"]))"));
                addBindings(child);
                 
                var recursive = function(element) {
                    enumerate(element.children, function(element) {  
                        var constructorOk = false;
                        enumerate(element.attributes, function(attr) {
                            //TODO: and is not complex type
                            constructorOk |= attr.nodeName === "constructor" && _xmlTemplate.constructorExists(attr.value);
                        });
                        
                        if(constructorOk) {
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext(bindingContext.createChildContext(" + element.nodeName + "))"));
                            addBindings(element);                        
                            enumerate(element.children, recursive);
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.util.switchBindingContext()"));
                        }
                    });                                
                };
                
                recursive(child);
                var id = _xmlTemplate.getId(child) || (itemPrefix + i);
                // do not use binding context from memo, use context passed in when memo is created (from create javascript evaluator block)
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("ko.memoization.memoize(function(memo) { wpfko.template.xmlTemplate.renderChildFromMemo(memo, bindingContext); })"));
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