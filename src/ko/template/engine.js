
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var open = "<!-- wpfko_code: {", close = "} -->";
    
    var engine = function() { };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        var scriptId = engine.newScriptId();
        
        engine.scriptCache[scriptId] = new Function("with(arguments[0]) { with($data) { return " + script + "; } }");        
        return open + scriptId + close;
    };
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        return engine.createJavaScriptEvaluatorBlock(script);
    };
    
    engine.templateCache = {};
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        
        var cached;
        if (!(cached = engine.templateCache[templateSource.domElement.id])) {
            cached = engine.templateCache[templateSource.domElement.id] = new wpfko.util.xmlTemplate(templateSource.text());
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
    
    wpfko.template.engine = engine;    
    ko.setTemplateEngine(new engine());
    
    var rrr = function(template, bindingContext) {   
        var startTax, endTag;
        var result = [];
        while((startTax = template.indexOf(open)) !== -1) {
            result.push(template.substr(0, startTax));
            template = template.substr(startTax);
            
            endTag = template.indexOf(close);
            if(endTag === -1) {
                throw "##";
            }
            
            result.push(engine.scriptCache[template.substr(open.length, endTag - open.length)](bindingContext.$data.model(), bindingContext));
            
            
            template = template.substr(endTag + close.length);
        }
                
        result.push(template);
        return result.join("");
    }
    
    engine.scriptCache = {};
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