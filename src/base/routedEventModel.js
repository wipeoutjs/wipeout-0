
Class("wipeout.base.routedEventModel", function () {
    
    
    var routedEventModel = wipeout.base.object.extend(function () {
        ///<summary>The base class for models if they wish to invoke routed events on their viewModel</summary>
        
        ///<Summary type="wo.event">The event which will trigger a routed event on the owning view</Summary>
        this.__triggerRoutedEventOnVM = new wipeout.base.event();
        
        ///<Summary type="Array" generic0="wo.routedEventRegistration">A placeholder for event subscriptions on this model</Summary>
        this.__routedEventSubscriptions = [];
    }, "routedEventModel");
        
    routedEventModel.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event which will propogate to any view models where this object is it's model and continue to bubble from there</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to trigger</param>
        ///<param name="eventArgs" type="Any" optional="true">The routed event args</param>
        
        // Used by wo.model to acertain when a routed event should be fired
        this.__triggerRoutedEventOnVM.trigger({routedEvent: routedEvent, eventArgs: eventArgs});
    };        
        
    routedEventModel.prototype.routedEventTriggered = function(routedEvent, eventArgs) {
        ///<summary>Called by the owning view model when a routed event is fired</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to trigger</param>
        ///<param name="eventArgs" type="Any" optional="true">The routed event args</param>
                
        for(var i = 0, ii = this.__routedEventSubscriptions.length; i < ii; i++) {
            if(eventArgs.handled) return;
            if(this.__routedEventSubscriptions[i].routedEvent === routedEvent) {
                this.__routedEventSubscriptions[i].event.trigger(eventArgs);
            }
        }
    };        
    
    routedEventModel.prototype.registerRoutedEvent = function(routedEvent, callback, callbackContext, priority) {
        ///<summary>Register for a routed event</summary>   
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        ///<param name="callbackContext" type="Any" optional="true">The context "this" to use within the callback</param>
        ///<param name="priority" type="Number" optional="true">The event priorty. Event priority does not affect event bubbling order</param>
        ///<returns type="wo.eventRegistration">A dispose function</returns>         

        var rev;
        for(var i = 0, ii = this.__routedEventSubscriptions.length; i < ii; i++) {
            if(this.__routedEventSubscriptions[i].routedEvent === routedEvent) {
                rev = this.__routedEventSubscriptions[i];
                break;
            }
        }

        if(!rev) {
            rev = new wipeout.base.routedEventRegistration(routedEvent);
            this.__routedEventSubscriptions.push(rev);
        }

        return rev.event.register(callback, callbackContext, priority);
    };
    
    routedEventModel.prototype.unRegisterRoutedEvent = function(routedEvent, callback, callbackContext) {  
        ///<summary>Unregister from a routed event. The callback and callback context must be the same as those passed in during registration</summary>  
        ///<param name="callback" type="Function" optional="false">The callback to un-register</param>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to un register from</param>
        ///<param name="callbackContext" type="Any" optional="true">The original context passed into the register function</param>
        ///<returns type="Boolean">Whether the event registration was found or not</returns>         

        for(var i = 0, ii = this.__routedEventSubscriptions.length; i < ii; i++) {
            if(this.__routedEventSubscriptions[i].routedEvent === routedEvent) {
                this.__routedEventSubscriptions[i].event.unRegister(callback, callbackContext);
                return true;
            }
        }  

        return false;
    };
    
    return routedEventModel;
});