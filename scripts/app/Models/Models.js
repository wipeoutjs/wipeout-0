
$.extend(NS("Wipeout.Docs.Models"), (function() {
    
    var enumerate = function(enumerate, callback, context) {
        context = context || window;
        
        if(enumerate)
            for(var i = 0, ii = enumerate.length; i < ii; i++)
                callback.call(context, enumerate[i], i);
    };
    
    var get = function(item, root) {
        
        var current = root || window;
        enumerate(item.split("."), function(item) {
            current = current[item];
        });
        
        return current;
    };
    
    //#######################################################
    //## END: Class
    //#######################################################
    
    //#######################################################
    //## Function
    //#######################################################
    
    
    //#######################################################
    //## END: Function
    //#######################################################
    
    //#######################################################
    //## Property
    //#######################################################
    
    var propertyDescription = classDescriptionItem.extend(function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, propertyDescription.getPropertySummary(constructorFunction, propertyName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
    });
    
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
    
    //#######################################################
    //## END: Property
    //#######################################################  
    
    //#######################################################
    //## Event
    //#######################################################
    
    var eventDescription = classDescriptionItem.extend(function(constructorFunction, eventName, classFullName) {
        this._super(eventName, propertyDescription.getPropertySummary(constructorFunction, eventName));
        
        this.eventName = eventName;
        this.classFullName = classFullName;
    });
    
    //#######################################################
    //## END: Event
    //#######################################################  
    
    //#######################################################
    //## Export
    //#######################################################
    
    var components = {
        TreeViewBranch: treeViewBranch,
        PageTreeViewBranch: pageTreeViewBranch/*,
        ClassTreeViewBranch: classTreeViewBranch*/
    };
    
    var pages = {
        LandingPage: landingPage
    };
    
    var descriptions = {
        LandingPage: landingPage,
        Class: classDescription,
        //EventPage: eventPage,
        //PropertyPage: propertyPage,
        //FunctionPage: functionPage
    };
    
    return {
        Application: application,
        Components: components,
        Pages: pages,
        Descriptions: descriptions
    };
})());