
(function () {
    
    window.kowpf = window.kowpf || {};
    kowpf.bindings = kowpf.bindings || {};
    
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        if(element.__kowpfView) {
            //TODO: knockout standard way of controling element
            throw "##";
        }
        
        //TODO: add optional inline properties to binding
        
        var view = new (valueAccessor())();
        view.model(viewModel);
        view.initialize(bindingContext.createChildContext(view));
        
        view.nodes.subscribe(function(newValues) {
            ko.virtualElements.emptyNode(element);
                      
            if(newValues) {
                // going backwards because there is no append method
                for(var i = newValues.length - 1; i >= 0; i--) {
                    ko.virtualElements.prepend(element, newValues[i]);
                }                
            }
        }, view);        
                
        element.__wpfkoView = view;
        view.reGenerate();
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        if(!element.__wpfkoView) {
            //TODO: knockout standard way of controling element
            throw "##";
        }
        
        element.__wpfkoView.bindingContext(bindingContext);
    };
    
    kowpf.bindings.kowpf = {
        init: init,
        update: update,
        utls: {}
    };
            
    ko.bindingHandlers.kowpf = {};
    ko.virtualElements.allowedBindings.kowpf = true;
    for(var i in kowpf.bindings.kowpf) {
        if(i !== "utils") {
            ko.bindingHandlers.kowpf[i] = kowpf.bindings.kowpf[i];
        }
    };
})();