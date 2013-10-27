var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var items = viewModel.items();
        for(var i = items.length - 1; i >= 0; i--) {
            
            var open = wpfko.util.html.createElement("<!-- ko -->");
            ko.virtualElements.prepend(element, wpfko.util.html.createElement("<!-- /ko -->"));
            ko.virtualElements.prepend(element, open);            
            
            var acc = (function(i) {
                return function() {
                    return items[i];
                };
            })(i);
            
            wpfko.ko.bindings.renderChild.init(open, acc, acc, viewModel, bindingContext);
            wpfko.ko.bindings.renderChild.update(open, acc, acc, viewModel, bindingContext);
        }
    }; 
    
    wpfko.ko.bindings.itemsControl = {
        init: init
    };
            
    ko.bindingHandlers.itemsControl = {};
    ko.virtualElements.allowedBindings.itemsControl = true;
    for(var i in wpfko.ko.bindings.itemsControl) {
        if(i !== "utils") {
            ko.bindingHandlers.itemsControl[i] = wpfko.ko.bindings.itemsControl[i];
        }
    };
})();