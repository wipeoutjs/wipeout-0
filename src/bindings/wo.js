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
                while(current.$data.woInvisible)
                    current = current.$parentContext;

                current.$data.templateItems[vals.id] = this.renderedView;
            }
            
            this.render = new wipeout.bindings.render(element, this.renderedView, allBindingsAccessor, bindingContext);
            this.render.render(this.renderedView);            
        },
        dispose: function() {
            this.render.dispose();
            this.renderedView.dispose();
            this._super();
        },
        statics: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>                
                new wipeout.bindings.wo(element, valueAccessor(), allBindingsAccessor, bindingContext);
            }
        }
    });
});