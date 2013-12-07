
var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        //TODO: knockout standard way of controling element        
        //TODO: add optional inline properties to binding   
        var type = valueAccessor();
        if(!type)
            throw "Invalid view type";
            
        var view = new type();
        if(!(view instanceof wpfko.base.view))
            throw "Invalid view type";
        
        view.model(viewModel);                
        element.__wpfkoView = view;
        
        var output = ko.bindingHandlers.template.init.call(this, element, createValueAccessor(view), allBindingsAccessor, viewModel, bindingContext);
        ko.bindingHandlers.template.update.call(this, element, createValueAccessor(view), allBindingsAccessor, viewModel, bindingContext);
        return output;
    };
    
    var createValueAccessor = function(view) {
        return function() {
            return {
                data: view,
                name: view.templateId,
                afterRender: wpfko.base.visual._afterRendered
            };
        };
    };
    
    wpfko.ko.bindings.wpfko = {
        init: init,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.wpfko = {};
    ko.virtualElements.allowedBindings.wpfko = true;
    for(var i in wpfko.ko.bindings.wpfko) {
        if(i !== "utils") {
            ko.bindingHandlers.wpfko[i] = wpfko.ko.bindings.wpfko[i];
        }
    };
})();