
Class("wipeout.base.routedEventModel", function () {
    
    
    var routedEventModel = wipeout.base.object.extend(function () {
        ///<summary>THe base class for models if they wish to invoke routed events on their viewModel</summary>
        
        this.__triggerRoutedEventOnVM = new wo.event();
    });
        
    routedEventModel.prototype.triggerRoutedEvent = function(routedEvent, eventArgs) {
        ///<summary>Trigger a routed event which will propogate to any view models where this object is it's model and continue to bubble from there</summary>  
        this.__triggerRoutedEventOnVM.trigger({routedEvent: routedEvent, eventArgs: eventArgs});
    };;
    
    return routedEventModel;
});