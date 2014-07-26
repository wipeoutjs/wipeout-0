compiler.registerClass("Wipeout.Docs.Models.HowDoIApplication", "wo.object", function() {
    
    function articleLink(title, article) {
        this.text = title;
        this.article = article;
        this.href = buildHref({article: article});
        this.visible = ko.observable(true);
    };
    
    var buildHref = function(parameters) {
        
        if(parameters.article && !wo.contentControl.templateExists("Articles." + parameters.article))
            throw "No template for " + parameters.article;
        
        var output = []
        for(var i in parameters)
            output.push(i + "=" + parameters[i]);
        
        return location.origin + location.pathname + "?" + output.join("&");
    };
    
    function HowDoIApplication() {
        this._super();
        
        this.leftHandNav = [{
            header: new articleLink("Get started", "get-started"),
            items: [
                new articleLink("With knockout", "get-started-with-knockout"),
                new articleLink("With Hello World", "get-started-with-hello-world"),            
                new articleLink("With custom components", "get-started-with-custom-components"),
                new articleLink("With lists", "get-started-with-lists"),
            ]
        }, {        
            header: new articleLink("Bind or set properties", "bind-or-set-propertes"),
            items: [
                new articleLink("Bind to a static value", "bind-to-static-value"),      
                new articleLink("Bind to a property on the view model", "bind-in-scope"),
                new articleLink("Bind to a property on the model", "bind-to-model"),
                new articleLink("Bind to a property on the parent's view model", "bind-to-parents-view-model"),
                new articleLink("Set the model from the parent's model", "bind-to-parents-model"),
                new articleLink("Cascading models", "cascading-models"),
                new articleLink("Two way bindings", "bind-two-way"),
                new articleLink("Bind to a global value", "bind-to-global"),
                new articleLink("Set properties using XML elements", "bind-with-elements"),
                new articleLink("Bind in javascript code", "bind-in-code"),
                new articleLink("Find an ancestor to bind to", "bind-to-ancestor"),
                new articleLink("Call a method on a view model", "call-a-method"),
                new articleLink("Call a method on another object", "call-method-out-of-scope")
        ]}, {        
            header: new articleLink("Set properties using XML elements", "set-properties-using-xml-elements"),
            items: [
                new articleLink("String Properties", "set-string-property"),
                new articleLink("Boolean Properties", "set-boolean-property"),
                new articleLink("Int Properties", "set-int-property"),
                new articleLink("Float Properties", "set-float-property"),
                new articleLink("Date Properties", "set-date-property"),
                new articleLink("JSON Properties", "set-json-property"),
                new articleLink("Add custom parser", "add-property-parser"),
                new articleLink("Set Complex Properties", "set-complex-properties"),
            ]}, {
            header: new articleLink("Use the wipeout OO framework", "wipeout-oo"),
            items: [
                new articleLink("Inheritance", "inheritance"),
                new articleLink("Overriding methods", "overriding-methods"),
                new articleLink("Another extend syntax", "another-extend-syntax"),
                new articleLink("Virtual method cache", "virtual-method-cache"),
                new articleLink("Strict mode", "strict-mode")
            ]}, {        
            header: new articleLink("Use the model layer", "models"),
            items: []
        }, {        
            header: new articleLink("Use templates", "templates"),
            items: [
                new articleLink("template id", "template-id"),
                new articleLink("Referencing items in a template", "referencing-items-in-a-template"),
                new articleLink("Asynchronus templates", "asynchronous-templates"),
                new articleLink("wo.contentControl", "templates-content-control"),
            ]}, {        
            header: new articleLink("Work with lists", "working-with-lists"),
            items: [
                new articleLink("Setting the list template", "items-control-list-template"),
                new articleLink("List item lifecycle", "items-control-item-lifecycle"),
                new articleLink("Creating custom list items", "items-control-custom-items"),
                new articleLink("Self removing items", "items-control-self-removing-items")
            ]}, {        
            header: new articleLink("Control the view model lifecycle", "control-the-view-model-lifecycle"),
            items: []
        }, {
            header: new articleLink("Use the if control", "if-control"),
            items: []
        }, {
            header: new articleLink("Use wipeout bindings", "wipeout-bindings"),
            items: [
                new articleLink("The wipeout binding", "wipeout-binding"),
                new articleLink("The itemsControl binding", "items-control-binding"),
                new articleLink("The render binding", "render-binding"),
            ]}, {
            header: new articleLink("Work with events", "events"),
            items: [
                new articleLink("Advanced events", "advanced-events")
            ]}, {
            header: new articleLink("Work with routed events", "routed-events"),
            items: [
                new articleLink("Advanced routed events", "advanced-routed-events"),
                new articleLink("Routed event models", "routed-event-models")
            ]}, {
        
            header: new articleLink("Share Parent Scope", "share-parent-scope"),
            items: []
        }, {
            header: new articleLink("Disposing of Subscriptions", "disposing-of-subscriptions"),
            items: [
                new articleLink("Disposing using a callback", "disposing-using-a-callback"),
                new articleLink("Disposing using a disposable object", "disposing-using-a-disposable-object"),
                new articleLink("Forcing disposal", "forcing-disposal")
            ]}, {
            header: new articleLink("Wipeout Utilities", "wipeout-utilities"),
            items: []
        }, {
            header: new articleLink("Bind to a specific view model", "bind-to-specific-view-model"),
            items: [
                new articleLink("Knockout binding context", "knockout-binding-context"),
                new articleLink("Find a view model", "find-a-view-model"),
                new articleLink("Custom $find filters", "custom-find-filters"),
                new articleLink("Call a view model method", "call-a-view-model-method"),
                new articleLink("Find and call a view model method", "find-and-call-a-view-model-method")
        ]}, {        
            header: new articleLink("Wipeout native view models", "wipeout-native-classes"),
            items: []
        }];
        
        this.flatList = [];
        this.index();
        
        window.xxx = this;
    };
    
    HowDoIApplication.prototype.search = function(searchTerm) {
        if(!searchTerm || searchTerm.length < 2)
            searchTerm = "";
        
        var _this = this;        
        var token = this.token = {};        
        setTimeout(function() {
            if(token === _this.token)
                _this._search(searchTerm);
        }, 100);
    };
    
    HowDoIApplication.prototype._search = function(searchTerm) {
        if(!searchTerm) {
            wo.obj.enumerate(this.flatList, function(item) {
                if(!item.visible())item.visible(true);
            }, this);
            
            return;
        }
        
        searchTerm = searchTerm.toLowerCase().split(/\s+/);        
        
        wo.obj.enumerate(this.flatList, function(item) {
            
            var visible = true;
            var title = item.text.toLowerCase();
            for(var i = 0, ii = searchTerm.length; i < ii; i++)
                visible &= (title.indexOf(searchTerm[i]) !== -1 || item.body.indexOf(searchTerm[i]) !== -1);
            
            item.visible(visible);
        }, this);
    };
    
    HowDoIApplication.prototype.index = function() {
        this.flatList.length = 0;
        wo.obj.enumerate(this.leftHandNav, function(group) {
            if(group.header)
                this.flatList.push(group.header);
            
            wo.obj.enumerate(group.items, function(item) {
                this.flatList.push(item);
            }, this);
        }, this);
        
        wo.obj.enumerate(this.flatList, function(item) {
            item.body = document.getElementById("Articles." + item.href.substr(item.href.indexOf("article=") + 8)).text.toLowerCase();
        }, this);        
    };
    
    return HowDoIApplication;
});