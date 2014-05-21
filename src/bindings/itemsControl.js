
Binding("itemsControl", true, function () {
    
    var itemsControlTemplate = "";
    
    var itemsTemplate = null;
    var staticConstructor = function() {
              
        if(itemsTemplate) return;
        var tmp = "<!-- ko ic-render: $data";
        if(DEBUG) 
            tmp += ", wipeout-type: 'items[' + wipeout.utils.ko.peek($index) + ']'";

        tmp += " --><!-- /ko -->";
        
        itemsTemplate = wipeout.base.contentControl.createAnonymousTemplate(tmp);
    };
    
    var test = function(viewModel) {
        var ic = wipeout.utils.ko.peek(viewModel);
        if(ic && !(ic instanceof wipeout.base.itemsControl)) throw "This binding can only be used on an itemsControl";
    }
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the itemsControl binding</summary>
        
        test(viewModel);        
        staticConstructor();
        return ko.bindingHandlers.template.init.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the itemsControl binding</summary>
        
        test(viewModel);
        return ko.bindingHandlers.template.update.call(this, element, utils.createAccessor(viewModel), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var utils = {
        createAccessor: function(vm) {
            ///<summary>Create a value accessor for the template binding</summary>
            vm = wipeout.utils.ko.peek(vm);
            return function() {
                return {
                    name: itemsTemplate,
                    foreach: vm.items,
                    templateEngine: wipeout.template.engine.instance
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
        
        return wipeout.bindings.render.init.call(this, element, valueAccessor, allBindingsAccessor, null, bindingContext.$parentContext);
    };
    
    return {
        init: init
    };
});