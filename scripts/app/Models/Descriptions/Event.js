compiler.registerClass("Wipeout.Docs.Models.Descriptions.Event", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var eventDescription = function(constructorFunction, eventName, classFullName, isStatic) {
        this._super(eventName, Wipeout.Docs.Models.Descriptions.Property.getPropertySummary(constructorFunction, eventName), isStatic);
                        
        this.eventName = eventName;
        this.classFullName = classFullName;
        
        this.title = this.eventName;
    };
    
    return eventDescription;
});