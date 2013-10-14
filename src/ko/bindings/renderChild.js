
(function () {
    
    window.kowpf = window.kowpf || {};
    kowpf.bindings = kowpf.bindings || {};
    
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.init.call(this, element, kowpf.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.update.call(this, element, kowpf.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };    
    
    var createValueAccessor = function(oldValueAccessor) {
        return function () {
            var child = oldValueAccessor();
            return {
                name: ko.utils.unwrapObservable(oldValueAccessor())._htmlTemplateId,
                data: child
            }
        };
    };
    
    kowpf.bindings.renderChild = {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.renderChild = {};
    ko.virtualElements.allowedBindings.renderChild = true;
    for(var i in kowpf.bindings.renderChild) {
        if(i !== "utils") {
            ko.bindingHandlers.renderChild[i] = kowpf.bindings.renderChild[i];
        }
    };
})();