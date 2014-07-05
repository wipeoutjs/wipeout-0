
Class("wipeout.base.routedEventModel", function () {
    
    
    var routedEventModel = wipeout.base.object.extend(function () {
        ///<summary>The base class for models if they wish to invoke routed events on their viewModel</summary>
        
        ///<Summary type="wo.event">The even twhich will trigger a routed event on the owning view</Summary>
        this.__triggerRoutedEventOnVM = new wipeout.base.event();
    }, "routedEventModel");
        
    routedEventModel.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event which will propogate to any view models where this object is it's model and continue to bubble from there</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event to trigger</param>
        ///<param name="eventArgs" type="Any" optional="true">The routed event args</param>
        
        // Used by wo.model to acertain when a routed event should be fired
        this.__triggerRoutedEventOnVM.trigger({routedEvent: routedEvent, eventArgs: eventArgs});
    };
    
    return routedEventModel;
});