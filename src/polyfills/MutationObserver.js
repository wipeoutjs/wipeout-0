
Polyfill("wipeout.polyfills.MutationObserver", "MutationObserver", function () {
    
    // test if DOMNodeRemovedFromDocument is supported
    (function() {
        mutationObserver.DOMNodeRemovedFromDocument = false;
        var node = document.createElement("div");
        
        if(!node.addEventListener) return;
        
        node.innerHTML = "<div></div>"
        document.body.appendChild(node);
        node.addEventListener("DOMSubtreeModified", function() { 
            mutationObserver.DOMNodeRemovedFromDocument = true;
        });
        node.innerHTML = "";
        document.body.removeChild(node);
    }());
    
    function mutationObserver(callback) {        
        this.elements = [];
        this.callback = callback;
    };
    
    mutationObserver.prototype.disconnect = function() {
        ///<summary>Stop observing all elements</summary>
        
        enumerate(this.elements, function(element) {
            var i;
            if(element.__woMutationObserver && (i = element.__woMutationObserver.callbacks.indexOf(this.callback)) !== -1) {
                element.__woMutationObserver.callbacks.splice(i, 1);
            }
        }, this);
    };
    
    mutationObserver.prototype.observe = function(element, settings) {
        ///<summary>Observe changes on an alement</summary>   
        ///<param name="element" type="HTMLElement" optional="false">The element to observe</param>
        ///<param name="settings" type="Object" optional="false">How to observe. Note, only the "childList" pattern is supported</param>
        
        mutationObserver.testSettings(settings);
        
        this.elements.push(element);
        if(!element.__woMutationObserver)
            element.__woMutationObserver = mutationObserver.DOMNodeRemovedFromDocument ?
                new wipeout.polyfils.mutationEventWorker(element) :
                new wipeout.polyfils.knockoutWorker(element);
        
        element.__woMutationObserver.callbacks.push(this.callback);
    };
    
    mutationObserver.testSettings = function(settings) {   
        if(wipeout.settings.suppressWarnings) return;
        
        if(!settings)
            console.error("You must specify mutation observer settings");
        
        var s = []
        enumerate(settings, function(item, i) {
            s.push(i);
        })
        
        if(s.length !== 1 || s[0] !== "childList")
            console.error("Only settings of type {childList:tue} are supported. For the full MutationObserver functionality define a polyfill library before wipeout.");
    };
    
    return mutationObserver;
});