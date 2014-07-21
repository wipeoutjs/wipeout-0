compiler.registerClass("Wipeout.Docs.Models.HowDoIApplication", "wo.object", function() {
    
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
            header: {
                text: "Get started",
                href: buildHref({article: "get-started"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "With knockout",
                href: buildHref({article: "get-started-with-knockout"}),
                visible: ko.observable(true)
            }, {
                text: "With Hello World",
                href: buildHref({article: "get-started-with-hello-world"}),
                visible: ko.observable(true)
            }, {
                text: "With custom components",
                href: buildHref({article: "get-started-with-custom-components"}),
                visible: ko.observable(true)
            }, {
                text: "With lists",
                href: buildHref({article: "get-started-with-lists"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Bind or set properties",
                href: buildHref({article: "bind-or-set-propertes"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Bind to a static value",
                href: buildHref({article: "bind-to-static-value"}),
                visible: ko.observable(true)
            }, {
                text: "Bind to a property on the view model",
                href: buildHref({article: "bind-in-scope"}),
                visible: ko.observable(true)
            }, {
                text: "Bind to a property on the model",
                href: buildHref({article: "bind-to-model"}),
                visible: ko.observable(true)
            }, {
                text: "Bind to a property on the parent's view model",
                href: buildHref({article: "bind-to-parents-view-model"}),
                visible: ko.observable(true)
            }, {
                text: "Set the model from the parent's model",
                href: buildHref({article: "bind-to-parents-model"}),
                visible: ko.observable(true)
            }, {
                text: "Cascading models",
                href: buildHref({article: "cascading-models"}),
                visible: ko.observable(true)
            }, {
                text: "Two way bindings",
                href: buildHref({article: "bind-two-way"}),
                visible: ko.observable(true)
            }, {
                text: "Bind to a global value",
                href: buildHref({article: "bind-to-global"}),
                visible: ko.observable(true)
            }, {
                text: "Set properties using XML elements",
                href: buildHref({article: "bind-with-elements"}),
                visible: ko.observable(true)
            }, {
                text: "Bind in javascript code",
                href: buildHref({article: "bind-in-code"}),
                visible: ko.observable(true)
            }, {
                text: "Find an ancestor to bind to",
                href: buildHref({article: "bind-to-ancestor"}),
                visible: ko.observable(true)
            }, {
                text: "Call a method on a view model",
                href: buildHref({article: "call-a-method"}),
                visible: ko.observable(true)
            }, {
                text: "Call a method on another object",
                href: buildHref({article: "call-method-out-of-scope"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Set properties using XML elements",
                href: buildHref({article: "set-properties-using-xml-elements"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "String Properties",
                href: buildHref({article: "set-string-property"}),
                visible: ko.observable(true)
            }, {
                text: "Boolean Properties",
                href: buildHref({article: "set-boolean-property"}),
                visible: ko.observable(true)
            }, {
                text: "Int Properties",
                href: buildHref({article: "set-int-property"}),
                visible: ko.observable(true)
            }, {
                text: "Float Properties",
                href: buildHref({article: "set-float-property"}),
                visible: ko.observable(true)
            }, {
                text: "Date Properties",
                href: buildHref({article: "set-date-property"}),
                visible: ko.observable(true)
            }, {
                text: "JSON Properties",
                href: buildHref({article: "set-json-property"}),
                visible: ko.observable(true)
            }, {
                text: "Add custom parser",
                href: buildHref({article: "add-property-parser"}),
                visible: ko.observable(true)
            }, {
                text: "Set Complex Properties",
                href: buildHref({article: "set-complex-properties"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Use the wipeout OO framework",
                href: buildHref({article: "wipeout-oo"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Inheritance",
                href: buildHref({article: "inheritance"}),
                visible: ko.observable(true)
            }, {
                text: "Overriding methods",
                href: buildHref({article: "overriding-methods"}),
                visible: ko.observable(true)
            }, {
                text: "Another extend syntax",
                href: buildHref({article: "another-extend-syntax"}),
                visible: ko.observable(true)
            }, {
                text: "Virtual method cache",
                href: buildHref({article: "virtual-method-cache"}),
                visible: ko.observable(true)
            }, {
                text: "Strict mode",
                href: buildHref({article: "strict-mode"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Use the model layer",
                href: buildHref({article: "models"}),
                visible: ko.observable(true)
            },
            items: []
        }, {
            header: {
                text: "Use templates",
                href: buildHref({article: "templates"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "template id",
                href: buildHref({article: "template-id"}),
                visible: ko.observable(true)
            }, {
                text: "Referencing items in a template",
                href: buildHref({article: "referencing-items-in-a-template"}),
                visible: ko.observable(true)
            }, {
                text: "Asynchronus templates",
                href: buildHref({article: "asynchronous-templates"}),
                visible: ko.observable(true)
            }, {
                text: "wo.contentControl",
                href: buildHref({article: "templates-content-control"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Work wih lists",
                href: buildHref({article: "working-with-lists"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Setting the list template",
                href: buildHref({article: "items-control-list-template"}),
                visible: ko.observable(true)
            }, {
                text: "List item lifecycle",
                href: buildHref({article: "items-control-item-lifecycle"}),
                visible: ko.observable(true)
            }, {
                text: "Creating custom list items",
                href: buildHref({article: "items-control-custom-items"}),
                visible: ko.observable(true)
            }, {
                text: "Self removing items",
                href: buildHref({article: "items-control-self-removing-items"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Control the view model lifecycle",
                href: buildHref({article: "control-the-view-model-lifecycle"}),
                visible: ko.observable(true)
            },
            items: []
        }, {
            header: {
                text: "Use the if control",
                href: buildHref({article: "if-control"}),
                visible: ko.observable(true)
            },
            items: []
        }, {
            header: {
                text: "Use wipeout bindings",
                href: buildHref({article: "wipeout-bindings"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "The wipeout binding",
                href: buildHref({article: "wipeout-binding"}),
                visible: ko.observable(true)
            }, {
                text: "The itemsControl binding",
                href: buildHref({article: "items-control-binding"}),
                visible: ko.observable(true)
            }, {
                text: "The render binding",
                href: buildHref({article: "render-binding"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Work with events",
                href: buildHref({article: "events"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Advanced events",
                href: buildHref({article: "advanced-events"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Work with routed events",
                href: buildHref({article: "routed-events"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Advanced routed events",
                href: buildHref({article: "advanced-routed-events"}),
                visible: ko.observable(true)
            }, {
                text: "Routed event models",
                href: buildHref({article: "routed-event-models"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Share Parent Scope",
                href: buildHref({article: "share-parent-scope"}),
                visible: ko.observable(true)
            },
            items: []
        }, {
            header: {
                text: "Disposing of Subscriptions",
                href: buildHref({article: "disposing-of-subscriptions"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Disposing using a callback",
                href: buildHref({article: "disposing-using-a-callback"}),
                visible: ko.observable(true)
            }, {
                text: "Disposing using a disposable object",
                href: buildHref({article: "disposing-using-a-disposable-object"}),
                visible: ko.observable(true)
            }, {
                text: "Forcing disposal",
                href: buildHref({article: "forcing-disposal"}),
                visible: ko.observable(true)
            }]
        }, {
            header: {
                text: "Wipeout Utilities",
                href: buildHref({article: "wipeout-utilities"}),
                visible: ko.observable(true)
            },
            items: [{
                text: "Html Utilities",
                href: buildHref({article: "utilities-html"}),
                visible: ko.observable(true)
            }, {
                text: "Object utilities",
                href: buildHref({article: "utilities-obj"}),
                visible: ko.observable(true)
            }, {
                text: "Knockout utilities",
                href: buildHref({article: "utilities-ko"}),
                visible: ko.observable(true)
            }]
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