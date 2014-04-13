compiler.registerClass("Wipeout.Docs.Models.Components.Generators.Typescript", "Wipeout.Docs.Models.Components.Generators.CodeHelperGenerator", function() {
    
    var defaultIndentation = "\t";
    
    function typescript() {
        this._super();
    }    
    
    typescript.convertType = function(type, generics) {
        type = (type === "Any" ? "any" :
            (type === "HTMLNode" ? "Node" :
            (type === "Array" && (!generics || !generics.length) ? "Array<any>" :
            (type))));
        
        if(generics && generics.length) {
            var gen = [];
            for(var i = 0, ii = generics.length; i <ii; i++)
                gen.push(typescript.convertType(generics[i]));
            
            type += "<" + gen.join(", ") + ">";
        }
        
        return type;
    };
    
    typescript.prototype.addNamespaceBeginning = function(name) {
        if(this.indentation === 0)
            this.writeLine("declare module " + name + " {");
        else
            this.writeLine("export module " + name + " {");
    };
    
    typescript.prototype.addNamespaceEnd = function(name) {
        this.writeLine("}");
    };
    
    typescript.prototype.addClassBeginning = function(name, parentClass) {
        this.writeLine((this.indentation === 0 ? "declare" : "export") + " class " + name + (parentClass ? " extends " + parentClass : "") + " {");
    };
    
    typescript.prototype.addClassEnd = function(className, parentClass) {
        this.writeLine("}");
    };
    
    typescript.prototype.addConstructorBeginning = function(className) {
        this.writeLine("constructor(");
    };
    
    typescript.prototype.addConstructorEnd = function(className) {
        this.write(");");
    };    
    
    typescript.prototype.addArgument = function(name, type, totalArguments) {
        this.write(name + ": " + typescript.convertType(type));
    };
    
    typescript.prototype.addArgumentSeparator = function(totalArguments) {
        this.write(", ");
    };
    
    typescript.prototype.addFunctionBeginning = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        this.writeLine(
            (_private ? "private " : (_protected ? "" : "")) + 
            (_static ? "static " : "")  +
            name + "(");
    };
    
    typescript.prototype.addFunctionEnd = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        this.write("): " + typescript.convertType(returnType, returnTypeGenerics) + ";");
    };
    
    typescript.prototype.addProperty = function(name, type, _protected, _private, _static) {
        this.writeLine(
            (_private ? "private " : (_protected ? "" : "")) + 
            (_static ? "static " : "")  +
            name + ": " +
            typescript.convertType(type) + ";");
    };
    
    typescript.prototype.addHeader = function() {
        this.writeLine("// wipeout.d.ts");
        this.writeLine("");
    };
    
    return typescript;
});