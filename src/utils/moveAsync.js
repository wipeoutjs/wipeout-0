
Class("wipeout.utils.moveAsync", function () { 
    
    var asyncHandler = (function() {
        
        var actions = [];
        
        var mutations = [];
        var worker = null;
        function run() {
            if(worker || !actions.length) return;
            
            worker = window.MutationObserver ? 
                new wipeout.utils.mutationObserverDomManipulationWorker() :
                new wipeout.utils.bindingDomManipulationWorker();
            
            var hf = function() {
                // ensure it can only be called once
                if(hf === null)
                    return;
                
                hf = null;         
                setTimeout(function() {
                    handleFinished();
                }, 1);
            }
            
            actions.splice(0, 1)[0](hf);
            
            // set timeout to cleanup automatically after 10 seconds
            setTimeout(function() {
                if(!hf) return;
                    
                if(!wipeout.settings.suppressWarnings)
                    console.error("Cleanup callback for async move method was not called. Cleanup has been automatically called, which may cause undesired behaviour.");
                
                hf();
            }, wipeout.settings.moveAsyncTimeout > 0 ? wipeout.settings.moveAsyncTimeout : 10000);
        }
        
        function handleFinished() { 
            worker.finish();
            worker = null;
            run();
        }
        
        return {
            add: function(action) {
                actions.push(action);
                run();
            }
        };
    }());
    
    return function(moveFunctionality) {
        if(!(moveFunctionality instanceof Function)) throw "Invalid move functionality";
        asyncHandler.add(moveFunctionality);
    };
});