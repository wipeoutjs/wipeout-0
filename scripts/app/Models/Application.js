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
        var bindingBasePage = null;
        var renderPage = null;
        var wipeout_typePage = null;
        var _woPage = null;
        var _wipeoutPage = null;
        var _icRenderPage = null;
                
        // bindings
        /*var _bindings = (function() {
            
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
        })();*/
                                     
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
                            
                var disposableBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("disposable", currentApi.forClass("wo.disposable"));
                var eventRegistrationBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("eventRegistration", currentApi.forClass("wo.eventRegistration"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("base", [
                    contentControlBranch,
                    disposableBranch,
                    eventBranch,
                    eventRegistrationBranch,
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
                
                bindingBasePage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("bindingBase", currentApi.forClass("wipeout.bindings.bindingBase"));
                itemsControlPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wipeout.bindings.itemsControl"));
                renderPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render", currentApi.forClass("wipeout.bindings.render"));
                wipeout_typePage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type", currentApi.forClass("wipeout.bindings.wipeout-type"));
                _woPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo", currentApi.forClass("wipeout.bindings.wo"));
                _wipeoutPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout", currentApi.forClass("wipeout.bindings.wipeout"));
                _icRenderPage = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render", currentApi.forClass("wipeout.bindings.ic-render"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", [
                    bindingBasePage,
                    _icRenderPage,
                    itemsControlPage,
                    renderPage,
                    _wipeoutPage,
                    wipeout_typePage,
                    _woPage
                ]);
            })();
            
            var _template = (function() {
                currentApi.forClass("ko.templateEngine");
                var asyncLoader = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("asyncLoader", currentApi.forClass("wipeout.template.asyncLoader"));
                var engine = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine", currentApi.forClass("wipeout.template.engine"));
                var htmlBuilder = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder", currentApi.forClass("wipeout.template.htmlBuilder"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("template", [
                    asyncLoader,
                    engine,
                    htmlBuilder
                ]);
            })();
            
            var _utils = (function() {
                
                //TODO: ko
                
                var domManipulationWorkerBaseBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("domManipulationWorkerBase", currentApi.forClass("wipeout.utils.domManipulationWorkerBase"));
                var bindingDomManipulationWorkerBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("bindingDomManipulationWorker", currentApi.forClass("wipeout.utils.bindingDomManipulationWorker"));
                var callBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("call", currentApi.forClass("wipeout.utils.call"));
                var domDataBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("domData", currentApi.forClass("wipeout.utils.domData"));
                var findBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("find", currentApi.forClass("wipeout.utils.find"));
                var htmlAsyncBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlAsync", currentApi.forClass("wipeout.utils.htmlAsync"));
                var mutationObserverDomManipulationWorkerBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("mutationObserverDomManipulationWorker", currentApi.forClass("wipeout.utils.mutationObserverDomManipulationWorker"));
                var htmlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", currentApi.forClass("wipeout.utils.html"));
                //var koArrayBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wipeout.utils.ko.array"));
                //var koBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wipeout.utils.ko"), {staticProperties: { "array": koArrayBranch}});
                var objBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", currentApi.forClass("wipeout.utils.obj"));
                
                return new Wipeout.Docs.Models.Components.TreeViewBranch("utils", [
                    bindingDomManipulationWorkerBranch,
                    callBranch,
                    domDataBranch,
                    domManipulationWorkerBaseBranch,
                    findBranch,
                    htmlBranch,
                    htmlAsyncBranch,
                    //koBranch,
                    mutationObserverDomManipulationWorkerBranch,
                    objBranch
                ]);
            })(); 
            
            return new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout (debug mode only)", [
                _base,
                _bindingsPage,
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
        
        /*var _features = (function() {     
            
            var skippingABindingContextPage = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Skipping a binding context", "SkippingABindingContextPage");
            skippingABindingContextPage.payload().woInvisible = woInvisibleBranch.payload();
            skippingABindingContextPage.payload().visual = visualBranch.payload();
            skippingABindingContextPage.payload()._if = ifBranch.payload();
            
            
            var oo = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout OO framework", "WipeoutObjectOrientedFrameworkPage");
            oo.payload().object = objectBranch.payload();
            oo.payload()._super = _superBranch.payload();
            oo.payload().extend = extendBranch.payload();
            oo.payload().useVirtualCache = useVirtualCacheBranch.payload();
            oo.payload().clearVirtualCache = clearVirtualCacheBranch.payload();
            
            var binding = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Binding Properties", "BindingPropertiesPage");
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
            woClasses.payload().woInvisible = skippingABindingContextPage.payload();
            
            var woBindings = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout Native Bindings", "WipeoutNativeBindingsPage");
            woBindings.payload().itemsControl = itemsControlPage.payload();
            woBindings.payload().itemsControlClass = itemsControlBranch.payload();
            woBindings.payload().viewClass = viewBranch.payload();
            woBindings.payload().render = renderPage.payload();
            woBindings.payload().wipeout_type = wipeout_typePage.payload();
            woBindings.payload()._wo = _woPage.payload();
            woBindings.payload()._wipeout = _wipeoutPage.payload();
            woBindings.payload()._icRender = _icRenderPage.payload();
            
            var viewModelLifeCycle = new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("View Model Lifecycle", "ViewModelLifecyclePage");
            
            return [oo, woClasses, woBindings, binding, models, skippingABindingContextPage, viewModelLifeCycle];
        })();    */
        
        
        var _helpers = (function() {
            var typecript = new Wipeout.Docs.Models.Components.TextContentTreeViewBranch("Typescript", new Wipeout.Docs.Models.Components.Generators.Typescript().generate(currentApi));
            
            return [typecript];
        })();    
        
        this.menu =
            new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", [
                new Wipeout.Docs.Models.Components.TreeViewBranch("Tutorial", _tutorial),
                //new Wipeout.Docs.Models.Components.TreeViewBranch("Features", _features),
                new Wipeout.Docs.Models.Components.TreeViewBranch("API", [
                   // _wo,
                    //_bindings,
                    _wipeout
                ]),
                new Wipeout.Docs.Models.Components.TreeViewBranch("Helpers", _helpers)
        ]);        
    };
    
    return application;
});