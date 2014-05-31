
Binding("wipeout", true, function () {
    
    return wipeout.bindings.bindingBase.extend({
        constructor: function(element, type, allBindingsAccessor, viewModel, bindingContext) {
            this._super(element);   
        
            if(wipeout.utils.html.getViewModel(element))
                throw "This element is already bound to another model";

            if(!type || !(type instanceof Function))
                throw "Invalid view type";

            this.renderedView = new type();
            if(!(this.renderedView instanceof wipeout.base.view))
                throw "Invalid view type";  
            
            this.renderedView.model(viewModel);            
            this.render = new wipeout.bindings.render(element, this.renderedView, allBindingsAccessor, bindingContext);            
            this.render.render(this.renderedView);
            this.renderedView.onApplicationInitialized();
        },
        dispose: function() {
            this.render.dispose();
            this.renderedView.dispose();
            this._super();
        },
        statics: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>                
                new wipeout.bindings.wipeout(element, valueAccessor(), allBindingsAccessor, viewModel, bindingContext);
                return { controlsDescendantBindings: true };
            },
            utils: {
                wipeoutKey: "__wipeout"
            }
        },
        moved: function(oldParentElement, newParentElement) {
            this._super(oldParentElement, newParentElement);
            this.render.moved(oldParentElement, newParentElement);
        }
    });
});