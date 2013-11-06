
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var engine = function() { };
    engine.prototype = new ko.templateEngine();
    
    engine.createJavaScriptEvaluatorBlock = function(script) {
        var scriptId = engine.newScriptId();
        engine.scriptCache[scriptId] = new Function("bindingContext", "with(bindingContext) { with($data) { return " + script + "; } }");        
        return engine.openCodeTag + scriptId + engine.closeCodeTag;
    };
    
    //TODO: this is temporary
    var ttttt = 9;    
    engine.rrr = function(renderedTag, placeholderId, bindingContext) {
        debugger;
        var node = document.getElementById(placeholderId);
        var renderedTag = wpfko.util.html.createElement(renderedTag);
        node.parentElement.insertBefore(renderedTag, node);
        node.parentElement.removeChild(node);
        ko.memoization.unmemoizeDomNodeAndDescendants(renderedTag, [bindingContext]); 
    };
    
    
    
    engine.prototype.createJavaScriptEvaluatorBlock = function(script) {
        var id = "sssss" + (++ttttt);
        return engine.createJavaScriptEvaluatorBlock("(function() { $data._koBindingQueue.push(function() { wpfko.template.engine.rrr(" + script + ", '" + id + "', bindingContext); }); return '<div id=\"" + id + "\">rwe</div>'; })()");
    };
    
    engine.prototype.renderTemplateSource = function (templateSource, bindingContext, options) {
        //var cached;
        //var domElement = templateSource.domElement || templateSource.i; //TODO: non debug version of ko has no domElement
        //if (!(cached = engine.templateCache[domElement.id])) {
        //    cached = engine.templateCache[domElement.id] = new wpfko.template.xmlTemplate(templateSource.text());
        //}
        
        var cached = templateSource['data']('precompiled');
        if (!cached) {
            cached = new wpfko.template.xmlTemplate(templateSource.text());
            templateSource['data']('precompiled', cached);
        }
        
        cached.rebuild(bindingContext.$data);
        var html = ko.utils.parseHtmlFragment(cached.render(bindingContext));
        cached.addReferencedElements(bindingContext.$data, html);
        
        return html;
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