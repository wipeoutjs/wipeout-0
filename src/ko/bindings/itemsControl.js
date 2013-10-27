var wpfko = wpfko || {};
wpfko.bindings = wpfko.bindings || {};

(function () {
    
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        debugger;
        var items = viewModel.items();
        for(var i = items.length - 1; i >= 0; i--) {
            
            var open = wpfko.util.html.createElement("<!-- ko renderChild: items()[" + i + "] -->");
            ko.virtualElements.prepend(element, wpfko.util.html.createElement("<!-- /ko -->"));
            ko.virtualElements.prepend(element, open);            
            
            var acc = (function(i) {
                return function() {
                    return items[i];
                };
            })(i);
            
            ko.bindingHandlers.renderChild.init(open, acc, acc, viewModel, bindingContext);
            ko.bindingHandlers.renderChild.update(open, acc, acc, viewModel, bindingContext);
        }
    }
    
    var update = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        //TODO: dispose of previous
        
        if(!viewModel || !viewModel.items) {
            return;
        }
                   
        //TODO: status types, assuming there are only 2 right now
        if(ko.isObservable(viewModel.items)) {            
            if(wpfko.util.ko.version()[0] >= 3) {
                viewModel.items.subscribe(function(changes) {
                    
                    var added = [];
                    var moved = [];
                    
                    for(var i = 0; i < changes.length; i++) {
                        if(changes.moved || changes.moved === 0) {
                            moved.push(changes.splice(i, 1));
                            i--;
                        }
                    }
                    
                    for(var i = 0; i < changes.length; i++) {
                        if(changes.status === "added") {
                            added.push(changes.splice(i, 1));
                            i--;
                        }
                    }
                    
                    // anything not spliced out is deleted
                    var deleted = changes;
                    for(var i = 0; i < deleted.length; i++) {
                        for(var j = 0, jj = element.childNodes.length; j < jj; j++) {
                            if(ko.utils.domData.get(element.childNodes[i], "itemSourceItem") === deleted[i].value) {
                                ko.utils.domData.get(element.childNodes[i], "itemSourceItem", undefined);
                                element.removeChild(element.childNodes[i]);
                                break;
                            }
                        }
                    }
                    
                    for(var i = 0; i < added.length; i++) {
                        for(var j = 0, jj = element.childNodes.length; j < jj; j++) {
                        }
                    }
                 
                }, null, "arrayChange");
            }
        }
        
        
        
        var onChange = function(oldVal, newVal) {
        };
        
        viewModel.items.valueHasMutated();
    };   
    
    wpfko.bindings.itemsControl = {
        init: init,
        utils: {
            //createValueAccessor: createValueAccessor
        }
    };
            
    ko.bindingHandlers.itemsControl = {};
    ko.virtualElements.allowedBindings.itemsControl = true;
    for(var i in wpfko.bindings.itemsControl) {
        if(i !== "utils") {
            ko.bindingHandlers.itemsControl[i] = wpfko.bindings.itemsControl[i];
        }
    };
})();