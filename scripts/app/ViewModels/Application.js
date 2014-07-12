
compiler.registerClass("Wipeout.Docs.ViewModels.Application", "wo.view", function() {
    
    function application() {
        this._super("Wipeout.Docs.ViewModels.Application");
                
        var _this = this;
        crossroads.addRoute('/api.html{?query}', function(query){
            _this.route(query);
        });
        
        this.registerDisposable(ko.computed(function() {
            var tmp;
            if( (tmp = this.model()) &&
                (tmp = tmp.content()))
                    $("#headerText").html(tmp.title);
        }, this));
    };
    
    application.prototype.routeTo = function(item) {
        history.pushState(null, '', Wipeout.Docs.Models.Application.routableUrl(item));
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