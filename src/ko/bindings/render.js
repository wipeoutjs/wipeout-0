
Binding("render", true, function () {
        
        var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return wpfko.bindings.namedRender.init.call(this, element, wpfko.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
        };

        var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            return wpfko.bindings.namedRender.update.call(this, element, wpfko.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
        };
    
    var createValueAccessor = function(oldValueAccessor) {
        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            return {
                item: oldValueAccessor()
            }
        };
    };
    
    return {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
});