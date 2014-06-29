Class("wipeout.utils.domManipulationWorkerBase", function () { 
    
    var domManipulationWorkerBase = wipeout.base.object.extend(function() {  
        ///<summary>Monitor changes to html globaly and cleanup wipeout state on finish(...)</summary>
        
        this._super();
        
        this._mutations = [];
    });
    
    domManipulationWorkerBase.prototype.finish = function() {  
        ///<summary>Cleanup any moved or removed nodes</summary>
        
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
        
        this._mutations.length = 0;
    };
    
    return domManipulationWorkerBase;
});