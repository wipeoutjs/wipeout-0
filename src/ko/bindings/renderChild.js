
var wpfko = wpfko || {};
    wpfko.bindings = wpfko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.init.call(this, element, wpfko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.update.call(this, element, wpfko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };    
    
    var createValueAccessor = function(oldValueAccessor) {
        return function () {
            var child = oldValueAccessor();
            return {
                name: ko.utils.unwrapObservable(oldValueAccessor())._htmlTemplateId,
                data: child,
                afterRender: wpfko.base.visual.prototype._afterRendered
            }
        };
    };
    
    wpfko.bindings.renderChild = {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.renderChild = {};
    ko.virtualElements.allowedBindings.renderChild = true;
    for(var i in wpfko.bindings.renderChild) {
        if(i !== "utils") {
            ko.bindingHandlers.renderChild[i] = wpfko.bindings.renderChild[i];
        }
    };
})();