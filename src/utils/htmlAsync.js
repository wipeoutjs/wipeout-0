
Class("wipeout.utils.htmlAsync", function () { 
    
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
            }, wipeout.settings.htmlAsyncTimeout > 0 ? wipeout.settings.htmlAsyncTimeout : 10000);
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
    
    var htmlAsync = function htmlAsync(moveFunctionality) {
        ///<summary>If html elements are to be moved or deleted asynchronusly, wrap the move logic in a call to this function to ensure disposal of unused view models. The moveFunctionality callback will get a callback argumnet which MUST BE CALLED after the move is complete. If not called after a certain length of time (specified by wipeout.settings.htmlAsyncTimeout) the callback will be invoked automatically to allow other moves to take place.</summary> 
        ///<param name="htmlManipulationLogic" type="Function" optional="false">A callback to manipulate html which accepts a callback to be invoked after the move</param>
        
        if(!(moveFunctionality instanceof Function)) throw "Invalid move functionality";
        asyncHandler.add(moveFunctionality);
    };
    
    return htmlAsync;
});