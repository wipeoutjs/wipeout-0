
var wipeout = wipeout || {};
wipeout.base = wipeout.base || {};

Class("wipeout.base.event", function () {
    
    var event = function() {
        ///<summary>Defines a new event with register and trigger functinality</summary>
        
        //Array of callbacks to fire when event is triggered
        this._registrations = [];
    };

    event.prototype.trigger = function(eventArgs) {
        ///<summary>Trigger the event, passing the eventArgs to each subscriber</summary>
        ///<param name="eventArgs" type="Any" optional="true">The arguments to pass to event handlers</param>
        
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
            if(eventArgs instanceof wipeout.base.routedEventArgs && eventArgs.handled) return;
            
            this._registrations[i].callback.call(this._registrations[i].context, eventArgs);
        }
    };
    
    event.prototype.unRegister = function (callback, context /* optional */) {
        ///<summary>Un subscribe to an event. The callback and context must be the same as those passed in the original registration</summary>
        ///<param name="callback" type="Function" optional="false">The callback to un-register</param>
        ///<param name="context" type="Any" optional="true">The original context passed into the register function</param>
        
        context = context == null ? window : context;
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
            if(this._registrations[i].callback === callback && this._registrations[i].context === context) {
                this._registrations.splice(i, 1);
                i--;
            }
        }
    }
    
    event.prototype.dispose = function() {
        ///<summary>Dispose of the event</summary>
        this._registrations.length = 0;
    }
    
    event.prototype.register = function(callback, context /* optional */) {
        ///<summary>Subscribe to an event</summary>
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="context" type="Any" optional="true">The context "this" to use within the calback</param>
        ///<returns type="Object">An object with the details of the registration, including a dispose() function</returns>
        
        if(!(callback instanceof Function))
            throw "Invalid event callback";
        
        var reg = this._registrations;
        var evnt = { 
            callback: callback, 
            context: context == null ? window : context,
            dispose: function() {
                var index = reg.indexOf(evnt);
                if(index >= 0)
                    reg.splice(index, 1);
            }
        };
        
        this._registrations.push(evnt);
        
        return {
            callback: evnt.callback, 
            context: evnt.context,
            dispose: evnt.dispose
        };
    };
    
    return event;
});