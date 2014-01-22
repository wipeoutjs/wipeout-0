
Class("wpfko.template.viewModelBuilder", function () {
    
    var viewModelBuilder = function(xmlTemplate) {
        this.elementsWithId = [];
        this._addBuilders(xmlTemplate);
    };
    
    viewModelBuilder.prototype.addReferencedElements = function(subject, renderedHtml) {
        
        enumerate(this.elementsWithId, function(id) {
            // normalize, input vals will be in an array, not html tree
            var current = {
                childNodes: renderedHtml
            };
            
            // get target node using psuedo xPath
            enumerate(id.split("."), function(val, i) {
                current = current.childNodes[parseInt(val)];
            });
            
            if(!current.id) throw "Unexpected exception, could not find element id";
            subject.templateItems[current.id] = current;
        });
    };    
    
    viewModelBuilder.prototype._addBuilders = function(xmlTemplate, itemPrefix) {
        if(itemPrefix) itemPrefix += ".";
        else itemPrefix = "";
        enumerate(xmlTemplate.childNodes, function(child, i) {
            if(child.nodeType == 1) {
                // if the element has an id, record it so that it can be appended during the building of the object
                if(wpfko.template.xmlTemplate.getId(child))
                    this.elementsWithId.push(itemPrefix + i);
                
                this._addBuilders(child, itemPrefix + i);
            } // non elements have no place here but we do want to enumerate over them to keep index in sync
        }, this);
    }; 
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    return viewModelBuilder;
});