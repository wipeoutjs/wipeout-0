compiler.registerClass("Wipeout.Docs.Models.Components.ApiBuilder", "wo.object", function() {    
    
    function apiBuilder(root, rootNamespace) {
        this._super();
        
        this.classes = apiBuilder.flatten(root, rootNamespace);
    };
    
    apiBuilder.prototype.build = function(settings) {
        settings = settings ||{};
        
        var api = new Wipeout.Docs.Models.Components.Api();
        
        var classes = apiBuilder.toArray(this.classes);
        if(settings.knownParents)
            for(var i = 0, ii = settings.knownParents.length; i < ii; i++)
                classes.push(settings.knownParents[i]);
        
        
        var done = wo.obj.copyArray(settings.knownParents || []);
        done.push(Object);
        
        if(settings.filter)
            for(var i = classes.length - 1; i >= 0; i--)
                if(!settings.filter(classes[i]))
                   classes.splice(i, 1);
        
        while (classes.length) {
            var length = classes.length;
            
            for(var i = classes.length - 1; i >= 0; i--) {
                if(done.indexOf(apiBuilder.getParentClass(classes[i].value)) !== -1) {
                    api.forClass(classes[i].key);
                    done.push(classes[i].value);
                    classes.splice(i, 1);
                }
            }
            
            if(length === classes.length)
                throw "Could not find parent classes for the remaining classes";
        }
        
        return api;
    }
    
    apiBuilder.getParentClass = function(childClass) {
        return Object.getPrototypeOf(childClass.prototype).constructor;
    };
    
    apiBuilder.toArray = function(obj) {
        var array = [];
        for(var i in obj)
            array.push({key: i, value: obj[i]});
        
        return array;
    };
            
    apiBuilder.flatten = function(root, rootNamespace) {
        
        var output = {};
        
        for(var i in root) {
            if(root[i] instanceof Function) {
                output[rootNamespace + "." + i] = root[i];
            } else if (root[i] instanceof Object) {
                var flattened = apiBuilder.flatten(root[i], rootNamespace + "." + i);
                for(var j in flattened)
                    output[j] = flattened[j];
            }
        }
        
        return output;
    }
    
    return apiBuilder;
});