
var kowpf = kowpf || {};
    kowpf.bindings = kowpf.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        if(element.__kowpfView) {
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
    
    kowpf.bindings.kowpf = {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.kowpf = {};
    ko.virtualElements.allowedBindings.kowpf = true;
    for(var i in kowpf.bindings.kowpf) {
        if(i !== "utils") {
            ko.bindingHandlers.kowpf[i] = kowpf.bindings.kowpf[i];
        }
    };
})();