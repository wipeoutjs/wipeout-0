compiler.registerClass("Wipeout.Docs.Models.Descriptions.PropertyDescription", "Wipeout.Docs.Models.Descriptions.ClassDescriptionItem", function() {
    var propertyDescription = function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, propertyDescription.getPropertySummary(constructorFunction, propertyName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
    };
    
    var inlineCommentOnly = /^\/\//;
    propertyDescription.getPropertySummary = function(constructorFunction, propertyName) {
        constructorFunction = constructorFunction.toString();
                
        var search = function(regex) {
            var i = constructorFunction.search(regex);
            if(i !== -1) {
                var func = constructorFunction.substring(0, i);
                var lastLine = func.lastIndexOf("\n");
                if(lastLine > 0) {
                    func = func.substring(lastLine);
                } 
                
                func = func.replace(/^\s+|\s+$/g, '');
                if(inlineCommentOnly.test(func))
                    return func.substring(2);
                else
                    return null;
            }
        }
        
        var result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName + "\"\\s*\\]\\s*="));        
    };
    
    return propertyDescription;
});