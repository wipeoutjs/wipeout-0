
Binding("itemsControl", true, function () {
    
    var itemsControlTemplate = "";
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if(!itemsControlTemplate) {
            itemsControlTemplate = "<!-- ko ic-render: $data";
            if(DEBUG) 
                itemsControlTemplate += ", wipeout-type: 'items[' + wpfko.util.ko.peek($index) + ']'";
            
            itemsControlTemplate += " --><!-- /ko -->";
            itemsControlTemplate = wpfko.base.contentControl.createAnonymousTemplate(itemsControlTemplate);
        }
        
        return ko.bindingHandlers.template.init.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        return ko.bindingHandlers.template.update.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var utils = {
        createAccessor: function(vm) {
            return function() {
                return {
                    name: itemsControlTemplate,
                    foreach: wpfko.utils.ko.peek(vm).items
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