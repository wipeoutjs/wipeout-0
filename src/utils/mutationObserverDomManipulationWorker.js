Class("wipeout.utils.mutationObserverDomManipulationWorker", function () { 
    
    var mutationObserverDomManipulationWorker = wipeout.utils.domManipulationWorkerBase.extend(function mutationObserverDomManipulationWorker() {
        ///<summary>Cleanup wipeout state using a global mutation observer</summary>
             
        this._super();   
        var _this = this;
        
        ///<Summary type="MutrationObserver">The mutation observer used</Summary>
        this._observer = new MutationObserver(function(mutations) {
            _this.appendRemovedNodes(mutations);
        });
        
        this._observer.observe(document.body, {childList: true, subtree: true});
    });
    
    mutationObserverDomManipulationWorker.prototype.appendRemovedNodes = function(mutations) {
        ///<summary>Add all removed nodes in the mutations paramater to the list of mutations</summary>
        ///<param name="mutations" type="Array" generic0="Object" optional="false">Mutations from a mutation observer</param>
        
        enumerate(mutations, function(mutation) {
            enumerate(mutation.removedNodes, function(node) {
                if(this._mutations.indexOf(node) === -1)
                    this._mutations.push(node);
            }, this);
        }, this);
    };
    
    mutationObserverDomManipulationWorker.prototype.finish = function() {
        ///<summary>Cleanup any moved or removed nodes</summary>
        
        this._observer.disconnect();
        delete this._observer;
        
        this._super();
    };
    
    return mutationObserverDomManipulationWorker;
});