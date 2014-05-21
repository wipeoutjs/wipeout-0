
Class("wipeout.bindings.bindingBase", function () {
    return wipeout.base.disposable.extend({
        constructor: function(element) {
            ///<summary>A knockout binding</summary>   
            ///<param name="element" type="HTMLElement" optional="false">The node containing the data-bind attribute for this binding</param>
            
            this._super();
            
            var _this = this;
            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                _this.dispose();
            });
        }
    }, "bindingBase");
});