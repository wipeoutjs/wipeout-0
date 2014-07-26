compiler.registerClass("Wipeout.Rl", "wo.view", function() {
    var RouteLink = function() {
        this._super("Wipeout.Docs.ViewModels.Components.RouteLink");
    };
    
    RouteLink.prototype.onRendered = function(oldValues, newValues) {
        this._super(oldValues, newValues);
        
        $(this.templateItems.link).on("click", function(e) {
            if(e.button === 1)
                return;
            
            e.preventDefault();
            window.history.pushState(null, "", this.href);
            crossroads.parse(location.pathname + location.search);
        });
    }
    
    return RouteLink;
});