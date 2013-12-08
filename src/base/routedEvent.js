
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {
    
    var routedEvent = function() {
    };

    routedEvent.prototype.trigger = function(triggerOnVisual, eventArgs) {
        triggerOnVisual.triggerRoutedEvent(this, new routedEventArgs(eventArgs));
    };
    
    routedEvent.prototype.unRegister = function (callback, triggerOnVisual, context /* optional */) {
        triggerOnVisual.unRegisterRoutedEvent(this, callback, context);
    }
    
    routedEvent.prototype.register = function(callback, triggerOnVisual, context /* optional */) {
        triggerOnVisual.registerRoutedEvent(this, callback, context);
    };
    
    wpfko.base.routedEvent = routedEvent;
    
    var routedEventArgs = function(eventArgs) {        
        this.handled = false;
        this.data = eventArgs;
    };
    
    wpfko.base.routedEventArgs = routedEventArgs;
    
    var routedEventRegistration = function(routedEvent) {        
        this.routedEvent = routedEvent;
        this.event = new wpfko.base.event();
    };
    
    wpfko.base.routedEventRegistration = routedEventRegistration;
})();