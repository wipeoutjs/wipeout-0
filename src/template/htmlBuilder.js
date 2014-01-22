Class("wpfko.template.htmlBuilder", function () {
    
    var htmlBuilder = function(xmlTemplate) {
        
        this.render = htmlBuilder.generateRender(xmlTemplate);
    };
    
    htmlBuilder.elementHasModelBinding = function(element) {
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            if(element.attributes[i].nodeName === "model" || element.attributes[i].nodeName === "model-tw")
                return true;
        }
        
        for(var i = 0, ii = element.childNodes.length; i < ii; i++) {
            if(element.childNodes[i].nodeType === 1 && element.childNodes[i].nodeName === "model")
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
                    returnVal.push(rendered);
                } else {
                    returnVal.push(result[i]);
                }
            }
            
            return wpfko.utils.html.createElements(returnVal.join(""));
        };
    };
    
    htmlBuilder.generateTemplate = function(xmlTemplate, itemPrefix) {  
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        enumerate(xmlTemplate.childNodes, function(child, i) {            
            if(child.nodeType == 1) {
                
                // create copy with no child nodes
                var ch = new DOMParser().parseFromString(ser.serializeToString(child), "application/xml").documentElement;
                while (ch.childNodes.length) {
                    ch.removeChild(ch.childNodes[0]);
                }
                
                var html = wpfko.utils.html.createElement(ser.serializeToString(ch));
                html.innerHTML = wpfko.template.htmlBuilder.generateTemplate(child, itemPrefix + i);                
                result.push(wpfko.utils.html.outerHTML(html));
            } else if(child.nodeType === 3) {
                result.push(child.data);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
        
        return result.join("");
    };
    
    return htmlBuilder;
});