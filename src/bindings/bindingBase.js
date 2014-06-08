
Class("wipeout.bindings.bindingBase", function () {
        
    return wipeout.base.disposable.extend({
        constructor: function(element) {
            ///<summary>A knockout binding</summary>   
            ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>
            
            this._super();
            
            if(!element)
                throw "ArgumnetNullException";
            
            this.bindingMeta = {};
            this.element = element;
            var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
            if(!bindings)
                bindings = wipeout.utils.domData.set(this.element, wipeout.bindings.bindingBase.dataKey, []);
            
            enumerate(bindings, function(binding) {
                if(binding.bindingMeta.controlsDescendantBindings)
                    throw "There is already a binding on this element which controls children.";
            });
                
            bindings.push(this);
            
            //TODO: if parentNode is null?
            this.parentElement = this.getParentElement();
            this.moved(null, this.parentElement);
            
            //TODO: strategy for this
            //ko.utils.domNodeDisposal.addDisposeCallback(this.element, function() {
                
            //});
        },
        getParentElement: function() {
            // IE sometimes has null for parent element of a comment
            return this.element.parentElement || this.element.parentNode;
        },
        dispose: function() {
            this._super();
            
            this.moved(this.parentElement, null);
            
            var i;
            var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
            while((i = bindings.indexOf(this)) !== -1)
                bindings.splice(i, 1);
            
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
            getBindings: function(node, bindingType) {
                if(bindingType && !(bindingType instanceof Function)) throw "Invalid binding type";
                
                var stop = false;
                var bindings = [];
                enumerate(wipeout.utils.domData.get(node, wipeout.bindings.bindingBase.dataKey), function(binding) {
                    if(!bindingType || binding instanceof bindingType) {
                        bindings.push(binding);
                        stop |= binding.bindingMeta.controlsDescendantBindings;
                    }
                });
                
                if(!stop) {
                    wipeout.utils.ko.virtualElements.enumerateOverChildren(node, function(child) {
                        enumerate(wipeout.bindings.bindingBase.getBindings(child, bindingType), function(binding) {
                            bindings.push(binding);
                        });
                    });
                }
                
                return bindings;                
            },
            dataKey: "wipeout.bindings.bindingBase"
            //TODO: can I put in a generic init function?
        }
    }, "bindingBase");
});