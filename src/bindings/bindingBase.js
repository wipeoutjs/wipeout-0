
Class("wipeout.bindings.bindingBase", function () {
    
    var sc = false;
    function staticContructor() {
        if(sc) return;
        sc = true;
        
        new MutationObserver(function(mutations) {
            enumerate(mutations || [], function(mutation) {
                enumerate(mutation.removedNodes || [], function(node) {
                    var bindings;
                    if(!document.body.contains(node)) {
                        if(bindings = wipeout.utils.domData.get(node, wipeout.bindings.bindingBase.dataKey)) {
                            wipeout.utils.domData.clear(node, wipeout.bindings.bindingBase.dataKey);
                            enumerate(bindings, function(binding) {
                                binding.dispose();
                            });
                        } else {
                            wipeout.bindings.bindingBase.disposeOfAncestors(node);
                        }
                    } else if(bindings = wipeout.utils.domData.get(node, wipeout.bindings.bindingBase.dataKey)) {
                        enumerate(bindings, function(binding) {
                            binding.hasMoved();
                        });
                    }
                });
            });
        }).observe(document.body, {childList: true, subtree: true});
    }
    
    return wipeout.base.disposable.extend({
        constructor: function(element) {
            ///<summary>A knockout binding</summary>   
            ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>
            
            staticContructor();
            
            this._super();
            
            if(!element)
                throw "ArgumnetNullException";
            
            this.element = element;
            var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
            if(!bindings)
                bindings = wipeout.utils.domData.set(this.element, wipeout.bindings.bindingBase.dataKey, []);
                
            bindings.push(this);
            
            //TODO: if parentNode is null?
            this.parentElement = this.getParentElement();
        },
        getParentElement: function() {
            // IE sometimes has null for parent element of a comment
            return this.element.parentElement || this.element.parentNode;
        },
        dispose: function() {
            this._super();
            
            // incase binding has been disposed of already
            if(this.element)
                wipeout.bindings.bindingBase.disposeOfAncestors(this.element);
            
            delete this.element;
            delete this.parentElement;
        },
        hasMoved: function() {
            if(this.getParentElement() !== this.parentElement) {
                this.moved(this.parentElement, this.getParentElement());
                this.parentElement = this.getParentElement();
            }
        },
        moved: function(oldParentElement, newParentElement) {
        },
        statics: {
            dataKey: "wipeout.bindings.bindingBase",
            disposeOfAncestors: function(element) {
                var children = [], child;
                if(child = ko.virtualElements.firstChild(element))
                    wipeout.bindings.bindingBase.disposeOrRecurse(child);
                
                while (child && (child = ko.virtualElements.nextSibling(child)))
                    wipeout.bindings.bindingBase.disposeOrRecurse(child);
                    
            },
            disposeOrRecurse: function(element) {
                var bindings = wipeout.utils.domData.get(element, wipeout.bindings.bindingBase.dataKey);
                if(bindings) {
                    enumerate(bindings, function(binding) {
                        binding.dispose();
                    });
                    
                    wipeout.utils.domData.clear(element, wipeout.bindings.bindingBase.dataKey);
                } else {
                    wipeout.bindings.bindingBase.disposeOfAncestors(element);
                }
            }
        }
    }, "bindingBase");
});