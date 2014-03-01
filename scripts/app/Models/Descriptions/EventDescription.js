compiler.registerClass("Wipeout.Docs.Models.Descriptions.EventDescription", "Wipeout.Docs.Models.Descriptions.ClassDescriptionItem", function() {
    var eventDescription = function(constructorFunction, eventName, classFullName) {
        this._super(eventName, propertyDescription.getPropertySummary(constructorFunction, eventName));
        
        this.eventName = eventName;
        this.classFullName = classFullName;
    };
    
    return eventDescription;
});