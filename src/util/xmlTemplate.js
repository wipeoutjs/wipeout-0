
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplateId) {
        
        if(!xmlTemplateId) throw "Invalid template";        
        var xmlTemplateElement = document.getElementById(xmlTemplateId);
        if(!xmlTemplateElement) throw "Could not find template \"" + xmlTemplateId + "\"";
        
        var xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplateElement.innerHTML + "</root>", "application/xml").documentElement;
        
        this.builder = wpfko.util.xmlTemplate.generateBuilder(xmlTemplate);
    }
    
    var enumerate = function(element, callback) {
        
        for(var i = 0, ii = element.childNodes.length; i < ii; i++) {
            callback(element.childNodes[i], i);
        }        
    };
    
    _xmlTemplate.generateBuilder = function(xmlTemplate) {
        var builders = [];
        enumerate(xmlTemplate, function(child, i) {
            if(
        });
        
        return function(object) {
            object._templateItems = object._templateItems || {};
            
            for(var i = 0, ii = builders.length; i < ii; i++) {
                builders[i](object);
            }
        }
    };
    
    
    wpfko.util.xmlTemplate = _xmlTemplate;
})();