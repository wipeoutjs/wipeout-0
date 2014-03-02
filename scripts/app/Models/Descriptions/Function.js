compiler.registerClass("Wipeout.Docs.Models.Descriptions.Function", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction));
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.arguments = functionDescription.getArguments(theFunction);
        
        this.returns = functionDescription.getReturnSummary(theFunction);
        
        this.overrides = null;
        
        this.fullyQualifiedName = ko.computed(function() {
            return this.classFullName + "." + this.functionName;
        }, this);
    };
            
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var COMMA = /([^\s,]+)/g;
    functionDescription.getArguments = function(theFunction) {
        if(!theFunction || !(theFunction instanceof Function)) return [];
        
        var fnStr = theFunction.toString().replace(STRIP_COMMENTS, '')
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(COMMA);
        
        if(!result)
            return [];
        
        for(var i = 0, ii = result.length; i < ii; i++) {
            result[i] = new Wipeout.Docs.Models.Descriptions.Argument(functionDescription.getArgumentSummary(result[i], theFunction));
        }
        
        return result;
    }; 
        
    functionDescription.removeFunctionDefinition = function(functionString) {
        var firstInline = functionString.indexOf("//");
        var firstBlock = functionString.indexOf("/*");
        var openFunction = functionString.indexOf("{");

        if(firstInline === -1) firstInline = Number.MAX_VALUE;
        if(firstBlock === -1) firstBlock = Number.MAX_VALUE;

        if(openFunction < firstInline && openFunction < firstBlock) {
            functionString = functionString.substr(openFunction + 1).replace(/^\s+|\s+$/g, '');
        } else { 
            if(firstInline < firstBlock) {
                functionString = functionString.substr(functionString.indexOf("\n")).replace(/^\s+|\s+$/g, '');
            } else {
                functionString = functionString.substr(functionString.indexOf("*/")).replace(/^\s+|\s+$/g, '');
            }

            functionString = functionDescription.removeFunctionDefinition(functionString);
        }

        return functionString;
    };
    
    functionDescription.getCommentsAsXml = function(theFunction, commentRegex) {
        var functionString = functionDescription.removeFunctionDefinition(theFunction.toString());
        
        var i;
        if ((i = functionString.search(commentRegex)) !== -1) {
            // get rid of "///"
            var current = functionString.substr(i + 3);            
            return new DOMParser().parseFromString(current.substr(0, current.indexOf("\n")), "application/xml").documentElement;
        }
        
        return null;
    }
        
    functionDescription.getArgumentSummary = function(argument, theFunction) {
        
        var regex = new RegExp("///\\s*<param\\s*name=\"" + argument + "\"\\s*(\\s+type=\".*\"){0,1}>.*</param>\\s*\n");
        var comment = functionDescription.getCommentsAsXml(theFunction, regex);
        
        if(comment) {  
            return {
                name: argument,
                type: comment.getAttribute("type"),
                optional: wo.view.objectParser.bool(comment.getAttribute("optional")),
                description: comment.innerHTML
            };  
        }
        
        return {
            name: argument
        };   
    };   
            
    functionDescription.getFunctionSummary = function(theFunction) {        
        var regex = new RegExp("///\\s*<summary>.*</summary>\\s*\n");
        var comment = functionDescription.getCommentsAsXml(theFunction, regex);
        if(comment) {  
            return comment.innerHTML;
        }
        
        return "";   
    };   
            
    functionDescription.getReturnSummary = function(theFunction) {  
        var regex = new RegExp("///\\s*<returns\\s*(type=\".*\"){0,1}>.*</returns>\\s*\n");
        var comment = functionDescription.getCommentsAsXml(theFunction, regex);
        if(comment) {
            if(comment.getAttribute("type") === "void") return null;
            
            return {
                summary: comment.innerHTML,
                type: comment.getAttribute("type")
            };
        }
        
        return {
            type: "void"
        };   
    };  
    
    return functionDescription;
});