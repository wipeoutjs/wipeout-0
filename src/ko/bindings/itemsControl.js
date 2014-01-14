
Binding("itemsControl", true, function () {
    var init = function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        if (!(viewModel instanceof wpfko.base.itemsControl))
            throw "This binding can only be used within the context of a wo.itemsControl";

        ko.virtualElements.emptyNode(element);
        if (wpfko.utils.ko.version()[0] < 3) {
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
                if(changes[i].status === wpfko.utils.ko.array.diff.retained) continue;            
                else if(changes[i].status === wpfko.utils.ko.array.diff.deleted) {
                    del.push((function(change) {
                        return function() {
                            var elements;
                            if(change.moved != null) {
                                elements = change.value._rootHtmlElement.__wpfko.allElements();
                                move[change.moved + "." + change.index] = { vm: change.value, elements: elements };
                            } else {
                                ko.virtualElements.emptyNode(change.value._rootHtmlElement);
                                elements = change.value._rootHtmlElement.__wpfko.allElements();
                            }
                            
                            for(var j = 0, jj= elements.length; j< jj; j++) {
                                elements[j].parentNode.removeChild(elements[j]);
                            }
                            
                            if(change.moved == null) {
                                viewModel.itemDeleted(change.value);
                                change.value.dispose();
                            }
                            
                            delPadIndex--;
                        };
                    })(changes[i]));
                } else if(changes[i].status === wpfko.utils.ko.array.diff.added) {
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
                                var container = wpfko.utils.html.createWpfkoComment();
                                if(index === 0) {
                                    ko.virtualElements.prepend(element, container.close);
                                    ko.virtualElements.prepend(element, container.open);   
                                } else {
                                    viewModel.items.peek()[index - 1]._rootHtmlElement.__wpfko.insertAfter(container.close);
                                    viewModel.items.peek()[index - 1]._rootHtmlElement.__wpfko.insertAfter(container.open);
                                }     
                                
                                //TODO: this is invalid. Does not update when re-ordered or item is deleted
                                var acc = function() {
                                    return change.value;
                                };
                                
                                wpfko.bindings.render.init(container.open, acc, acc, viewModel, bindingContext);
                                wpfko.bindings.render.update(container.open, acc, acc, viewModel, bindingContext);
                                
                                viewModel.itemRendered(change.value);
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
        
            if(DEBUG) {
                utils.addComments(viewModel.items());
            }
        }
    };
    
    var utils = {
        subscribeV2: function(element, viewModel, bindingContext) {            
            ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl<summary>            
            
            var items = wpfko.utils.obj.copyArray(viewModel.items.peek());
            var handler = utils.itemsChanged(element, viewModel, bindingContext);
                        
            viewModel.items.subscribe(function() {            
                try {
                    var changes = ko.utils.compareArrays(items, arguments[0] || []);
                    handler(changes);
                } finally {
                    items = wpfko.utils.obj.copyArray(viewModel.items.peek());
                }
            });
        },
        subscribeV3: function(element, viewModel, bindingContext) {            
            viewModel.items.subscribe(utils.itemsChanged(element, viewModel, bindingContext), window, "arrayChange");
        },
        itemsChanged: itemsChanged,
        addComments: function(values) {
            enumerate(values, function(value, i) {
                wpfko.bindings["wipeout-comment"].comment(value._rootHtmlElement, "itemsControl item: " + i.toString());
            });
        }
    };
    
    return {
        init: init,
        utils: utils
    };
});