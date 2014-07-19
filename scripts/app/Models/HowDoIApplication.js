compiler.registerClass("Wipeout.Docs.Models.HowDoIApplication", "wo.object", function() {
    
    var buildHref = function(parameters) {
        
        //if(parameters.article && !wo.contentControl.templateExists(parameters.article))
        //    throw "No template for " + parameters.article;
        
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
                href: buildHref({article: "get-started"})
            },
            items: [{
                text: "With knockout",
                href: buildHref({article: "get-started-with-knockout"})
            }, {
                text: "With Hello World",
                href: buildHref({article: "get-started-with-hello-world"})
            }, {
                text: "With custom components",
                href: buildHref({article: "get-started-with-custom-components"})
            }, {
                text: "With lists",
                href: buildHref({article: "get-started-with-lists"})
            }]
        }, {
            header: {
                text: "Bind or set properties",
                href: buildHref({article: "bind-or-set-propertes"})
            },
            items: [{
                text: "Bind to a static value",
                href: buildHref({article: "bind-to-static-value"})
            }, {
                text: "Bind to a property on the view model",
                href: buildHref({article: "bind-in-scope"})
            }, {
                text: "Bind to a property on the model",
                href: buildHref({article: "bind-to-model"})
            }, {
                text: "Bind to a property on the parent's view model",
                href: buildHref({article: "bind-to-parents-view-model"})
            }, {
                text: "Set the model from the parent's model",
                href: buildHref({article: "bind-to-parents-model"})
            }, {
                text: "Cascading models",
                href: buildHref({article: "cascading-models"})
            }, {
                text: "Two way bindings",
                href: buildHref({article: "bind-two-way"})
            }, {
                text: "Bind to a global value",
                href: buildHref({article: "bind-to-global"})
            }, {
                text: "Set properties using XML elements",
                href: buildHref({article: "bind-with-elements"})
            }, {
                text: "Bind in javascript code",
                href: buildHref({article: "bind-in-code"})
            }, {
                text: "Find an ancestor to bind to",
                href: buildHref({article: "bind-to-ancestor"})
            }, {
                text: "Call a method on a view model",
                href: buildHref({article: "call-a-method"})
            }, {
                text: "Call a method on another object",
                href: buildHref({article: "call-method-out-of-scope"})
            }]
        }, {
            header: {
                text: "Use the wipeout OO framework",
                href: buildHref({article: "wipeout-oo"})
            },
            items: [{
                text: "Inheritance",
                href: buildHref({article: "inheritance"})
            }, {
                text: "Overriding methods",
                href: buildHref({article: "overriding-methods"})
            }, {
                text: "Another extend syntax",
                href: buildHref({article: "another-extend-syntax"})
            }, {
                text: "Virtual method cache",
                href: buildHref({article: "virtual-method-cache"})
            }, {
                text: "Strict mode",
                href: buildHref({article: "strict-mode"})
            }]
        }, {
            header: {
                text: "Use the model layer",
                href: buildHref({article: "models"})
            },
            items: []
        }, {
            header: {
                text: "Use templates",
                href: buildHref({article: "templates"})
            },
            items: [{
                text: "template id",
                href: buildHref({article: "template-id"})
            }, {
                text: "Referencing items in a template",
                href: buildHref({article: "referencing-items-in-a-template"})
            }, {
                text: "Asynchronus templates",
                href: buildHref({article: "asynchronous-templates"})
            }, {
                text: "wo.contentControl",
                href: buildHref({article: "templates-content-control"})
            }]
        }, {
            header: {
                text: "Work wih lists",
                href: buildHref({article: "working-with-lists"})
            },
            items: [{
                text: "Setting the list template",
                href: buildHref({article: "items-control-list-template"})
            }, {
                text: "List item lifecycle",
                href: buildHref({article: "items-control-item-lifecycle"})
            }, {
                text: "Creating custom list items",
                href: buildHref({article: "items-control-custom-items"})
            }, {
                text: "Self removing items",
                href: buildHref({article: "items-control-self-removing-items"})
            }]
        }, {
            header: {
                text: "Use the if control",
                href: buildHref({article: "if-control"})
            },
            items: []
        }, {
            header: {
                text: "Work with events",
                href: buildHref({article: "events"})
            },
            items: [{
                text: "Advanced events",
                href: buildHref({article: "advanced-events"})
            }]
        }/*, {
            header: {
                text: "Work with routed events",
                href: buildHref({article: "routed-events"})
            },
            items: [{
                text: "Advanced events",
                href: buildHref({article: "advanced-events"})
            }]
        }*/];
    };
    
    return HowDoIApplication;
});