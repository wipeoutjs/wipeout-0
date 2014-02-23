
Binding("itemsControl", true, function () {
    
    var itemsControlTemplate = "";
    
    var itemsTemplate = null;
    var staticConstructor = function() {
              
        if(itemsTemplate) return;
        var tmp = "<!-- ko ic-render: $data";
        if(DEBUG) 
            tmp += ", wipeout-type: 'items[' + wpfko.util.ko.peek($index) + ']'";

        tmp += " --><!-- /ko -->";
        
        itemsTemplate = wpfko.base.contentControl.createAnonymousTemplate(tmp);
    };
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the itemsControl binding</summary>
        var ic = wpfko.utils.ko.peek(viewModel);
        if(ic && !(ic instanceof wpfko.base.itemsControl)) throw "This binding can only be used on an itemsControl";
        
        staticConstructor();
        return ko.bindingHandlers.template.init.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the itemsControl binding</summary>
        var ic = wpfko.utils.ko.peek(viewModel);
        if(ic && !(ic instanceof wpfko.base.itemsControl)) throw "This binding can only be used on an itemsControl";
        
        return ko.bindingHandlers.template.update.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var utils = {
        createAccessor: function(vm) {
            ///<summary>Create a value accessor for the template binding</summary>
            vm = wpfko.utils.ko.peek(vm);
            return function() {
                return {
                    name: itemsTemplate,
                    foreach: vm.items,
                    templateEngine: wpfko.template.engine.instance
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
        ///<summary>Initialize the ic-render binding</summary>
        
        return wpfko.bindings.render.init.call(this, element, valueAccessor, allBindingsAccessor, bindingContext.$parent, bindingContext.$parentContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the ic-render binding</summary>
        
        return wpfko.bindings.render.update.call(this, element, valueAccessor, allBindingsAccessor, bindingContext.$parent, bindingContext.$parentContext);
    };
    
    return {
        init: init,
        update: update
    };
});