compiler.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage", "wo.view", function() {
    function propertyPage() {
        this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage");
        
        this.usagesTemplateId = ko.computed(function() {
            if(this.model()) {
                var name = this.model().fullyQualifiedName() + propertyPage.classUsagesTemplateSuffix;
                if(document.getElementById(name))
                    return name;
            }

            return wo.contentControl.getBlankTemplateId();
        }, this);
    };
    
    propertyPage.classUsagesTemplateSuffix = "_PropertyUsages";
    
    return propertyPage;
});