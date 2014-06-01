// Render From Script
Binding("wo", true, function () {
    
    return wipeout.bindings.render.extend({
        constructor: function(element, value, allBindingsAccessor, bindingContext) {
            var vals = wipeout.template.engine.scriptCache[value]();
            var value = new vals.vmConstructor();
            this._super(element, value, allBindingsAccessor, bindingContext);
            value.__woBag.createdByWipeout = true;
            vals.initialize(value, bindingContext);
            
            if(vals.id) {
                var current = bindingContext;
                while(current.$data.shareParentScope)
                    current = current.$parentContext;

                current.$data.templateItems[vals.id] = value;
            }
            
            this.render(value);
            this.render = function() { throw "Cannont render this binding a second time, use the render binding instead"; };
        },
        dispose: function() {
            this.removeFromParentTemplateItems();
            this.value.dispose();
            this._super();
        },
        removeFromParentTemplateItems: function() {
            if (this.parentElement) {
                var parent = wipeout.utils.html.getViewModel(this.parentElement);
                while (parent && parent.shareParentScope) {
                    parent = parent.getParent();
                }
                
                if(parent)
                    delete parent.templateItems[this.value.id];
            }
        },
        statics: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>                
                new wipeout.bindings.wo(element, valueAccessor(), allBindingsAccessor, bindingContext);
            }
        },
        moved: function(oldParentElement, newParentElement) {
            this._super(oldParentElement, newParentElement);
            
            if (this.value.id != null) {
                var oldVm = wipeout.utils.html.getViewModel(oldParentElement);
                while (oldVm && oldVm.shareParentScope) {
                    oldVm = oldVm.getParent();
                }
                
                if(oldVm)
                    delete oldVm.templateItems[this.value.id];
                
                var newVm = wipeout.utils.html.getViewModel(newParentElement);
                while (newVm && newVm.shareParentScope) {
                    newVm = newVm.getParent();
                }
                
                if(newVm)
                    newVm.templateItems[this.value.id] = this.value;
            }
        }
    });
});