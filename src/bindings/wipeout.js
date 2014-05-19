
Binding("wipeout", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wipeout binding. The wipeout binding is the entry point into a wipeout application</summary>

        //TODO: knockout standard way of controling element        
        //TODO: add optional inline properties to binding   
        
        if(wipeout.utils.html.getViewModel(element))
            throw "This element is already bound to another model";
        
        var type = valueAccessor();
        if(!type)
            throw "Invalid view type";
            
        var view = new type();
        if(!(view instanceof wipeout.base.view))
            throw "Invalid view type";        
        
        view.model(viewModel);   
        
        var output = ko.bindingHandlers.render.init.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        ko.bindingHandlers.render.update.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        
        view.onApplicationInitialized();
        
        return output;
    };
    
    var createValueAccessor = function(view) {
        ///<summary>Create a value accessor for the render binding.</summary>
        return function() {
            return view;
        };
    };
     
    return {
        init: init,
        utils: {
            createValueAccessor: createValueAccessor,
            //TODO: is this used
            wipeoutKey: "__wipeout"
        }
    };
});