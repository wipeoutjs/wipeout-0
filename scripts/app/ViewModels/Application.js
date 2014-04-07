
compiler.registerClass("Wipeout.Docs.ViewModels.Application", "wo.view", function() {
    
    function application() {
        this._super("Wipeout.Docs.ViewModels.Application");
        
        this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage, function (args) {
            this.model().content(args.data);
        }, this);
    };
    
    application.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        if(this.templateItems.content)
            this.registerDisposable(this.templateItems.content.model.subscribe(function() {
                window.scrollTo(0,0);
            }).dispose);
        
        //TODO: this
        this.templateItems.treeView.select();
    };
    
    return application;
});