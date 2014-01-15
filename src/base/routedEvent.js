
Class("wpfko.base.routedEvent", function () {
    
    var routedEvent = function() {
        ///<summary>A routed event is triggerd on a visual and travels up to ancestor visuals all the way to the root of the application</summary>
    };

    routedEvent.prototype.trigger = function(triggerOnVisual, eventArgs) {
        ///<summary>Trigger a routed event on a visual</summary>
        triggerOnVisual.triggerRoutedEvent(this, new wpfko.base.routedEventArgs(eventArgs, triggerOnVisual));
    };
    
    routedEvent.prototype.unRegister = function (callback, triggerOnVisual, context /* optional */) {
        ///<summary>Unregister a routed event on a visual</summary>
        triggerOnVisual.unRegisterRoutedEvent(this, callback, context);
    }
    
    routedEvent.prototype.register = function(callback, triggerOnVisual, context /* optional */) {
        ///<summary>Register a routed event on a visual</summary>
        triggerOnVisual.registerRoutedEvent(this, callback, context);
    };
    
    return routedEvent;
});

Class("wpfko.base.routedEventArgs", function () {
    
    var routedEventArgs = function(eventArgs, originator) { 
        ///<summary>Arguments passed to routed event handlers. Set handled to true to stop routed event propogation</summary>
        
        //Signals whether the routed event has been handled and should not propagate any further
        this.handled = false;
        
        //The original event args used when the routedEvent has been triggered
        this.data = eventArgs;
        
        //The object which triggered the event
        this.originator = originator;
    };
    
    return routedEventArgs;
});
    

Class("wpfko.base.routedEventRegistration", function () {
    //TODO: private
    var routedEventRegistration = function(routedEvent) {  
        ///<summary>Holds routed event registration details</summary>
        
        // The routed event
        this.routedEvent = routedEvent;
        
        //An inner event to handler triggering callbacks
        this.event = new wpfko.base.event();
    };
    
    routedEventRegistration.prototype.dispose = function() {
        this.event.dispose();
    };
    
    return routedEventRegistration;
});