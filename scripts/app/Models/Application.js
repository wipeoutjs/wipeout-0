compiler.registerClass("Wipeout.Docs.Models.Application", "wo.object", function() {
    
    application.prototype.back = function() {
        if(this.contentCacheIndex < 1)
            return;
        
        try {
            this.doNotCacheContent = true;
            this.contentCacheIndex--;
            this.content(this.contentCache[this.contentCacheIndex]);
        } finally {
            this.doNotCacheContent = false;
        }
    };
    
    application.prototype.forward = function() {
        if(this.contentCacheIndex >= this.contentCache.length)
            return;
        
        try {
            this.doNotCacheContent = true;
            this.contentCacheIndex++;
            this.content(this.contentCache[this.contentCacheIndex]);
        } finally {
            this.doNotCacheContent = false;
        }
    };
    
    function application() {
        
        this.content = ko.observable();
        this.content.subscribe(function(newVal) {
            if(this.doNotCacheContent) return;
            
            this.contentCacheIndex++;
            this.contentCache.length = this.contentCacheIndex;
            this.contentCache.push(newVal);
        }, this);
        
        this.contentCacheIndex = -1;
        this.doNotCacheContent = false;
        this.contentCache = [];
        this.content(new Wipeout.Docs.Models.Pages.LandingPage());
        
        var currentApi = new Wipeout.Docs.Models.Components.Api();
             
        var bindFunction = null;
        var objectBranch = null;
        var extendBranch = null;
        var _superBranch = null;
        var useVirtualCacheBranch = null;
        var clearVirtualCacheBranch = null;
        var visualBranch = null;
        var viewBranch = null;
        var contentControlBranch = null;
        var ifBranch = null;
        var itemsControlBranch = null;
        var routedEventModelBranch = null;
        var woInvisibleBranch = null;
        
        var itemsControlPage = null;
        var renderPage = null;
        var wipeout_typePage = null;
        var _woPage = null;
        var _wipeoutPage = null;
        var _icRenderPage = null;
        
        //wo
        var _wo = (function() {
            objectBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object", currentApi.forClass("wo.object"));
            for(var i = 0, ii = objectBranch.branches.length; i < ii; i++) {
                if(objectBranch.branches[i].name === "_super") {
                    _superBranch = objectBranch.branches[i];
                    break;
                }
            }
            for(var i = 0, ii = objectBranch.branches.length; i < ii; i++) {
                if(objectBranch.branches[i].name === "extend") {
                    extendBranch = objectBranch.branches[i];
                    break;
                }
            }
            for(var i = 0, ii = objectBranch.branches.length; i < ii; i++) {
                if(objectBranch.branches[i].name === "useVirtualCache") {
                    useVirtualCacheBranch = objectBranch.branches[i];
                    break;
                }
            }
            for(var i = 0, ii = objectBranch.branches.length; i < ii; i++) {
                if(objectBranch.branches[i].name === "clearVirtualCache") {
                    clearVirtualCacheBranch = objectBranch.branches[i];
                    break;
                }
            }
            
            routedEventModelBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel", currentApi.forClass("wo.routedEventModel"));
            visualBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual", currentApi.forClass("wo.visual"));
            for(var i = 0, ii = visualBranch.branches.length; i < ii; i++) {
                if(visualBranch.branches[i].name === "woInvisible") {
                    woInvisibleBranch = visualBranch.branches[i];
                    break;
                }
            }
            
            viewBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view", currentApi.forClass("wo.view"));
            contentControlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl", currentApi.forClass("wo.contentControl"));
            ifBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if", currentApi.forClass("wo.if"));
            itemsControlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wo.itemsControl"));
            var eventBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event", currentApi.forClass("wo.event"));
            var routedEventBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent", currentApi.forClass("wo.routedEvent"));
            var routedEventArgsBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs"));
            var routedEventRegistrationBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration"));
            
            var htmlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", currentApi.forClass("wo.html"));
            var koVirtualElementsBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements", currentApi.forClass("wo.ko.virtualElements"));
            var koArrayBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wo.ko.array"));
            var koBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wo.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch, "array": koArrayBranch}});
            var objBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", currentApi.forClass("wo.obj"));
            
            for(var i = 0, ii = viewBranch.branches.length; i < ii; i++) {
                if(viewBranch.branches[i].name === "bind") {
                    bindFunction = viewBranch.branches[i];
                    break;
                }
            }
            
            return new Wipeout.Docs.Models.Components.TreeViewBranch("wo", [
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
            
            var itemsControl = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wipeout.bindings.itemsControl"));
            var render = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render", currentApi.forClass("wipeout.bindings.render"));
            var wipeout_type = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type", currentApi.forClass("wipeout.bindings.wipeout-type"));
            var _wo = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo", currentApi.forClass("wipeout.bindings.wo"));
            var _wipeout = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout", currentApi.forClass("wipeout.bindings.wipeout"));
            var _icRender = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render", currentApi.forClass("wipeout.bindings.ic-render"));
            
            return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", [
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
                var objectBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object", currentApi.forClass("wo.object"));
                var routedEventModelBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel", currentApi.forClass("wo.routedEventModel"));
                var visualBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual", currentApi.forClass("wo.visual"));
                var viewBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view", currentApi.forClass("wo.view"));
                var contentControlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl", currentApi.forClass("wo.contentControl"));
                var ifBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if", currentApi.forClass("wo.if"));
                var itemsControlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wo.itemsControl"));
                var eventBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event", currentApi.forClass("wo.event"));
                var routedEventBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent", currentApi.forClass("wo.routedEvent"));
                var routedEventArgsBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs"));
                var routedEventRegistrationBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("base", [
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
            
            var _bindingsPage = (function() {
                
                itemsControlPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wipeout.bindings.itemsControl"));
                renderPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render", currentApi.forClass("wipeout.bindings.render"));
                wipeout_typePage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type", currentApi.forClass("wipeout.bindings.wipeout-type"));
                _woPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo", currentApi.forClass("wipeout.bindings.wo"));
                _wipeoutPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout", currentApi.forClass("wipeout.bindings.wipeout"));
                _icRenderPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render", currentApi.forClass("wipeout.bindings.ic-render"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", [
                    _icRenderPage,
                    itemsControlPage,
                    renderPage,
                    wipeout_typePage,
                    _woPage,
                    _wipeoutPage
                ]);
            })();
            
            var _template = (function() {
                currentApi.forClass("ko.templateEngine");
                var engine = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine", currentApi.forClass("wipeout.template.engine"));
                var htmlBuilder = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder", currentApi.forClass("wipeout.template.htmlBuilder"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("template", [
                    engine,
                    htmlBuilder
                ]);
            })();
            
            var _utils = (function() {
                
                var htmlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", currentApi.forClass("wipeout.utils.html"));
                var koVirtualElementsBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements", currentApi.forClass("wipeout.utils.ko.virtualElements"));
                var koArrayBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wipeout.utils.ko.array"));
                var koBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wipeout.utils.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch, "array": koArrayBranch}});
                var objBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", currentApi.forClass("wipeout.utils.obj"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("utils", [
                    htmlBranch,
                    koBranch,
                    objBranch
                ]);
            })();
            
            return new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout (debug mode only)", [
                _base,
                _bindings,
                _template,
                _utils
            ]);
        })();
        
        var _tutorial = (function() {            
            var intro = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Introduction", "IntroductionPage");
            var hello = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Hello Wipeout", "HelloWipeoutPage");
            var cmplx = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("A more complex example", "AMoreComplexExamplePage");
            cmplx.payload().intro = intro.payload();
            cmplx.payload().hello = hello.payload();

            var anApp = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Lets build an app", "LetsBuildAnPppPage");
            
            return [intro, hello, cmplx, anApp];
        })();
        
        var _features = (function() {     
            var oo = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout OO framework", "WipeoutObjectOrientedFrameworkPage");
            oo.payload().object = objectBranch.payload();
            oo.payload()._super = _superBranch.payload();
            oo.payload().extend = extendBranch.payload();
            oo.payload().useVirtualCache = useVirtualCacheBranch.payload();
            oo.payload().clearVirtualCache = clearVirtualCacheBranch.payload();
            
            var binding = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Binding", "BindingPage");
            binding.payload().bindFunction = bindFunction.payload();
            
            var models = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Models", "ModelsPage");
            
            var woClasses = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout Native Classes", "WipeoutNativeClassesPage");
            woClasses.payload().object = objectBranch.payload();
            woClasses.payload().routedEventModel = routedEventModelBranch.payload();
            woClasses.payload().visual = visualBranch.payload();
            woClasses.payload().view = viewBranch.payload();
            woClasses.payload().contentControl = contentControlBranch.payload();
            woClasses.payload()._if = ifBranch.payload();
            woClasses.payload().itemsControl = itemsControlBranch.payload();
            woClasses.payload().woInvisible = woInvisibleBranch.payload();
            
            var woBindings = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout Native Bindings", "WipeoutNativeBindingsPage");
            woBindings.payload().itemsControl = itemsControlPage.payload();
            woBindings.payload().itemsControlClass = itemsControlBranch.payload();
            woBindings.payload().viewClass = viewBranch.payload();
            woBindings.payload().render = renderPage.payload();
            woBindings.payload().wipeout_type = wipeout_typePage.payload();
            woBindings.payload()._wo = _woPage.payload();
            woBindings.payload()._wipeout = _wipeoutPage.payload();
            woBindings.payload()._icRender = _icRenderPage.payload();
            
            return [oo, woClasses, woBindings, binding, models];
        })();        
        
        this.menu =
            new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", [
                new Wipeout.Docs.Models.Components.TreeViewBranch("Tutorial", _tutorial),
                new Wipeout.Docs.Models.Components.TreeViewBranch("Features", _features),
                new Wipeout.Docs.Models.Components.TreeViewBranch("API", [
                    _wo,
                    _bindings,
                    _wipeout
                ])
        ]);        
    };
    
    return application;
});