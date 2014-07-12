compiler.registerClass("Wipeout.Docs.Models.Descriptions.Function", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName, isStatic) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction), isStatic);
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.title = this.functionName;
        
        var xmlSummary = this.getXmlSummary();
        
        this.arguments = this.getArguments(xmlSummary);
        
        this.returns = functionDescription.getReturnSummary(xmlSummary);
        
        this.overrides = null;
        
        this.fullyQualifiedName = ko.computed(function() {
            return this.classFullName + "." + this.functionName;
        }, this);
    };
            
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var COMMA = /([^\s,]+)/g;
    functionDescription.prototype.getArguments = function(xmlSummary) {
        if(!this["function"] || !(this["function"] instanceof Function)) return [];
        
        var fnStr = this["function"].toString().replace(STRIP_COMMENTS, '')
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(COMMA);
        
        if(!result)
            return [];
        
        for(var i = 0, ii = result.length; i < ii; i++) {
            result[i] = new Wipeout.Docs.Models.Descriptions.Argument(functionDescription.getArgumentSummary(result[i], xmlSummary));
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
    
    var functionMeta = /^\s*\/\/\//g;
    functionDescription.getXmlSummary = function(theFunction) {
        var functionString = functionDescription.removeFunctionDefinition(theFunction.toString()).split("\n");
        for(var i = 0, ii = functionString.length; i < ii; i++) {
            if(functionString[i].search(functionMeta) !== 0)
                break;
            
            functionString[i] = functionString[i].replace(functionMeta, "");
        }
                
        return new DOMParser().parseFromString("<meta>" + functionString.splice(0, i).join("") + "</meta>", "application/xml").documentElement;
    };
    
    functionDescription.prototype.getXmlSummary = function() {
        return functionDescription.getXmlSummary(this["function"]);
    };
            
    functionDescription.getArgumentSummary = function(argument, xmlSummary) {
        var comment = null;
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "param" && xmlSummary.childNodes[i].getAttribute("name") === argument) {
                comment = xmlSummary.childNodes[i];
                break;
            }
        }
        
        if(comment) {  
            var generics = [];
            
            var tmp;
            var g = "generic";
            var i = 0;
            for(var i = 0; tmp = comment.getAttribute(g + i); i++) {
                generics.push(tmp);
            }
            
            return {
                name: argument,
                type: comment.getAttribute("type"),
                optional: wo.view.objectParser.bool(comment.getAttribute("optional")),
                description: comment.innerHTML,
                genericTypes: generics
            };  
        }
        
        return {
            name: argument
        };   
    };   
            
    functionDescription.getFunctionSummary = function(theFunction) {
        var xmlSummary = functionDescription.getXmlSummary(theFunction);
        
        var comment = null;
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "summary") {
                comment = xmlSummary.childNodes[i];
                break;
            }
        }
        
        if(comment) {  
            return comment.innerHTML;
        }
        
        return "";   
    };   
            
    functionDescription.getReturnSummary = function(xmlSummary) { 
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "returns") {
                var generics = [];

                var tmp;
                var g = "generic";
                for(var j = 0; tmp = xmlSummary.childNodes[i].getAttribute(g + j); j++) {
                    generics.push(tmp);
                }
                
                return {
                    summary: xmlSummary.childNodes[i].innerHTML,
                    type: xmlSummary.childNodes[i].getAttribute("type"),
                    genericTypes: generics
                };
            }
        }
        
        return {
            type: "void"
        };
    };  
    
    return functionDescription;
});