

Class("wpfko.template.xmlTemplate", function () {
    
    var xmlTemplate = function(templateString) {             
        
        this.htmlBuilder = new wpfko.template.htmlBuilder(templateString);
    }
    
    xmlTemplate.getId = function(xmlElement) {
        for(var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {
            if(xmlElement.attributes[i].nodeName === "id") {
                return xmlElement.attributes[i].value;
            }
        }
        
        return null;
    };
    
    xmlTemplate.prototype.render = function(bindingContext) {        
        var html = this.htmlBuilder.render(bindingContext);
        enumerate(html.ids, function(item, id) {
            bindingContext.$data.templateItems[id] = item;
        });
            
        if (bindingContext.$data instanceof wpfko.base.view)
            bindingContext.$data.onInitialized();
        
        return html.html;
    };
    
    return xmlTemplate;
});