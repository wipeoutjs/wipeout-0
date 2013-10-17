
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
    
    _xmlTemplate.isCustomElement = function(xmlElement) {
        return xmlElement.nodeType == 1 && wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName.toLowerCase()) === -1;
    };
    
    _xmlTemplate.generateBuilder = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var builders = [];
        enumerate(xmlTemplate, function(child, i) {
            if(_xmlTemplate.isCustomElement(child)) {
                builders.push(function(obj) {
                    obj._templateItems[itemPrefix + i] = wpfko.util.obj.createObject(child.nodeName);
                    obj._templateItems[itemPrefix + i].initialize(child);
                });
            } else if(child.nodeType == 1) {
                builders.push(_xmlTemplate.generateBuilder(child, i));
            }
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