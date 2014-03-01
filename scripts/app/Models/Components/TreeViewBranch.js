compiler.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch", "wo.object", function() {
    var treeViewBranch = function(name, branches) {
        this._super();
            
        this.name = name;
        this.branches = branches;
    };
    
    treeViewBranch.prototype.payload = function() {
        return null;
    };
    
    return treeViewBranch;
});