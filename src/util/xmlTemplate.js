
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplateId) {
        
        if(!xmlTemplateId) throw "Invalid template";        
        var xmlTemplateElement = document.getElementById(xmlTemplateId);
        if(!xmlTemplateElement) throw "Could not find template \"" + xmlTemplateId + "\"";
        
        var xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplateElement.innerHTML + "</root>", "application/xml").documentElement;
        
        this.xmlTemplateId = xmlTemplateId;
        this.builder = wpfko.util.xmlTemplate.generateBuilder(xmlTemplate);
        
        var htmlTemplate = wpfko.util.xmlTemplate.generateTemplate(xmlTemplate);
        this.saveTemplate(htmlTemplate);
    }
    
    var enumerateAttr = function(element, callback) {
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            callback(element.attributes[i], i);
        }        
    };
    
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
                builders.push(_xmlTemplate.generateBuilder(child, itemPrefix + i));
            } // non elements have no place here but we do want to enumerate over them to keep index in sync
        });
        
        return function(object) {
            object._templateItems = object._templateItems || {};
            
            for(var i = 0, ii = builders.length; i < ii; i++) {
                builders[i](object);
            }
        }
    };
    
    _xmlTemplate.generateTemplate = function(xmlTemplate, itemPrefix) {        
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        var result = [];
        var ser = new XMLSerializer();
        
        enumerate(xmlTemplate, function(child, i) {            
            if(_xmlTemplate.isCustomElement(child)) {
                result.push("<!-- ko with: _templateItems[" + itemPrefix + i + "] -->");
                enumerateAttr(child, function(attr) {
                    result.push("<!-- ko bind: { property: " + attr.nodeName + ", value: " + attr.value + " } -->");
                    result.push("<!-- /ko -->");
                });
                
                result.push("<!-- ko template: { name: _htmlTemplateId -->");
                result.push("<!-- /ko -->");
                result.push("<!-- /ko -->");
                
            } else if(child.nodeType == 1) {
                
                var childNodes = [];
                while (child.childNodes.length) {
                    childNodes.push(child.childNodes[0]);
                    child.removeChild(child.childNodes[0]);
                }
                
                var html = wpfko.util.html.createElement(ser.serializeToString(child));
                for(var i = 0, ii = childNodes.length; i < ii; i++) {
                    html.innerHTML += wpfko.util.xmlTemplate.generateHtmlTemplate(childNodes[i], itemPrefix + i);
                }
                
                result.push(html.outerHTML);
            } else {
                result.push(ser.serializeToString(child));
            }
        });
    }
    
    _xmlTemplate.saveTemplate = function() {
    }
    
    
    wpfko.util.xmlTemplate = _xmlTemplate;
})();