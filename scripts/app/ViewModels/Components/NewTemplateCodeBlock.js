compiler.registerClass("Wipeout.Docs.ViewModels.Components.NewTemplateCodeBlock", "Wipeout.Docs.ViewModels.Components.TemplateCodeBlock", function() {
    var newTemplateCodeBlock = function() {
        this._super.apply(this, arguments);
    };
    
    newTemplateCodeBlock.prototype.getTemplateHtml = function(newVal) {
        
        if(!this.newScriptId) throw "You must specify a script id";
        
        return '<script type="text/xml" id="' + 
            this.newScriptId + '">' + 
            this._super(newVal.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">")) + 
            "</script>";
    };
    
    return newTemplateCodeBlock;
});