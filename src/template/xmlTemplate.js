
var wpfko = wpfko || {};
wpfko.template = wpfko.template || {};

(function () {
    
    var _xmlTemplate = function(xmlTemplate) {
        
        this._builders = [];
                
        xmlTemplate = new DOMParser().parseFromString("<root>" + xmlTemplate + "</root>", "application/xml").documentElement;
        
        this.viewModelBuilder = new wpfko.template.viewModelBuilder(xmlTemplate);
        this.htmlBuilder = new wpfko.template.htmlBuilder(xmlTemplate);
    }
    
    _xmlTemplate.isCustomElement = function(xmlElement) {
        return xmlElement.nodeType == 1 && wpfko.base.visual.reservedTags.indexOf(xmlElement.nodeName.toLowerCase()) === -1;
    };
    
    _xmlTemplate.getId = function(xmlElement) {
        for(var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {
            if(xmlElement.attributes[i].nodeName === "id") {
                return xmlElement.attributes[i].value;
            }
        }
        
        return null;
    };
    
    _xmlTemplate.prototype.render = function(bindingContext) {
        var html = this.htmlBuilder.render(bindingContext);
        this.viewModelBuilder.addReferencedElements(bindingContext.$data, html);
        return html;
    };
    
    _xmlTemplate.prototype.rebuild = function(subject) {
        this.viewModelBuilder.rebuild(subject);
    };
    
    wpfko.template.xmlTemplate = _xmlTemplate;
})();