
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
                throw "Invalid wpfko_code tag.";
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
        
    htmlBuilder.renderFromMemo = function(bindingContext) {
        return ko.memoization.memoize(function(memo) { 
            var comment1 = document.createComment(' ko ');
            var comment2 = document.createComment(' /ko ');
            var p = wpfko.util.ko.virtualElements.parentElement(memo);
            ko.virtualElements.insertAfter(p, comment1, memo);
            ko.virtualElements.insertAfter(p, comment2, comment1);
                
            var acc = function() {
                return bindingContext.$data;
            };
            
            // renderFromMemo can only derive the parent/child from the binding context
            wpfko.ko.bindings.render.init(comment1, acc, acc, wpfko.util.ko.peek(bindingContext.$parentContext.$data), bindingContext.$parentContext);
            wpfko.ko.bindings.render.update(comment1, acc, acc, wpfko.util.ko.peek(bindingContext.$parentContext.$data), bindingContext.$parentContext);            
        });
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
        
        enumerate(xmlTemplate.childNodes, function(child, i) {            
            if(wpfko.template.xmlTemplate.isCustomElement(child)) {     
                var id = wpfko.template.xmlTemplate.getId(child) || (itemPrefix + i);
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.switchBindingContextToTemplateItem(id)));                
                result.push(wpfko.template.engine.createJavaScriptEvaluatorBlock(htmlBuilder.renderFromMemo));
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