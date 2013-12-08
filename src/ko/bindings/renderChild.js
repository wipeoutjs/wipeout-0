
var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var child = wpfko.util.ko.peek(valueAccessor());
        if (!(viewModel instanceof wpfko.base.visual) || !(child instanceof wpfko.base.visual))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";
        
        if(child._rootHtmlElement)
            throw "This visual has already been rendered";
                
        var returnVal = ko.bindingHandlers.template.init.call(this, element, wpfko.ko.bindings.renderChild.utils.createValueAccessor(valueAccessor), allBindingsAccessor, valueAccessor(), bindingContext);
        ko.utils.domData.set(element, wpfko.ko.bindings.wpfko.utils.wpfkoKey, child);
        child._rootHtmlElement = element;
        viewModel.renderedChildren.push(child);
        return returnVal;
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