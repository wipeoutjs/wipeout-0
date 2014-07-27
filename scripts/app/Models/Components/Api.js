compiler.registerClass("Wipeout.Docs.Models.Components.Api", "wo.object", function() {    
    
    var api = function() {
        this._super();
        
        this.classes = [];
    };
    
    api.prototype.getClassDescription = function(classConstructor) {
        for(var i = 0, ii = this.classes.length; i < ii; i++)            
            if(this.classes[i].classConstructor === classConstructor)
                return this.classes[i].classDescription;
    };
    
    api.prototype.forClass = function(className) {
        
        var classConstructor = get(className);
        var result = this.getClassDescription(classConstructor);
        if(result)
            return result;
        
        var desc = new Wipeout.Docs.Models.Descriptions.Class(className, this);
        this.classes.push(new Wipeout.Docs.Models.Components.ApiClass(desc, classConstructor));
        
        return desc;
    };
    
    function ns(namespace, root) {
        namespace = namespace.split(".");
        root = root || window;
        
        // skip last part
        for(var i = 0, ii = namespace.length - 1; i < ii; i++) {
            root = root[namespace[i]] = (root[namespace[i]] || {});
        }
        
        return root;
    }
    
    api.prototype.codeHelper = function(codeHelperGenerator) {
        if(!(codeHelperGenerator instanceof Wipeout.Docs.Models.Components.Generators.CodeHelperGenerator))
            throw "Invalid input";
        
        return codeHelperGenerator.generate(this);
    };
    
    api.prototype.namespaced = function() {
        var output = {};
        
        for(var i = 0, ii = this.classes.length; i < ii; i++) {
            ns(this.classes[i].classDescription.classFullName, output)[this.classes[i].classDescription.className] = this.classes[i];
        }        
        
        return output;
    };
    
    return api;
});