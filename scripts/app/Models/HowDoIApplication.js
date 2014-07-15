compiler.registerClass("Wipeout.Docs.Models.HowDoIApplication", "wo.object", function() {
    
    var buildHref = function(parameters) {
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
                text: "Bind in javascript code",
                href: buildHref({article: "bind-in-code"})
            }, {
                text: "Find an ancestor to bind to",
                href: buildHref({article: "bind-to-ancestor"})
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
                text: "Virtual method cache",
                href: buildHref({article: "virtual-method-cache"})
            }, {
                text: "Strict mode",
                href: buildHref({article: "strict-mode"})
            }]
        }];
    };
    
    return HowDoIApplication;
});