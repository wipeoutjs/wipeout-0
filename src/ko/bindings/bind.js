
var kowpf = kowpf || {};
    kowpf.bindings = kowpf.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);       
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var values = valueAccessor();
        if(ko.isObservable(get(viewModel, values.property))) {
            get(viewModel, values.property)(ko.utils.unwrapObservable(values.value));
        } else {
            set(viewModel, values.property, ko.utils.unwrapObservable(values.value));
        }         
    };
    
    var get = function(object, property) {
        property = property.split(".");
        for(var i = 0, ii = property.length; i < ii; i++) {
            object = object[property[i]];
        }
        
        return object;
    }
    
    var set = function(object, property, value) {
        property = property.split(".");
        var i = 0;
        for(var ii = property.length - 1; i < ii; i++) {
            object = object[property[i]];
        }
        
        object[property[i]] = value;
    }
    
    kowpf.bindings.bind = {
        init: init,
        update: update,
        utils: {}
    };
            
    ko.bindingHandlers.bind = {};
    ko.virtualElements.allowedBindings.bind = true;
    for(var i in kowpf.bindings.bind) {
        if(i !== "utils") {
            ko.bindingHandlers.bind[i] = kowpf.bindings.bind[i];
        }
    };
})();