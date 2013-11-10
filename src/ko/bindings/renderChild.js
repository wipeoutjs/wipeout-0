
var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.init.call(this, element, wpfko.ko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.update.call(this, element, wpfko.ko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
    };    
    
    var createValueAccessor = function(oldValueAccessor) {
        return function () {
            var child = oldValueAccessor();
            var _child = wpfko.util.ko.peek(child);
            return {
                name: _child ? _child.templateId : "",
                data: child || {},
                afterRender: _child ? wpfko.base.visual._afterRendered : undefined
            }
        };
    };
    
    wpfko.ko.bindings.renderChild = {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.renderChild = {};
    ko.virtualElements.allowedBindings.renderChild = false; //TODO: this
    for(var i in wpfko.ko.bindings.renderChild) {
        if(i !== "utils") {
            ko.bindingHandlers.renderChild[i] = wpfko.ko.bindings.renderChild[i];
        }
    };
})();