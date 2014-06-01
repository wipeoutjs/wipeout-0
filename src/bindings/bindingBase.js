
Class("wipeout.bindings.bindingBase", function () {
    return wipeout.base.disposable.extend({
        constructor: function(element) {
            ///<summary>A knockout binding</summary>   
            ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>
            
            this._super();
            
            if(!element)
                throw "ArgumnetNullException";
            
            this.element = element;
            
            var _this = this;
            this.obs = new MutationObserver(function(mutations) {
                for(var i = 0, ii = mutations.length; i < ii; i++) {
                    for(var j = 0, jj = mutations[i].removedNodes ? mutations[i].removedNodes.length : 0; j < jj; j++) {
                        if(mutations[i].removedNodes[j] === element) {
                            if(!document.body.contains(element)) {
                                _this.dispose();
                            } else {
                                _this.obs.disconnect();
                                _this.moved(_this.parentElement, getParentElement());
                                _this.parentElement = getParentElement();
                                _this.obs.observe(_this.parentElement, {childList: true});
                            }
                            
                            return;
                        }
                    }
                }
            });
            
            function getParentElement() {
                return _this.element.parentElement || _this.element.parentNode;
            }
            
            //TODO: if parentNode is null?
            if(getParentElement()) {
                this.parentElement = getParentElement();
                this.obs.observe(this.parentElement, {childList: true});
            }
        },
        dispose: function() {
            this._super();
            delete this.element;
            delete this.parentElement;
            this.obs.disconnect();
        },
        moved: function(oldParentElement, newParentElement) {
        }
    }, "bindingBase");
});