compiler.registerClass("Wipeout.Docs.Models.Descriptions.Argument", "wo.object", function() {
    return function(itemDetails) {
        this._super();
        
        this.name = itemDetails.name;
        this.type = itemDetails.type;
        this.optional = !!itemDetails.optional;
        this.description = itemDetails.description;
    }
});