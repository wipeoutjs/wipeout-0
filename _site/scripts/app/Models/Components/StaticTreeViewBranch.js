compiler.registerClass("Wipeout.Docs.Models.Components.StaticPageTreeViewBranch", "Wipeout.Docs.Models.Components.PageTreeViewBranch", function() {
    return function(name, templateId) {
        this._super(name, new Wipeout.Docs.Models.Components.StaticPageTreeViewBranchTemplate(templateId));
    };
});

compiler.registerClass("Wipeout.Docs.Models.Components.StaticPageTreeViewBranchTemplate", "wo.object", function() {
    return function(templateId) {
        this._super();
        
        this.templateId = templateId;
    };
});