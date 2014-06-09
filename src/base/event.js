
var wipeout = wipeout || {};
wipeout.base = wipeout.base || {};

Class("wipeout.base.eventRegistration", function () {
    
    return wipeout.base.disposable.extend(function(callback, context, dispose) {
        ///<summary>On object containing event registration details</summary>
        ///<param name="callback" type="Any" optional="false">The event logic</param>
        ///<param name="context" type="Any" optional="true">The context of the event logic</param>
        ///<param name="dispose" type="Function" optional="false">A dispose function</param>
        ///<param name="priority" type="Number">The event priorty. The lower the priority number the sooner the callback will be triggered.</param>
        this._super(dispose);    
                                                          
        this.callback = callback;
        this.context = context;                
    }, "eventRegistration");
});

Class("wipeout.base.event", function () {
    
    var event = function() {
        ///<summary>Defines a new event with register and trigger functinality</summary>
        
        // allow for non use of the new key word
        if(!(this instanceof event))
           return new event();
        
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
        for(var i = 0; i < this._registrations.length; i++) {
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
    
    event.prototype.register = function(callback, context, priority) {
        ///<summary>Subscribe to an event</summary>
        ///<param name="callback" type="Function" optional="false">The callback to fire when the event is raised</param>
        ///<param name="context" type="Any" optional="true">The context "this" to use within the calback</param>
        ///<param name="priority" type="Number" optional="true">The event priorty. The lower the priority number the sooner the callback will be triggered. The default is 0</param>
        ///<returns type="wo.eventRegistration">An object with the details of the registration, including a dispose() function</returns>
        
        if(!(callback instanceof Function))
            throw "Invalid event callback";
        
        if(priority && !(priority instanceof Number))
            throw "Invalid event priority";
        
        var reg = this._registrations;
        var evnt = { 
            priority: priority || 0,
            callback: callback, 
            context: context == null ? window : context,
            dispose: function() {
                var index = reg.indexOf(evnt);
                if(index >= 0)
                    reg.splice(index, 1);
            }
        };
        
        for(var i = 0, ii = this._registrations.length; i < ii; i++) {
            if(evnt.priority < this._registrations[i].priority) {
                this._registrations.splice(i, 0, evnt);
                break;
            }
        }
        
        if(i === ii)
            this._registrations.push(evnt);
        
        return new wipeout.base.eventRegistration(evnt.callback, evnt.context, evnt.dispose, evnt.priority);
    };
    
    return event;
});