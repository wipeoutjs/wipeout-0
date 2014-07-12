compiler.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch", "wo.view", function() {
    var treeViewBranch = function() {
        this._super(treeViewBranch.nullTemplate);
        
        this.isOpen = ko.observable();
        
        this.glyphClass = ko.computed(function() {
            var open = this.isOpen(),
                model = this.model(),
                hasBranches = model && model.branches && model.branches.length;
                        
            if(this.isOpen() && hasBranches)                
                return "glyphicon glyphicon-chevron-down";
            if(model && model.href && !hasBranches)                
                return "glyphicon glyphicon-chevron-right";
            
            return "";
        }, this);
    };
    
    treeViewBranch.branchTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";
    treeViewBranch.leafTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";
    treeViewBranch.nullTemplate = wo.visual.getBlankTemplateId();
    
    treeViewBranch.prototype.onRendered = function(oldValues, newValues) {  
        this._super(oldValues, newValues);
                
        this.isOpen(!!$(this.templateItems.content).filter(":visible").length);
    };
    
    treeViewBranch.prototype.onModelChanged = function(oldVal, newVal) {  
        this._super(oldVal, newVal);
        
        if(newVal && (newVal.branches || newVal.href)) {
            this.templateId(treeViewBranch.branchTemplate);
        } else if(newVal) {
            this.templateId(treeViewBranch.leafTemplate);
        } else {
            this.templateId(treeViewBranch.nullTemplate);
        }
    };
    
    treeViewBranch.prototype.select = function() {
        var content = this.templateItems.content.templateItems.content;
        
        if(this.model().branches)
            $(content).toggle();
        
        this.isOpen(!!$(content).filter(":visible").length);
                
        if(this.model().href) {  
            if (this.isOpen() || !this.model().branches || !this.model().branches.length) {
                history.pushState(null, "", this.model().href);
                crossroads.parse(location.pathname + location.search);
            }
        }
    };
    
    return treeViewBranch;
});