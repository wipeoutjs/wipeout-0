
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var routedEvent = function() {
        ///<summary>A routed event is triggerd on a visual and travels up to ancestor visuals all the way to the root of the application</summary>
    };

    routedEvent.prototype.trigger = function(triggerOnVisual, eventArgs) {
        ///<summary>Trigger a routed event on a visual</summary>
        triggerOnVisual.triggerRoutedEvent(this, new routedEventArgs(eventArgs, triggerOnVisual));
    };
    
    routedEvent.prototype.unRegister = function (callback, triggerOnVisual, context /* optional */) {
        ///<summary>Unregister a routed event on a visual</summary>
        triggerOnVisual.unRegisterRoutedEvent(this, callback, context);
    }
    
    routedEvent.prototype.register = function(callback, triggerOnVisual, context /* optional */) {
        ///<summary>Register a routed event on a visual</summary>
        triggerOnVisual.registerRoutedEvent(this, callback, context);
    };
    
    wpfko.base.routedEvent = routedEvent;
    
    var routedEventArgs = function(eventArgs, originator) { 
        ///<summary>Arguments passed to routed event handlers. Set handled to true to stop routed event propogation</summary>       
        this.handled = false;
        this.data = eventArgs;
        this.originator = originator;
    };
    
    wpfko.base.routedEventArgs = routedEventArgs;
    
    //TODO: private
    var routedEventRegistration = function(routedEvent) {  
        ///<summary>Holds routed event registration details</summary>            
        this.routedEvent = routedEvent;
        this.event = new wpfko.base.event();
    };
    
    wpfko.base.routedEventRegistration = routedEventRegistration;
})();