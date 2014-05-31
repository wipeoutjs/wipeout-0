
Class("wipeout.bindings.bindingBase", function () {
    return wipeout.base.disposable.extend({
        constructor: function(element) {
            ///<summary>A knockout binding</summary>   
            ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>
            
            this._super();
            
            if(!element)
                throw "ArgumnetNullException";
            
            this.element = element;
            this.parentElement = element.parentElement;
            
            var _this = this;
            this.obs = new MutationObserver(function(mutations) {
                for(var i = 0, ii = mutations.length; i < ii; i++) {
                    for(var j = 0, jj = mutations[i].removedNodes ? mutations[i].removedNodes.length : 0; j < jj; j++) {
                        if(mutations[i].removedNodes[j] === element) {
                            if(!document.body.contains(element)) {
                                _this.dispose();
                                return;
                            } else {
                                _this.obs.disconnect();
                                _this.moved(_this.parentElement, element.parentElement);
                                _this.parentElement = element.parentElement;
                                _this.obs.observe(_this.parentElement, {childList: true});
                            }
                        }
                    }
                }
            });
            
            this.obs.observe(this.parentElement, {childList: true});
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