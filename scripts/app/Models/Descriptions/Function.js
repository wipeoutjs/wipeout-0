compiler.registerClass("Wipeout.Docs.Models.Descriptions.Function", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction));
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.overrides = null;
    };
        
    functionDescription.getFunctionSummary = function(theFunction) {
        var functionString = theFunction.toString();
        
        var isInlineComment = false;
        var isBlockComment = false;
        
        var removeFunctionDefinition = function() {
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
                
                removeFunctionDefinition();
            }
        };
        
        removeFunctionDefinition();
        
        if (functionString.indexOf("///<summary>") === 0) {
            return functionString.substring(12, functionString.indexOf("</summary>"));
        }
        
        return "";   
    };  
    
    return functionDescription;
});