Class("wipeout.utils.bindingDomManipulationWorker", function () { 
    
    var bindingDomManipulationWorker = wipeout.utils.domManipulationWorkerBase.extend(function() {   
        ///<summary>Cleanup wipeout state using a list of registered bindings. This class for legacy browsers which do not support mutation observers</summary>
        
        this._super();
    });
    
    bindingDomManipulationWorker.prototype.finish = function() {
        ///<summary>Cleanup any moved or removed nodes</summary>
        
        enumerate(wipeout.bindings.bindingBase.registered, function(binding) {
            if(binding.checkHasMoved() && this._mutations.indexOf(binding.element) === -1)
                this._mutations.push(binding.element);
        }, this);
        
        this._super();
    };
    
    return bindingDomManipulationWorker;
});