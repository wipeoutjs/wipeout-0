compiler.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch", "wo.object", function() {
    var treeViewBranch = function(name, href, branches) {
        this._super();
            
        this.name = name;
        this.href = href;
        this.branches = branches;
    };
    
    return treeViewBranch;
});