
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var htmlBuilder = function(xmlTemplate) {
        
        this.render = htmlBuilder.generateRender(xmlTemplate);
    };
    
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    htmlBuilder.elementHasModelBinding = function(element) {
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            if(element.attributes[i].nodeName === "model" || element.attributes[i].nodeName === "model-tw")
                return true;
        }
        
        for(var i = 0, ii = element.children.length; i < ii; i++) {
            if(element.children[i].nodeName === "model")
                return true;
        }
        
        return false;
    };
    
    htmlBuilder.constructorExists = function(constructor) {
        
        constructor = constructor.split(".");
        var current = window;
        for(var i = 0, ii = constructor.length; i < ii; i++) {
            current = current[constructor[i]];
            if(!current) return false;
        }
        
        return current instanceof Function;
    };
    
    htmlBuilder.generateRender = function(xmlTemplate) {
        var open = wpfko.template.engine.openCodeTag;
        var close = wpfko.template.engine.closeCodeTag;
        
        var template = wpfko.template.htmlBuilder.generateTemplate(xmlTemplate);
                 
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
                    if(rendered instanceof wpfko.template.switchBindingContext) {
                        if(rendered.bindingContext) {
                            contexts.push(bindingContext);
                            bindingContext = rendered.bindingContext;
                        } else {
                            // empty rendered.bindingContext signifies we revert to the parent binding context
                            bindingContext = contexts.pop();
                        }
                    } else {                    
                        returnVal.push(rendered);
                    }
                } else {
                    returnVal.push(result[i]);
                }
            }
            
            return ko.utils.parseHtmlFragment(returnVal.join(""));
        };
    };
    
    var reserved = ["constructor", "constructor-tw", "id","id-tw"];
    
    htmlBuilder.renderChildFromMemo = function(bindingContext) {
        
        return ko.memoization.memoize(function(memo) { 
            var comment1 = document.createComment(' ko ');
            var comment2 = document.createComment(' /ko ');
            var p = wpfko.util.ko.virtualElements.parentElement(memo);
            ko.virtualElements.insertAfter(p, comment1, memo);
            ko.virtualElements.insertAfter(p, comment2, comment1);
                
            var acc = function() {
                return bindingContext.$data;
            };
            
            wpfko.ko.bindings.renderChild.init(comment1, acc, acc, wpfko.util.ko.peek(bindingContext.$data), bindingContext);
            wpfko.ko.bindings.renderChild.update(comment1, acc, acc, wpfko.util.ko.peek(bindingContext.$data), bindingContext);
            
            comment1.parentElement.removeChild(comment1);
            comment2.parentElement.removeChild(comment2);
        });
    };
    
    htmlBuilder.bindToDefaultModel = function(bindingContext) {
        var m = wpfko.util.ko.peek(bindingContext.$data.model);
        if(m == null)
            bindingContext.$data.bind('model', function() {  return ko.utils.unwrapObservable(bindingContext.$parent.model); });
        
        return '';
    };
    
    htmlBuilder.emptySwitchBindingContext = function(bindingContext) {
        return new wpfko.template.switchBindingContext();
    };
    
    htmlBuilder.switchBindingContextToTemplateItem = function(templateItemId) {
        return function(bindingContext) {
            return new wpfko.template.switchBindingContext(bindingContext.createChildContext(bindingContext.$data.templateItems[templateItemId]));
        }
    };
    
    htmlBuilder.generateTemplate = function(xmlTemplate, itemPrefix) {  
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        var addBindingAttributes = function(attr) {
            // reserved
            if(reserved.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = ", function(val) { if(!ko.isObservable(" + attr.value + ")) throw 'Two way bindings must be between 2 observables'; " + attr.value + "(val); }"
            }
            
            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("(function() { $data.bind('" + name + "', function() { return ko.utils.unwrapObservable(" + attr.value + "); }" + setter + "); return ''; })()"));
        };
        
        var addBindings = function(element) {
            if(!htmlBuilder.elementHasModelBinding(element))
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.bindToDefaultModel));
            
            enumerate(element.attributes, addBindingAttributes);
        };
        
        enumerate(xmlTemplate.childNodes, function(child, i) {            
            if(wpfko.template.xmlTemplate.isCustomElement(child)) {     
                var id = wpfko.template.xmlTemplate.getId(child) || (itemPrefix + i);
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.switchBindingContextToTemplateItem(id)));
                addBindings(child);
                 
                var recursive = function(element) {
                    enumerate(element.children, function(element) {  
                        var constructorOk = false;
                        enumerate(element.attributes, function(attr) {
                            //TODO: and is not complex type
                            constructorOk |= attr.nodeName === "constructor" && htmlBuilder.constructorExists(attr.value);
                        });
                        
                        if(constructorOk) {
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock("new wpfko.template.switchBindingContext(bindingContext.createChildContext(wpfko.util.ko.peek(" + element.nodeName + ")))"));
                            addBindings(element);                        
                            enumerate(element.children, recursive);
                            result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.emptySwitchBindingContext));
                        }
                    });                                
                };
                
                recursive(child);
                // do not use binding context from memo, use context passed in when memo is created (from create javascript evaluator block)
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.renderChildFromMemo));
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.emptySwitchBindingContext));
                
            } else if(child.nodeType == 1) {
                
                // create copy with no child nodes
                var ch = new DOMParser().parseFromString(ser.serializeToString(child), "application/xml").documentElement;
                while (ch.childNodes.length) {
                    ch.removeChild(ch.childNodes[0]);
                }
                
                var html = wpfko.util.html.createElement(ser.serializeToString(ch));
                html.innerHTML = wpfko.template.htmlBuilder.generateTemplate(child, itemPrefix + i);                
                result.push(html.outerHTML);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
        
        return result.join("");
    };
    
    wpfko.template.htmlBuilder = htmlBuilder;
})();