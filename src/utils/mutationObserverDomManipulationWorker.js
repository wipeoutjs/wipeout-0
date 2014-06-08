Class("wipeout.utils.mutationObserverDomManipulationWorker", function () { 
    
    var mutationObserverDomManipulationWorker = wipeout.utils.domManipulationWorkerBase.extend(function() {
             
        this._super();   
        var _this = this;
        this._observer = new MutationObserver(function(mutations) {
            _this.appendRemovedNodes(mutations);
        });
        
        this._observer.observe(document.body, {childList: true, subtree: true});
    });
    
    mutationObserverDomManipulationWorker.prototype.appendRemovedNodes = function(mutations) {
        enumerate(mutations, function(mutation) {
            enumerate(mutation.removedNodes, function(node) {
                if(this._mutations.indexOf(node) === -1)
                    this._mutations.push(node);
            }, this);
        }, this);
    };
    
    mutationObserverDomManipulationWorker.prototype.finish = function() {
        this._observer.disconnect();
        
        this._super();
    };
    
    return mutationObserverDomManipulationWorker;
});