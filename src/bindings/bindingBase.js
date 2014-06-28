
Class("wipeout.bindings.bindingBase", function () {
        
    var bindingBase = wipeout.base.disposable.extend(function(element) {
        ///<summary>A knockout binding</summary>   
        ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>

        this._super();

        if(!element)
            throw "ArgumnetNullException";

        this.bindingId = wipeout.bindings.bindingBase.uniqueId();
        this.bindingMeta = {};
        this.element = element;
        if(!this.getParentElement())
            throw "Cannot apply a \"wipeout.bindings.bindingBase\" binding on an element without a parent node.";
        
        var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
        if(!bindings)
            bindings = wipeout.utils.domData.set(this.element, wipeout.bindings.bindingBase.dataKey, []);

        enumerate(bindings, function(binding) {
            if(binding.bindingMeta.controlsDescendantBindings)
                throw "There is already a binding on this element which controls children.";
        });

        bindings.push(this);

        wipeout.bindings.bindingBase.registered[this.bindingId] = this;

        this.parentElement = this.getParentElement();
        this.moved(null, this.parentElement);
    }, "bindingBase");
    
    bindingBase.getParentElement = function(element) {
        ///<summary>Get the parent element of a node. (browser safe)</summary>
        ///<param name="element" type="HTMLElement" optional="false">The node to get the parent of</param>
        ///<returns type="HTMLElement">The node to get the parent of</returns>
        
        // IE sometimes has null for parent element of a comment
        return element.parentElement || element.parentNode;
    };
    
    bindingBase.prototype.getParentElement = function() {
        ///<summary>Get the parent element of a node this.element. (browser safe)</summary>
        ///<returns type="HTMLElement">The node to get the parent of</returns>
        
        // IE sometimes has null for parent element of a comment
        return bindingBase.getParentElement(this.element);
    };
    
    bindingBase.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary>
        
        this._super();

        this.moved(this.parentElement, null);

        var i;
        var bindings = wipeout.utils.domData.get(this.element, wipeout.bindings.bindingBase.dataKey);
        while((i = bindings.indexOf(this)) !== -1)
            bindings.splice(i, 1);

        delete this.element;
        delete this.parentElement;
        delete wipeout.bindings.bindingBase.registered[this.bindingId];
    };
    
    bindingBase.prototype.checkHasMoved = function() {
        ///<summary>Check whether the element that this binding is on has moved</summary>
        ///<returns type="Boolean">The node to get the parent of</returns>
        
        return this.getParentElement() !== this.parentElement;
    };
    
    bindingBase.prototype.hasMoved = function() {
        ///<summary>Perform actions if the element that this binding is on has moved</summary>
        
        if(this.checkHasMoved()) {
            this.moved(this.parentElement, this.getParentElement());
            this.parentElement = this.getParentElement();
        }
    };
    
    // virtual
    bindingBase.prototype.moved = function(oldParentElement, newParentElement) {
        ///<summary>Perform actions after the element that this binding is on has moved</summary>
        ///<param name="oldParentElement" type="HTMLElement" optional="false">The old parent element</param>
        ///<param name="newParentElement" type="HTMLElement" optional="false">The new parent element</param>
    };
    
    // a placeholder for all bindings
    bindingBase.registered = {};
    
    bindingBase.uniqueId = (function () {
        var i = Math.floor(Math.random() * 1000000000); 
        return function () {
            ///<summary>Returns a unique Id for a view</summary>    
            ///<returns type="String"></returns>

            return "binding-" + (++i);
        };
    })();
    
    bindingBase.getBindings = function(node, bindingType) {
        ///<summary>Get all bindings on a node and it's decendant elements. Does not return bindings of element which control their own decendant bindings</summary>
        ///<param name="node" type="HTMLElement" optional="false">The element to get bindings from</param>
        ///<returns type="HTMLElement">The node to get the parent of</returns>
        
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
            wipeout.utils.ko.enumerateOverChildren(node, function(child) {
                enumerate(wipeout.bindings.bindingBase.getBindings(child, bindingType), function(binding) {
                    bindings.push(binding);
                });
            });
        }

        return bindings;                
    };
    
    // the key for bindings
    bindingBase.dataKey = "wipeout.bindings.bindingBase";
    
    //TODO: can I put in a generic init function?
    
    return bindingBase;
});