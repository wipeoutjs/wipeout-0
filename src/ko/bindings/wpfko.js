
var wpfko = wpfko || {};
    wpfko.bindings = wpfko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        if(element.__wpfkoView) {
            //TODO: knockout standard way of controling element
            throw "##";
        }
        
        //TODO: add optional inline properties to binding        
        var view = new (valueAccessor())();
        view.model(viewModel);                
        element.__wpfkoView = view;
        
        return ko.bindingHandlers.template.init.call(this, element, createValueAccessor(view), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        if(!element.__wpfkoView) {
            //TODO: knockout standard way of controling element
            throw "##";
        }
        
        return ko.bindingHandlers.template.update.call(this, element, createValueAccessor(element.__wpfkoView), allBindingsAccessor, viewModel, bindingContext);
    };    
    
    var createValueAccessor = function(view) {
        return function() {
            return {
                data: view,
                name: view._htmlTemplateId
            };
        };
    };
    
    wpfko.bindings.wpfko = {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.wpfko = {};
    ko.virtualElements.allowedBindings.wpfko = true;
    for(var i in wpfko.bindings.wpfko) {
        if(i !== "utils") {
            ko.bindingHandlers.wpfko[i] = wpfko.bindings.wpfko[i];
        }
    };
})();