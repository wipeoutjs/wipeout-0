
compiler.registerClass("Wipeout.Docs.ViewModels.Application", "wo.view", function() {
    
    var getId = (function () {
        var id = history.state && history.state.owner && !isNaN(history.state.owner) ? history.state.owner : 0;
        return function() {
            return ++id;
        };
    }());
    
    function application() {
        this._super("Wipeout.Docs.ViewModels.Application");
                
        var _this = this;
        crossroads.addRoute('/api.html{?query}', function(query){
            _this.route(query);
        });
        
        this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage, function (args) {
            this.model().content(args.data);
            
            this.id = getId();
            
            if(args.data.$routableUrl) {
                history.pushState({owner: this.id}, "", location.origin + location.pathname + "?" + args.data.$routableUrl());
                application.parseRoute();
            }
        }, this);
        
        this.registerDisposable(ko.computed(function() {
            var tmp = this.model();
            if(tmp) {
                tmp = tmp.content();
                if(tmp)
                    $("#headerText").html(tmp.title);
            }
            
        }, this));
    };
    
    application.parseRoute = function() {
        crossroads.parse(location.pathname + location.search);
    };
    
    application.prototype.route = function(query) { 
        var temp;
        if (history.state && history.state.owner === this.id)
            return;
        
        if(temp = Wipeout.Docs.Models.Application.getModel(query))
            this.model().content(temp);
    };
    
    application.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        if(this.templateItems.content)
            this.registerDisposable(this.templateItems.content.model.subscribe(function() {                
                window.scrollTo(0,0);
            }));
        
        //TODO: this
        this.templateItems.treeView.select();
    };
    
    return application;
});