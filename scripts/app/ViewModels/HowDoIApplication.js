
compiler.registerClass("Wipeout.Docs.ViewModels.HowDoIApplication", "Wipeout.Docs.ViewModels.Application", function() {
    
    function HowDoIApplication() {
        this._super("Wipeout.Docs.ViewModels.HowDoIApplication", "/wipeout-0/how-do-i.html");
        
        this.contentTemplate = ko.observable(wo.contentControl.getBlankTemplateId());
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