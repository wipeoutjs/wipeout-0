compiler.registerClass("Wipeout.Docs.Models.Components.FunctionTreeViewBranch", "Wipeout.Docs.Models.Components.PageTreeViewBranch", function() {
    var functionTreeViewBranch = function(functionDescription) {
        this._super(functionDescription.functionName, functionDescription);
    };
    
    return functionTreeViewBranch;
});