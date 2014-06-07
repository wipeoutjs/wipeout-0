Class("wipeout.utils.domManipulationWorker", function () { 
    
    function domManipulationWorker() {
        
        this._mutations = [];
        
        var _this = this;
        this._observer = new MutationObserver(function(mutations) {
            enumerate(mutations, function(mutation) {
                enumerate(mutation.removedNodes, function(node) {
                    if(_this._mutations.indexOf(node) === -1)
                        _this._mutations.push(node);
                });
            });
        });
        
        this._observer.observe(document.body, {childList: true, subtree: true});
    }
    
    domManipulationWorker.prototype.finish = function() {
        this._observer.disconnect();
        
        // dispose of removed nodes
        for(var i = 0; i < this._mutations.length; i++) {
            if(!document.body.contains(this._mutations[i])) {
                wipeout.utils.html.cleanNode(this._mutations.splice(i, 1)[0]);
                i--;
            }
        }
        
        enumerate(this._mutations, function(mutation) {
            enumerate(wipeout.bindings.bindingBase.getBindings(mutation, wipeout.bindings.render), function(binding) {
                binding.hasMoved();
            });
        });
    };
    
    return domManipulationWorker;
});