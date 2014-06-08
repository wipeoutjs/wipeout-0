Class("wipeout.utils.bindingDomManipulationWorker", function () { 
    
    var bindingDomManipulationWorker = wipeout.utils.domManipulationWorkerBase.extend(function() {                
        this._super();
    });
    
    bindingDomManipulationWorker.prototype.finish = function() {
        enumerate(wipeout.bindings.bindingBase.registered, function(binding) {
            if(binding.checkHasMoved() && this._mutations.indexOf(binding.element) === -1)
                this._mutations.push(binding.element);
        }, this);
        
        this._super();
    };
    
    return bindingDomManipulationWorker;
});