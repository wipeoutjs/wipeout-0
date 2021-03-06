
Class("wipeout.base.routedEvent", function () {
    
    var routedEvent = function routedEvent() {
        ///<summary>A routed event is triggerd on a visual and travels up to ancestor visuals all the way to the root of the application</summary>
        
        // allow for non use of the new key word
        if(!(this instanceof routedEvent))
           return new routedEvent();
    };

    routedEvent.prototype.trigger = function(triggerOnVisual, eventArgs) {
        ///<summary>Trigger a routed event on a visual</summary>
        ///<param name="triggerOnVisual" type="wo.visual" optional="false">The visual where the routed event starts</param>
        ///<param name="eventArgs" type="Any" optional="true">The event args to bubble up with the routed event</param>
        
        triggerOnVisual.triggerRoutedEvent(this, new wipeout.base.routedEventArgs(eventArgs, triggerOnVisual));
    };
    
    routedEvent.prototype.unRegister = function (callback, triggerOnVisual, context /* optional */) {
        ///<summary>Unregister a routed event on a visual</summary>
        ///<param name="callback" type="Function" optional="false">The callback to un-register</param>
        ///<param name="triggerOnVisual" type="wo.visual" optional="false">The visual passed into the register function</param>
        ///<param name="context" type="Any" optional="true">The original context passed into the register function</param>
        ///<returns type="Boolean">Whether the event registration was found or not</returns>         
        return triggerOnVisual.unRegisterRoutedEvent(this, callback, context);
    };
    
    routedEvent.prototype.register = function(callback, triggerOnVisual, context /* optional */) {
        ///<summary>Register a routed event on a visual</summary>
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="triggerOnVisual" type="wo.visual" optional="false">The visual registered to the routed event</param>
        ///<param name="context" type="Any" optional="true">The context "this" to use within the callback</param>
        ///<returns type="wo.eventRegistration">A dispose function</returns>         
        
        return triggerOnVisual.registerRoutedEvent(this, callback, context);
    };
    
    return routedEvent;
});

Class("wipeout.base.routedEventArgs", function () {
    
    var routedEventArgs = function routedEventArgs(eventArgs, originator) { 
        ///<summary>Arguments passed to routed event handlers. Set handled to true to stop routed event propogation</summary>
        ///<param name="eventArgs" type="Any" optional="true">The inner event args</param>
        ///<param name="originator" type="Any" optional="false">A pointer to event raise object</param>
        
        ///<Summary type="Boolean">Signals whether the routed event has been handled and should not propagate any further</Summary>
        this.handled = false;
        
        ///<Summary type="Any">The original event args used when the routedEvent has been triggered</Summary>
        this.data = eventArgs;
        
        ///<Summary type="Any">The object which triggered the event</Summary>
        this.originator = originator;
    };
    
    return routedEventArgs;
});
    

Class("wipeout.base.routedEventRegistration", function () {
    
    var routedEventRegistration = function routedEventRegistration(routedEvent) {  
        ///<summary>Holds routed event registration details</summary>
        ///<param name="routedEvent" type="wo.routedEvent" optional="false">The routed event</param>
        
        ///<Summary type="wo.routedEvent">The routed event</Summary>
        this.routedEvent = routedEvent;
        
        ///<Summary type="wo.event">An inner event to handler triggering callbacks</Summary>
        this.event = new wipeout.base.event();        
    };
    
    routedEventRegistration.prototype.dispose = function() {
        ///<summary>Dispose of the callbacks associated with this registration</summary>
        this.event.dispose();
    };
    
    return routedEventRegistration;
});