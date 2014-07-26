
compiler.registerClass("Wipeout.Docs.ViewModels.ApiApplication", "Wipeout.Docs.ViewModels.Application", function() {
    
    function ApiApplication() {
        this._super("Wipeout.Docs.ViewModels.ApiApplication");
        
        this.registerDisposable(ko.computed(function() {
            var tmp;
            if( (tmp = this.model()) &&
                (tmp = tmp.content()))
                    $("#headerText").html(tmp.title);
        }, this));
    };
    
    ApiApplication.prototype.route = function(query) { 
        var temp = Wipeout.Docs.Models.ApiApplication.getModel(query);        
        if (temp)
            this.model().content(temp);
    };
    
    ApiApplication.prototype.routeTo = function(item) {
        history.pushState(null, '', Wipeout.Docs.Models.ApiApplication.routableUrl(item));
        crossroads.parse(location.pathname + location.search);
    };
    
    ApiApplication.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        //TODO: this
        this.templateItems.treeView.select();
    };
    
    return ApiApplication;
});