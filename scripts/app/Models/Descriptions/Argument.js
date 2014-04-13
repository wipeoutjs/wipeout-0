compiler.registerClass("Wipeout.Docs.Models.Descriptions.Argument", "wo.object", function() {
    function argument(itemDetails) {
        this._super();
        
        this.name = itemDetails.name;
        this.type = itemDetails.type;
        this.optional = !!itemDetails.optional;
        this.description = itemDetails.description;
    }
    
    argument.prototype.split = function() {
        var output = [];        
        wo.obj.enumerate(this.type.split(","), function(type) {
            output.push(new Wipeout.Docs.Models.Descriptions.Argument({
                name: this.name,
                type: type,
                optional: this.optional,
                description: this.description
            }));
        });
        
        return output;        
    };
    
    return argument;
});