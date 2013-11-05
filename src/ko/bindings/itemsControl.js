var wpfko = wpfko || {};
wpfko.ko = wpfko.ko || {};
wpfko.ko.bindings = wpfko.ko.bindings || {};

(function () {
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ko.virtualElements.emptyNode(element);
        var items = viewModel.items();
        for(var i = items.length - 1; i >= 0; i--) {
            
            var open = wpfko.util.html.createElement("<!-- ko -->");
            var close = wpfko.util.html.createElement("<!-- /ko -->");
            ko.virtualElements.prepend(element, close);
            ko.virtualElements.prepend(element, open);            
            
            var acc = (function(i) {
                return function() {
                    return items[i];
                };
            })(i);
            
            wpfko.ko.bindings.renderChild.init(open, acc, acc, viewModel, bindingContext);
            wpfko.ko.bindings.renderChild.update(open, acc, acc, viewModel, bindingContext);
                    
            open.parentElement.removeChild(open);
            close.parentElement.removeChild(close);
        }
    }; 
    
    wpfko.ko.bindings.itemsControl = {
        update: update
    };
            
    ko.bindingHandlers.itemsControl = {};
    ko.virtualElements.allowedBindings.itemsControl = true; //TODO: this will break it
    for(var i in wpfko.ko.bindings.itemsControl) {
        if(i !== "utils") {
            ko.bindingHandlers.itemsControl[i] = wpfko.ko.bindings.itemsControl[i];
        }
    };
})();