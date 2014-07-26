
compiler.registerClass("Wipeout.Docs.ViewModels.Application", "wo.view", function() {
    
    function Application(templateId, rootUrl) {
        if(this.constructor === Application) throw "Cannot create an instance of an abstract class";
        
        this._super(templateId);
                
        var _this = this;
        crossroads.addRoute(rootUrl + '{?query}', function(query){
            _this.route(query);
        });
    };
    
    Application.prototype.onApplicationInitialized = function() {
        this.appInit = true;
    };
    
    Application.prototype.route = function(query) {
        throw "Abstract method must be overridden";
    };
    
    Application.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        if (this.templateItems.content)
            this.registerDisposable(this.templateItems.content.model.subscribe(function() {                
                window.scrollTo(0,0);
            }));
    };
    
    return Application;
});