
Class("wpfko.template.engine", function () {
    
    var engine = function() {
        ///<summary>The wipeout template engine, inherits from ko.templateEngine</summary>
    };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorFunction = function(script) {
        ///<summary>Modify a block of script so that it's running context is bindingContext.$data first and biningContext second</summary>
        return new Function("bindingContext", "with(bindingContext) {\n\twith($data) {\n\t\treturn " + script + ";\n\t}\n}");
    }
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        ///<summary>Add a function to the static script cache or cretate and add a function from a string</summary>
        var scriptId = engine.newScriptId();
        
        if(script instanceof Function) {
            engine.scriptCache[scriptId] = script;
        } else {        
            engine.scriptCache[scriptId] = engine.createJavaScriptEvaluatorFunction(script); 
        }
               
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        ///<summary>Add a function to the static script cache or cretate and add a function from a string</summary>
        return engine.createJavaScriptEvaluatorBlock(script);
    };
    
    engine.prototype.rewriteTemplate = function (template, rewriterCallback, templateDocument) {
        ///<summary>First re-write the template via knockout, then re-write the template via wipeout</summary>
        
        var script = document.getElementById(template);
        if (script instanceof HTMLElement) {        
            // if it is an anonymous template it will already have been rewritten
            if (!engine.scriptHasBeenReWritten.test(script.textContent)) {
                ko.templateEngine.prototype.rewriteTemplate.call(this, template, rewriterCallback, templateDocument);
            } else {
                this.makeTemplateSource(template, templateDocument).data("isRewritten", true);
            }
            
            this.wipeoutRewrite(script, rewriterCallback);
        } else {
            ko.templateEngine.prototype.rewriteTemplate.call(this, template, rewriterCallback, templateDocument);
        }
    };    
    
    engine.wipeoutRewrite = function(xmlElement, rewriterCallback) {
        ///<summary>Recursively go through an xml element and replace all view models with render comments</summary>
        if(wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName) !== -1) {
            for(var i = 0; i < xmlElement.childNodes.length; i++)
                if(xmlElement.childNodes[i].nodeType === 1)
                    engine.wipeoutRewrite(xmlElement.childNodes[i], rewriterCallback);
        } else {
            var newScriptId = engine.newScriptId();
            engine.scriptCache[newScriptId] = function(parentBindingContext) {
                var vm = wpfko.utils.obj.createObject(xmlElement.nodeName);                
                var context = parentBindingContext.createChildContext(vm);
                vm.initialize(xmlElement, context);                
                return {
                    vm: vm,
                    bindingContext: context,
                    id: engine.getId(xmlElement)
                };
            };
            
            var tags = "<!-- ko";
            if(DEBUG)
                tags += " wipeout-type: '" + xmlElement.nodeName + "',";
            
            tags += " wo: " + newScriptId + " --><!-- /ko -->";
            
            var nodes = new DOMParser().parseFromString("<root>" + rewriterCallback(tags) + "</root>", "application/xml").documentElement;
            while(nodes.childNodes.length) {
                var node = nodes.childNodes[0];
                node.parentElement.removeChild(node);
                xmlElement.parentElement.insertBefore(node, xmlElement);
            };
            
            xmlElement.parentElement.removeChild(xmlElement);
        }
    };    
    
    engine.getId = function(xmlElement) {
        ///<summary>Get the id property of the xmlElement if any</summary>
        for(var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {
            if(xmlElement.attributes[i].nodeName === "id") {
                return xmlElement.attributes[i].value;
            }
        }
        
        return null;
    };
    
    engine.prototype.wipeoutRewrite = function(script, rewriterCallback) {
        ///<summary>Replace all wipeout views with render bindings</summary>
        
        var ser = new XMLSerializer();
        xmlTemplate = new DOMParser().parseFromString("<root>" + script.textContent + "</root>", "application/xml").documentElement;        
        if(xmlTemplate.firstChild && xmlTemplate.firstChild.nodeName === "parsererror") {
            //TODO: copy pasted
			throw "Invalid xml template:\n" + ser.serializeToString(xmlTemplate.firstChild);
		}
        
        var scriptContent = [];
        // do not use ii, xmlTemplate.childNodes may change
        for(var i = 0; i < xmlTemplate.childNodes.length; i++) {            
            if(xmlTemplate.childNodes[i].nodeType === 1)
                engine.wipeoutRewrite(xmlTemplate.childNodes[i], rewriterCallback);
            
            scriptContent.push(ser.serializeToString(xmlTemplate.childNodes[i]));
        }
        
        script.textContent = scriptContent.join("");
    };
    
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        ///<summary>Build html from a template source</summary>
        
        // if data is not a view, cannot render.
        //TODO: default to native template engine
        if (!(bindingContext.$data instanceof wpfko.base.view))
            return [];
        
        var cached = templateSource['data']('precompiled');
        if (!cached) {
            cached = new wpfko.template.htmlBuilder(templateSource.text());
            templateSource['data']('precompiled', cached);
        }
        
        var output;
        
        // wrap in a computed so that observable evaluations will not propogate to the template engine
        ko.dependentObservable(function() {
            output = cached.render(bindingContext)
        }, this).dispose();
        
        return output;
    };
    
    // override functions for the sake of documentation
    if(DEBUG) {
        var override = function(toOverride) {
            engine.prototype[toOverride] = function () {
                ///<summary>Knockout native function</summary>
                ko.templateEngine.prototype[toOverride].apply(this, arguments);
            };
        };
        
        override("isTemplateRewritten");
        override("makeTemplateSource");
        override("renderTemplate");
    }
    
    engine.newScriptId = (function() {        
        var i = Math.floor(Math.random() * 10000);        
        return function() {
            ///<summary>Get a unique name for a script</summary>
            return (++i).toString();
        };
    })();
    
    engine.scriptCache = {};
    engine.openCodeTag = "<!-- wpfko_code: {"
    engine.closeCodeTag = "} -->";
    engine.scriptHasBeenReWritten = RegExp(engine.openCodeTag.replace("{", "\{") + "[0-9]+" + engine.closeCodeTag.replace("}", "\}"));
    
    engine.instance = new engine();
    
    return engine;
});