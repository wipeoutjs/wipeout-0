compiler.registerClass("Wipeout.Docs.ViewModels.Components.RaiseRoutedEvent", "wo.contentControl", function() {
    function raiseRoutedEvent() {
        this._super();
    }
    
    raiseRoutedEvent.prototype.trigger = function() {
        this.triggerRoutedEvent(this.routedEvent, this.model());
    };
    
    return raiseRoutedEvent;
});