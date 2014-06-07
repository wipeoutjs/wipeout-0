// Render From Script
Binding("wo", true, function () {
    
    return wipeout.bindings.render.extend({
        constructor: function(element, value, allBindingsAccessor, bindingContext) {
            var view = new value.type();
            this._super(element, view, allBindingsAccessor, bindingContext);
            view.__woBag.createdByWipeout = true;
            view.initialize(wipeout.template.engine.xmlCache[value.initXml], bindingContext);
            
            if(value.id) {
                var current = bindingContext;
                while(current.$data.shareParentScope)
                    current = current.$parentContext;

                current.$data.templateItems[value.id] = view;
            }
            
            this.render(view);
            this.render = function() { throw "Cannont render this binding a second time, use the render binding instead"; };
        },
        dispose: function() {
            this.removeFromParentTemplateItems();
            var value = this.value;
            this._super();
            value.dispose();
        },
        removeFromParentTemplateItems: function() {
            if (this.parentElement && this.value.id) {
                wipeout.bindings.wo.removeFromParentTemplateItems(this.parentElement, this.value.id);
            }
        },
        statics: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>                
                return new wipeout.bindings.wo(element, valueAccessor(), allBindingsAccessor, bindingContext).bindingMeta;
            },
            removeFromParentTemplateItems: function(parentElement, id) {
                var parent = wipeout.utils.html.getViewModel(parentElement);
                while (parent && parent.shareParentScope) {
                    parent = parent.getParent();
                }
                
                if(parent)
                    delete parent.templateItems[id];
            }
        }
    });
});