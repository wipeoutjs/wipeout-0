
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var engine = function() { };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        var scriptId = engine.newScriptId();
        
        engine.scriptCache[scriptId] = new Function("with(arguments[0]) { with($data) { return " + script + "; } }");        
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        return engine.createJavaScriptEvaluatorBlock(script);
    };
    
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        
        var cached;
        if (!(cached = engine.templateCache[templateSource.domElement.id])) {
            cached = engine.templateCache[templateSource.domElement.id] = new wpfko.template.xmlTemplate(templateSource.text());
        }
        
        cached.rebuild(bindingContext.$data);
        return ko.utils.parseHtmlFragment(cached.render(bindingContext));      
    };
    
    engine.newScriptId = (function() {        
        var i = Math.floor(Math.random() * 10000);        
        return function() {
            return "ScriptId" + (++i);
        };
    })();
    
    engine.templateCache = {};
    engine.scriptCache = {};
    engine.openCodeTag = "<!-- wpfko_code: {"
    engine.closeCodeTag = "} -->";
    
    wpfko.template.engine = engine;    
    ko.setTemplateEngine(new engine());    
})();

/*
ko.__tr_ambtns(
    function($context, $element) {
        return(function() {
            return { 
                'html': model, 
                '_ko_property_writers' : { 
                    'html' : function(__ko_value) { 
                        model = __ko_value; 
                    } 
                }  
            } 
        })();
    },'span')*/