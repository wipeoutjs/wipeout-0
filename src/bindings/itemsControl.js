
Binding("itemsControl", true, function () {
    
    var itemsControlTemplate = "";
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var ic = wpfko.utils.ko.peek(valueAccessor());
        if(ic && !(ic instanceof wo.itemsControl)) throw "This binding can only be used on itemsControls";
        
        return ko.bindingHandlers.template.init.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var ic = wpfko.utils.ko.peek(valueAccessor());
        if(ic && !(ic instanceof wo.itemsControl)) throw "This binding can only be used on itemsControls";
        
        return ko.bindingHandlers.template.update.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var utils = {
        createAccessor: function(vm) {
            vm = wpfko.utils.ko.peek(vm);
            return function() {
                return {
                    name: vm.__itemsTemplate,
                    foreach: vm.items
                };
            }
        }        
    };
    
    return {
        init: init,
        update: update,
        utils: utils
    };
});

Binding("ic-render", true, function () {
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        return wpfko.bindings.render.init.call(this, element, valueAccessor, allBindingsAccessor, bindingContext.$parent, bindingContext.$parentContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        return wpfko.bindings.render.update.call(this, element, valueAccessor, allBindingsAccessor, bindingContext.$parent, bindingContext.$parentContext);
    };
    
    return {
        init: init,
        update: update
    };
});