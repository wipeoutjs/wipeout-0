compiler.registerClass("Wipeout.Docs.ViewModels.Components.TemplateCodeBlock", "Wipeout.Docs.ViewModels.Components.CodeBlock", function() {
    var templateCodeBlock = function() {
        templateCodeBlock.staticConstructor();
        this._super.apply(this, arguments);
    };
    
    var templateDiv;
    templateCodeBlock.staticConstructor = function() {
        if(templateDiv) return;
        
        templateDiv = document.createElement("div");
        templateDiv.setAttribute("style", "display: none");
        document.getElementsByTagName("body")[0].appendChild(templateDiv);
    };
    
    templateCodeBlock.prototype.getTemplateHtml = function(newVal) {
        return newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&gt;/g, ">");
    };
    
    templateCodeBlock.prototype.onCodeChanged = function(newVal) {  
        templateDiv.innerHTML += this.getTemplateHtml(newVal);
    };
    
    return templateCodeBlock;
});