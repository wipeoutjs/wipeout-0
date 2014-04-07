compiler.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch", "Wipeout.Docs.Models.Components.TreeViewBranch", function() {
    var pageTreeViewBranch = function(name, page, branches) {
        this._super(name, branches);
        
        this.page = page;
        if(this.page)
            this.page.title = name;
    };
    
    pageTreeViewBranch.prototype.payload = function() {
        return this.page;
    };
    
    return pageTreeViewBranch;
});