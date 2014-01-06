
Binding("itemsControl", true, function () {
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (!(viewModel instanceof wpfko.base.itemsControl))
            throw "This binding can only be used within the context of a wo.itemsControl";

        ko.virtualElements.emptyNode(element);
        if (wpfko.util.ko.version()[0] < 3) {
            utils.subscribeV2(element, viewModel, bindingContext);
        } else {
            utils.subscribeV3(element, viewModel, bindingContext);
        }

        itemsChanged(element, viewModel, bindingContext)(ko.utils.compareArrays([], viewModel.items.peek()));
    };
    
    var itemsChanged = function(element, viewModel, bindingContext) {
        return function(changes) {                
            var del = [], add = [], move = {}, delPadIndex = 0;
            for(var i = 0, ii = changes.length; i < ii; i++) {
                if(changes[i].status === wpfko.util.ko.array.diff.retained) continue;            
                else if(changes[i].status === wpfko.util.ko.array.diff.deleted) {
                    del.push((function(change) {
                        return function() {
                            if(change.moved != null) {
                                move[change.moved + "." + change.index] = { vm: change.value, elements: change.value._rootHtmlElement.__wpfko.allElements() };
                            } else {
                                ko.virtualElements.emptyNode(change.value._rootHtmlElement);
                            }
                            
                            // calculate a second time as value may have been changed by ko.virtualElements.emptyNode()
                            var elements = change.value._rootHtmlElement.__wpfko.allElements();
                            for(var j = 0, jj= elements.length; j< jj; j++) {
                                elements[j].parentNode.removeChild(elements[j]);
                            }
                            
                            if(change.moved == null)
                                change.value.dispose();
                            
                            delPadIndex--;
                        };
                    })(changes[i]));
                } else if(changes[i].status === wpfko.util.ko.array.diff.added) {
                    add.push((function(change) {
                        return function() {
                            var index= viewModel.items.indexOf(change.value);
                            if(change.moved != null) {  
                                var item = move[change.index + "." + change.moved];
                                if(index === 0) {
                                    for(var j = item.elements.length - 1; j >= 0; j--) {
                                        ko.virtualElements.prepend(element, item.elements[j]);
                                    }                                        
                                } else {
                                    var before = viewModel.items.peek()[index -1];
                                    for(var j = item.elements.length - 1; j >= 0; j--) {
                                        before._rootHtmlElement.__wpfko.insertAfter(item.elements[j]);
                                    }
                                }
                            } else {
                                var container = wpfko.util.html.createWpfkoComment();
                                if(index === 0) {
                                    ko.virtualElements.prepend(element, container.close);
                                    ko.virtualElements.prepend(element, container.open);   
                                } else {
                                    viewModel.items.peek()[index - 1]._rootHtmlElement.__wpfko.insertAfter(container.close);
                                    viewModel.items.peek()[index - 1]._rootHtmlElement.__wpfko.insertAfter(container.open);
                                }           
                                
                                var acc = (function(i) {
                                    return function() {
                                        return change.value;
                                    };
                                })(i);
                                
                                wpfko.bindings.render.init(container.open, acc, acc, viewModel, bindingContext);
                                wpfko.bindings.render.update(container.open, acc, acc, viewModel, bindingContext);
                            }
                        };
                    })(changes[i]));
                } else {
                    throw "Unsupported status";
                }
            }
            
            for(i = 0, ii = del.length; i < ii; i++) {
                del[i].call(this);
            }
            
            for(i = 0, ii = add.length; i < ii; i++) {
                add[i].call(this);
            }
        }
    };
    
    var utils = {
        subscribeV2: function(element, viewModel, bindingContext) {            
            ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl<summary>            
            
            var items = wpfko.util.obj.copyArray(viewModel.items.peek());
            var handler = utils.itemsChanged(element, viewModel, bindingContext);
                        
            viewModel.items.subscribe(function() {            
                try {
                    var changes = ko.utils.compareArrays(items, arguments[0] || []);
                    handler(changes);
                } finally {
                    items = wpfko.util.obj.copyArray(viewModel.items.peek());
                }
            });
        },
        subscribeV3: function(element, viewModel, bindingContext) {            
            viewModel.items.subscribe(utils.itemsChanged(element, viewModel, bindingContext), window, "arrayChange");
        },
        itemsChanged: itemsChanged
    };
    
    return {
        init: init,
        utils: utils
    };
});