compiler.registerClass("Wipeout.Docs.Models.Components.Generators.CodeHelperGenerator", "wo.object", function() {
    
    function select(input, converter, context) {
        var output = [];
        context = context || window;
        for(var i = 0, ii = input.length; i < ii; i++)
            output.push(converter.call(context, input[i]));
        
        return output;
    }
    
    function codeHelperGenerator() {
        this.truncateNamespaces = true;
        
        this.resultStream = [];
        this.indentation = 0;
        this.indentationType = "\t";
    }
    
    codeHelperGenerator.prototype.write = function(input) {
        if(this.resultStream.length === 0)
            this.resultStream.push(input);
        else
            this.resultStream[this.resultStream.length -1] += input;
            
    };
    
    codeHelperGenerator.prototype.writeLine = function(input) {
        var tab = [];
        for(var i = 0; i < this.indentation; i++)
            tab.push(this.indentationType);
        
        this.resultStream.push(tab.join("") + input);            
    };
    
    codeHelperGenerator.prototype.addNamespaceBeginning = function(name) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addNamespaceEnd = function(name) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addClassBeginning = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addClassEnd = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addConstructorBeginning = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addConstructorEnd = function(className) {
        throw "Abstract functions must be implemented";
    };    
    
    codeHelperGenerator.prototype.addArgument = function(name, type, totalArguments) {
        throw "Abstract functions must be implemented";
    };   
    
    codeHelperGenerator.prototype.addArgumentSeparator = function(totalArguments) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addFunctionBeginning = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addFunctionEnd = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addProperty = function(name, type, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addHeader = function() {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.convertNamespace = function(name, namespaceObject) {
        
        var result= [];
        
        this.addNamespaceBeginning(name);
        
        this.indentation++;
        
        for(var item in namespaceObject) {
            if(namespaceObject[item] instanceof Wipeout.Docs.Models.Components.ApiClass) {
                this.convertClass(namespaceObject[item].classDescription);
            } else {
                this.convertNamespace(item, namespaceObject[item]);
            }            
        }
        
        this.indentation--;
        
        this.addNamespaceEnd(name);
    };
    
    codeHelperGenerator.prototype.convertClass = function(classDescription) {
        //TODO
        if(classDescription.className === "if") return;
        
        var parentClass = classDescription.parentClass ? classDescription.parentClass.classFullName : "";
        
        this.addClassBeginning(classDescription.className, parentClass);                
        this.indentation++;
        
        this.convertConstructor(classDescription.className, classDescription.classConstructor);
        select(classDescription.events, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], false);
        }, this);
        select(classDescription.properties, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], false); 
        }, this);
        select(classDescription.functions, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertFunction(arguments[0], false); 
        }, this);
        select(classDescription.staticEvents, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], true); 
        }, this);
        select(classDescription.staticProperties, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], true); 
        }, this);
        select(classDescription.staticFunctions, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertFunction(arguments[0], true); 
        }, this);
        
        this.indentation--;        
        this.addClassEnd(classDescription.className, parentClass);        
    };
    
    codeHelperGenerator.prototype.convertConstructor = function(className, functionDescription) {        
        this.addConstructorBeginning(className);
        this.indentation++;
        this.convertArguments(functionDescription.arguments);
        this.indentation--;
        this.addConstructorEnd(className);
    };  
    
    codeHelperGenerator.prototype.convertArgument = function(argument, totalArguments) {
        this.addArgument(argument.name, argument.type, totalArguments);
    }; 
    
    codeHelperGenerator.prototype.convertFunction = function(functionDescription, _static) {
        var _private = functionDescription.name && functionDescription.name.indexOf("__") === 0;
        var _protected = !_private && functionDescription.name && functionDescription.name.indexOf("_") === 0;
        
        this.addFunctionBeginning(functionDescription.name, functionDescription.returns.type, functionDescription.returns.genericTypes, _protected, _private, _static);
        this.indentation++;
        this.convertArguments(functionDescription.arguments);
        this.indentation--;
        this.addFunctionEnd(functionDescription.name, functionDescription.returns.type, functionDescription.returns.genericTypes, _protected, _private, _static);
    };
    
    codeHelperGenerator.prototype.convertArguments = function(args) {
        for (var i = 0, ii = args.length; i < ii; i++) {
            if(i !== 0) this.addArgumentSeparator(ii);
            this.convertArgument(args[i], ii);
        }
    };
    
    codeHelperGenerator.prototype.convertProperty = function(propertyDescription, _static) {
        if(propertyDescription.overrides) return;
        
        var _private = propertyDescription.name && propertyDescription.name.indexOf("__") === 0;
        var _protected = !_private && propertyDescription.name && propertyDescription.name.indexOf("_") === 0;        
        
        this.addProperty(propertyDescription.name, "Any", _protected, _private, _static);
    };
    
    codeHelperGenerator.prototype.generate = function(api) {
        api = api.namespaced();
        var result = [];
        
        this.addHeader();
        
        for(var namespace in api) {
            // until it is fixed
            if (namespace !== "wo") continue;
            this.convertNamespace(namespace, api[namespace], 0);
        }
        
        return this.resultStream.join("\n");
    };
    
    return codeHelperGenerator;
});