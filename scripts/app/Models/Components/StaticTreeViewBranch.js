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

compiler.registerClass("Wipeout.Docs.Models.Components.TextContentTreeViewBranch", "Wipeout.Docs.Models.Components.StaticPageTreeViewBranch", function() {
    return function(name, content) {
        this._super(name, wo.contentControl.createAnonymousTemplate("<pre>" + content.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</pre>"));
    };
});