compiler.registerClass("Wipeout.Docs.Models.Application", "wo.object", function() {
    
    return function() {
        
        this.content = ko.observable(new landingPage());
        
        var currentApi = new Wipeout.Docs.Models.Components.Api();
                
        //wo
        var _wo = (function() {
            var objectBranch = new classTreeViewBranch("object", currentApi.forClass("wo.object"));
            var routedEventModelBranch = new classTreeViewBranch("routedEventModel", currentApi.forClass("wo.routedEventModel"));
            var visualBranch = new classTreeViewBranch("visual", currentApi.forClass("wo.visual"));
            var viewBranch = new classTreeViewBranch("view", currentApi.forClass("wo.view"));
            var contentControlBranch = new classTreeViewBranch("contentControl", currentApi.forClass("wo.contentControl"));
            var ifBranch = new classTreeViewBranch("if", currentApi.forClass("wo.if"));
            var itemsControlBranch = new classTreeViewBranch("itemsControl", currentApi.forClass("wo.itemsControl"));
            var eventBranch = new classTreeViewBranch("event", currentApi.forClass("wo.event"));
            var routedEventBranch = new classTreeViewBranch("routedEvent", currentApi.forClass("wo.routedEvent"));
            var routedEventArgsBranch = new classTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs"));
            var routedEventRegistrationBranch = new classTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration"));
            
            var htmlBranch = new classTreeViewBranch("html", currentApi.forClass("wo.html"));
            var koVirtualElementsBranch = new classTreeViewBranch("virtualElements", currentApi.forClass("wo.ko.virtualElements"));
            var koBranch = new classTreeViewBranch("ko", currentApi.forClass("wo.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch}});
            var objBranch = new classTreeViewBranch("obj", currentApi.forClass("wo.obj"));
            
            return new treeViewBranch("wo", [
                contentControlBranch,
                eventBranch,
                ifBranch,
                htmlBranch,
                itemsControlBranch,
                koBranch,
                objBranch,
                objectBranch,
                routedEventBranch,
                routedEventArgsBranch,
                routedEventModelBranch,
                routedEventRegistrationBranch,
                viewBranch,
                visualBranch
            ]);
        })();
        
        // bindings
        var _bindings = (function() {
            
            var itemsControl = new classTreeViewBranch("itemsControl", currentApi.forClass("wipeout.bindings.itemsControl"));
            var render = new classTreeViewBranch("render", currentApi.forClass("wipeout.bindings.render"));
            var wipeout_type = new classTreeViewBranch("wipeout-type", currentApi.forClass("wipeout.bindings.wipeout-type"));
            var _wo = new classTreeViewBranch("wo", currentApi.forClass("wipeout.bindings.wo"));
            var _wipeout = new classTreeViewBranch("wipeout", currentApi.forClass("wipeout.bindings.wipeout"));
            var _icRender = new classTreeViewBranch("ic-render", currentApi.forClass("wipeout.bindings.ic-render"));
            
            return new treeViewBranch("bindings", [
                _icRender,
                itemsControl,
                render,
                wipeout_type,
                _wo,
                _wipeout
            ]);
        })();
                                     
        //wipeout
        var _wipeout = (function() {
            
            var _base = (function() {
                var objectBranch = new classTreeViewBranch("object", currentApi.forClass("wo.object"));
                var routedEventModelBranch = new classTreeViewBranch("routedEventModel", currentApi.forClass("wo.routedEventModel"));
                var visualBranch = new classTreeViewBranch("visual", currentApi.forClass("wo.visual"));
                var viewBranch = new classTreeViewBranch("view", currentApi.forClass("wo.view"));
                var contentControlBranch = new classTreeViewBranch("contentControl", currentApi.forClass("wo.contentControl"));
                var ifBranch = new classTreeViewBranch("if", currentApi.forClass("wo.if"));
                var itemsControlBranch = new classTreeViewBranch("itemsControl", currentApi.forClass("wo.itemsControl"));
                var eventBranch = new classTreeViewBranch("event", currentApi.forClass("wo.event"));
                var routedEventBranch = new classTreeViewBranch("routedEvent", currentApi.forClass("wo.routedEvent"));
                var routedEventArgsBranch = new classTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs"));
                var routedEventRegistrationBranch = new classTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration"));
                
                return new treeViewBranch("base", [
                    contentControlBranch,
                    eventBranch,
                    ifBranch,
                    itemsControlBranch,
                    objectBranch,
                    routedEventBranch,
                    routedEventArgsBranch,
                    routedEventModelBranch,
                    routedEventRegistrationBranch,
                    viewBranch,
                    visualBranch
                ]);
            })();
            
            var _bindings = (function() {
                
                var itemsControl = new classTreeViewBranch("itemsControl", currentApi.forClass("wipeout.bindings.itemsControl"));
                var render = new classTreeViewBranch("render", currentApi.forClass("wipeout.bindings.render"));
                var wipeout_type = new classTreeViewBranch("wipeout-type", currentApi.forClass("wipeout.bindings.wipeout-type"));
                var _wo = new classTreeViewBranch("wo", currentApi.forClass("wipeout.bindings.wo"));
                var _wipeout = new classTreeViewBranch("wipeout", currentApi.forClass("wipeout.bindings.wipeout"));
                var _icRender = new classTreeViewBranch("ic-render", currentApi.forClass("wipeout.bindings.ic-render"));
                
                return new treeViewBranch("bindings", [
                    _icRender,
                    itemsControl,
                    render,
                    wipeout_type,
                    _wo,
                    _wipeout
                ]);
            })();
            
            var _template = (function() {
                currentApi.forClass("ko.templateEngine");
                var engine = new classTreeViewBranch("engine", currentApi.forClass("wipeout.template.engine"));
                var htmlBuilder = new classTreeViewBranch("htmlBuilder", currentApi.forClass("wipeout.template.htmlBuilder"));
                
                return new treeViewBranch("template", [
                    engine,
                    htmlBuilder
                ]);
            })();
            
            var _utils = (function() {
                
                var htmlBranch = new classTreeViewBranch("html", currentApi.forClass("wipeout.utils.html"));
                var koVirtualElementsBranch = new classTreeViewBranch("virtualElements", currentApi.forClass("wipeout.utils.ko.virtualElements"));
                var koBranch = new classTreeViewBranch("ko", currentApi.forClass("wipeout.utils.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch}});
                var objBranch = new classTreeViewBranch("obj", currentApi.forClass("wipeout.utils.obj"));
                
                return new treeViewBranch("utils", [
                    htmlBranch,
                    koBranch,
                    objBranch
                ]);
            })();
            
            return new treeViewBranch("wipeout (debug mode only)", [
                _base,
                _bindings,
                _template,
                _utils
            ]);
        })();
        
        this.menu =
            new treeViewBranch("wipeout", [
                new treeViewBranch("API", [
                    _wo,
                    _bindings,
                    _wipeout
                ])
        ]);        
    };
});