
Class("wpfko.template.engine", function () {
    
    var engine = function() {
        ///<summary>The wipeout template engine, inherits from ko.templateEngine</summary>
    };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorFunction = function(script) {
        ///<summary>Modify a block of script so that it's running context is the bining context</summary>
        return new Function("bindingContext", "with(bindingContext) {\n\twith($data) {\n\t\treturn " + script + ";\n\t}\n}");
    }
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        ///<summary>Add a function to the static script cache or cretate and add a script</summary>
        var scriptId = engine.newScriptId();
        
        if(script instanceof Function) {
            engine.scriptCache[scriptId] = script;
        } else {        
            engine.scriptCache[scriptId] = engine.createJavaScriptEvaluatorFunction(script); 
        }
               
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        ///<summary>Add a function to the static script cache or cretate and add a script</summary>
        return engine.createJavaScriptEvaluatorBlock(script);
    };
    
    engine.prototype.rewriteTemplate = function (template, rewriterCallback, templateDocument) {
                                
        //TODO: if template is not a string
        var script = document.getElementById(template);
        
        this.wipeoutRewrite(script);
        
        // if it is an anonymous template it will already have been rewritten
        if(!engine.scriptHasBeenReWritten.test(script.textContent)) {
            
            ko.templateEngine.prototype.rewriteTemplate.call(this, template, rewriterCallback, templateDocument);
        } else {
            //TODO: why does this case exist. Hint, the only one seems to be the default template for itemsControl
        }
        
        this.makeTemplateSource(template, templateDocument).data("isRewritten", true);
    };    
    
    engine.wipeoutRewrite = function(xmlElement) {
        ///<summary>Recursively go through an xml element and replace all view models with render comments</summary>
        if(wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName) !== -1) {
            enumerate(xmlElement.childNodes, function(child) {
                if(child.nodeType === 1)
                    engine.wipeoutRewrite(child);
            });
        } else {
            var newScriptId = engine.newScriptId();
            engine.scriptCache[newScriptId] = function(parentBindingContext) {
                var vm = wpfko.utils.obj.createObject(xmlElement.nodeName);                
                var context = parentBindingContext.createChildContext(vm);
                vm.initialize(xmlElement, context);                
                return {
                    vm: vm,
                    bindingContext: context,
                    id: wpfko.template.xmlTemplate.getId(xmlElement)
                };
            };
            
            var openingTag = " ko renderFromScript: " + newScriptId + ", wipeout-comment: '" + xmlElement.nodeName + "'";
            xmlElement.parentElement.insertBefore(document.createComment(openingTag), xmlElement);
            xmlElement.parentElement.insertBefore(document.createComment(" /ko "), xmlElement);
            xmlElement.parentElement.removeChild(xmlElement);
        }
    };
    
    engine.prototype.wipeoutRewrite = function(script) {
        
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
                engine.wipeoutRewrite(xmlTemplate.childNodes[i]);
            
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
            cached = new wpfko.template.xmlTemplate(templateSource.text());
            templateSource['data']('precompiled', cached);
        }
        
        var output;
        
        // wrap in a computed so that observable evaluations will not propogate to the template engine
        ko.dependentObservable(function() {
            output = cached.render(bindingContext)
        }, this).dispose();
        
        return output;
    };
    
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
    
    // look in build files for template engine definition
});