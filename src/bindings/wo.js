// Render From Script
Binding("wo", true, function () {
    
    return wipeout.bindings.bindingBase.extend({
        constructor: function(element, value, allBindingsAccessor, bindingContext) {
            this._super(element);
            
            var vals = wipeout.template.engine.scriptCache[value]();
            this.renderedView = new vals.vmConstructor();
            this.renderedView.__woBag.createdByWipeout = true;
            vals.initialize(this.renderedView, bindingContext);
            
            if(vals.id) {
                var current = bindingContext;
                while(current.$data.shareParentScope)
                    current = current.$parentContext;

                current.$data.templateItems[vals.id] = this.renderedView;
            }
            
            this.render = new wipeout.bindings.render(element, this.renderedView, allBindingsAccessor, bindingContext);
            this.render.render(this.renderedView);            
        },
        dispose: function() {
            this.removeFromParentTemplateItems();
            this.render.dispose();
            this.renderedView.dispose();
            this._super();
        },
        removeFromParentTemplateItems: function() {
            if (this.parentElement) {
                var parent = wipeout.utils.html.getViewModel(this.parentElement);
                while (parent && parent.shareParentScope) {
                    parent = parent.getParent();
                }
                
                if(parent)
                    delete parent.templateItems[this.renderedView.id];
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
            this.render.moved(oldParentElement, newParentElement);
            
            if (this.renderedView.id != null) {
                var oldVm = wipeout.utils.html.getViewModel(oldParentElement);
                while (oldVm && oldVm.shareParentScope) {
                    oldVm = oldVm.getParent();
                }
                
                if(oldVm)
                    delete oldVm.templateItems[this.renderedView.id];
                
                var newVm = wipeout.utils.html.getViewModel(newParentElement);
                while (newVm && newVm.shareParentScope) {
                    newVm = newVm.getParent();
                }
                
                if(newVm)
                    newVm.templateItems[this.renderedView.id] = this.renderedView;
            }
        }
    });
});