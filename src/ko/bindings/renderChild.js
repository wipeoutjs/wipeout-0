
var wpfko = wpfko || {};
    wpfko.bindings = wpfko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.init.call(this, element, wpfko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
    };
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.update.call(this, element, wpfko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
    };    
    
    var createValueAccessor = function(oldValueAccessor) {
        return function () {
            var child = oldValueAccessor();
            var _child = ko.utils.unwrapObservable(child);
            return {
                name: _child ? _child.xmlTemplateId : "",
                data: child || {},
                afterRender: _child ? wpfko.base.visual.prototype._afterRendered : undefined
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