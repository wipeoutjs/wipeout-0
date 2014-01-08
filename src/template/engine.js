
Class("wpfko.template.engine", function () {
    
    var engine = function() { };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorFunction = function(script) {
        return new Function("bindingContext", "with(bindingContext) {\n\twith($data) {\n\t\treturn " + script + ";\n\t}\n}");
    }
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        var scriptId = engine.newScriptId();
        
        if(script instanceof Function) {
            engine.scriptCache[scriptId] = script;
        } else {        
            engine.scriptCache[scriptId] = engine.createJavaScriptEvaluatorFunction(script); 
        }
               
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        return engine.createJavaScriptEvaluatorBlock(script);
    };    
    
    engine.prototype.isTemplateRewritten = function (template, templateDocument) {
        //TODO: if template is not a string
        if(template && template.constructor === String) {
            var script = document.getElementById(template);
            if(engine.scriptHasBeenReWritten.test(script.textContent))
                this.makeTemplateSource(template, templateDocument).data("isRewritten", true);
        }
        
        return ko.templateEngine.prototype.isTemplateRewritten.apply(this, arguments);
    };
    
    
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        
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
            cached.rebuild(bindingContext);
            output = cached.render(bindingContext)
        }, this).dispose();
        
        return output;
    };
    
    engine.newScriptId = (function() {        
        var i = Math.floor(Math.random() * 10000);        
        return function() {
            return (++i).toString();
        };
    })();
    
    engine.scriptCache = {};
    engine.openCodeTag = "<!-- wpfko_code: {"
    engine.closeCodeTag = "} -->";
    engine.scriptHasBeenReWritten = RegExp(engine.openCodeTag.replace("{", "\{") + "[0-9]+" + engine.closeCodeTag.replace("}", "\}"));
    
    return engine;
    
    // look in build files for template engine definition
});