
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var engine = function() { };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorFunction = function(script) {
        return new Function("bindingContext", "with(bindingContext) { with($data) { return " + script + "; } }");
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
    
    //if it is an anonymous template it will already have been re-written within the template it was defined in
    //TODO: better way of finding anonymous template
    engine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
        //TODO: not sure why template can be a html element or template id string
        if(template && template.constructor === String && template.indexOf("AnonymousTemplate") === 0) 
            this.makeTemplateSource(template, templateDocument).data("isRewritten", true);
        
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
        ko.computed(function() {
            cached.rebuild(bindingContext);
            output = cached.render(bindingContext)
        }, this).dispose();
        
        return output;
    };
    
    engine.newScriptId = (function() {        
        var i = Math.floor(Math.random() * 10000);        
        return function() {
            return "ScriptId" + (++i);
        };
    })();
    
    engine.scriptCache = {};
    engine.openCodeTag = "<!-- wpfko_code: {"
    engine.closeCodeTag = "} -->";
    
    wpfko.template.engine = engine;    
    ko.setTemplateEngine(new engine());    
})();