
compiler.registerClass("Wipeout.Docs.ViewModels.HowDoIApplication", "Wipeout.Docs.ViewModels.Application", function() {
    
    function HowDoIApplication() {
        this._super("Wipeout.Docs.ViewModels.HowDoIApplication", "/wipeout-0/how-do-i.html");
        
        this.contentTemplate = ko.observable(wo.contentControl.getBlankTemplateId());
        
        var placeholder = document.getElementById("headerText");
        var textbox = wo.html.createElement('<input style="margin-top: 20px;" type="text" placeholder="Search"></input>');
        placeholder.parentElement.insertBefore(textbox, placeholder);
        
        var _this = this;
        textbox.addEventListener("keyup", function() {
            _this.model().search(textbox.value);
        });
        
        textbox.addEventListener("change", function() {
            _this.model().search(textbox.value);
        });
    };
    
    HowDoIApplication.prototype.route = function(query) { 
        if(query.article) {
            this.contentTemplate("Articles." + query.article);
        } else {
            this.contentTemplate(wo.contentControl.getBlankTemplateId());
        }
    };
    
    return HowDoIApplication;
});