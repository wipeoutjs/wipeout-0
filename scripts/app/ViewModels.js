
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
        
        if(newVal instanceof Wipeout.Docs.Models.Components.TreeViewBranch) {
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
    
    var components = {
        TreeViewBranch: treeViewBranch
    };
    
    return {
        Application: application,
        Components: components
    };
})());