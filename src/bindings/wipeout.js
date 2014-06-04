
Binding("wipeout", true, function () {
    
    return wipeout.bindings.render.extend({
        constructor: function(element, type, allBindingsAccessor, viewModel, bindingContext) {  
        
            if(wipeout.utils.html.getViewModel(element))
                throw "This element is already bound to another model";

            if(!type || !(type instanceof Function))
                throw "Invalid view type";

            this.renderedView = new type();
            if(!(this.renderedView instanceof wipeout.base.view))
                throw "Invalid view type";
            
            this._super(element, this.renderedView, allBindingsAccessor, bindingContext);   
            
            this.renderedView.model(viewModel);                   
            this.render(this.renderedView);
            this.render = function() { throw "Cannont render this binding a second time, use the render binding instead"; };
            
            this.renderedView.onApplicationInitialized();
        },
        dispose: function() {
            this._super();
            this.renderedView.dispose();
        },
        statics: {
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>                
                return new wipeout.bindings.wipeout(element, valueAccessor(), allBindingsAccessor, viewModel, bindingContext).initReturnValue;
            },
            utils: {
                wipeoutKey: "__wipeout"
            }
        }
    });
});