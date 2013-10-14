
(function () {
    
    window.kowpf = window.kowpf || {};
    kowpf.bindings = kowpf.bindings || {};
    
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);       
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = valueAccessor();
        if(ko.isObservable(viewModel[values.property])) {
            viewModel[values.property](ko.utils.unwrapObservable(values.value));
        } else {
            viewModel[values.property] = ko.utils.unwrapObservable(values.value);
        }         
    };
    
    kowpf.bindings.bind = {
        init: init,
        update: update,
        utls: {}
    };
            
    ko.bindingHandlers.bind = {};
    ko.virtualElements.allowedBindings.bind = true;
    for(var i in kowpf.bindings.bind) {
        if(i !== "utils") {
            ko.bindingHandlers.bind[i] = kowpf.bindings.bind[i];
        }
    };
})();