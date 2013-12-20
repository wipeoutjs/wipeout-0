
$.extend(NS("Wipeout.Docs.ViewModels"), (function() {
    
    var application = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Application");
    });
    
    var treeViewBranch =  wo.view.extend(function() {
        this._super(treeViewBranch.nullTemplate);        
    });
    
    treeViewBranch.branchTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";
    treeViewBranch.leafTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";
    treeViewBranch.nullTemplate = wo.visual.getBlankTemplateId();
    
    treeViewBranch.prototype.modelChanged = function(oldVal, newVal) {
        this._super(oldVal, newVal);
        
        if(newVal && newVal.branches) {
            this.templateId(treeViewBranch.branchTemplate);
        } else if(newVal) {
            this.templateId(treeViewBranch.leafTemplate);
        } else {
            this.templateId(treeViewBranch.nullTemplate);
        }
    };
    
    treeViewBranch.prototype.toggle = function() {
        $(this.templateItems.content).toggle();
    }
    
    var dynamicRender = wo.contentControl.extend(function() {
        this._super();
        
        this.content = ko.observable();
        
        this.template("<!-- ko render: content --><!-- /ko -->");
    });
    
    dynamicRender.prototype.modelChanged = function(oldVal, newVal) {
        this._super(oldVal, newVal);
               
        var oldVal = this.content();
        try { 
            if(newVal == null)
                this.content(null);
            else if(newVal instanceof Wipeout.Docs.Models.Pages.LandingPage) {
                var newVm = new Wipeout.Docs.ViewModels.Pages.LandingPage();
                newVm.model(newVal);
                this.content(newVm);
            }
            else
                throw "Unknown model type";
        } finally {
            if(oldVal)
                oldVal.dispose();
        }
    };    
    
    var landingPage = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Pages.LandingPage");
    });
    
    var components = {
        TreeViewBranch: treeViewBranch,
        DynamicRender: dynamicRender
    };
    
    var pages = {
        LandingPage: landingPage
    };
    
    return {
        Application: application,
        Components: components,
        Pages: pages
    };
})());