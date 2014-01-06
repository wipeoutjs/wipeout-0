
Binding("wpfko", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        //TODO: knockout standard way of controling element        
        //TODO: add optional inline properties to binding   
        
        if(ko.utils.domData.get(element, wpfko.bindings.wpfko.utils.wpfkoKey))
            throw "This element is already bound to another model";
        
        var type = valueAccessor();
        if(!type)
            throw "Invalid view type";
            
        var view = new type();
        if(!(view instanceof wpfko.base.view))
            throw "Invalid view type";        
        
        view.model(viewModel);   
        
        var output = ko.bindingHandlers.render.init.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        ko.bindingHandlers.render.update.call(this, element, createValueAccessor(view), allBindingsAccessor, null, bindingContext);
        return output;
    };
    
    var createValueAccessor = function(view) {
        return function() {
            return view;
        };
    };
     
    return {
        init: init,
        utils: {
            createValueAccessor: createValueAccessor,
            wpfkoKey: "__wpfko"
        }
    };
});