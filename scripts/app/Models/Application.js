compiler.registerClass("Wipeout.Docs.Models.Application", "wo.object", function() {
    
    function application() {
        debugger;
        var currentApi = new Wipeout.Docs.Models.Components.ApiBuilder(wipeout, "wipeout")
            .build({
                knownParents: [{key:"ko.templateEngine", value: ko.templateEngine}], 
                filter: function(i) {
                    return i.key.indexOf("wipeout.debug") !== 0 && i.key.indexOf("wipeout.profile") !== 0;
                }
            });
        
        this.content = ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());
        
        var _wipeout = new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", [
            new Wipeout.Docs.Models.Components.TreeViewBranch("base", [
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl", currentApi.forClass("wipeout.base.contentControl")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("disposable", currentApi.forClass("wipeout.base.disposable")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event", currentApi.forClass("wipeout.base.event")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if", currentApi.forClass("wipeout.base.if")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wipeout.base.itemsControl")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object", currentApi.forClass("wipeout.base.object")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent", currentApi.forClass("wipeout.base.routedEvent")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel", currentApi.forClass("wipeout.base.routedEventModel")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration")),                
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view", currentApi.forClass("wipeout.base.view")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual", currentApi.forClass("wipeout.base.visual"))
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", [
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("bindingBase", currentApi.forClass("wipeout.bindings.bindingBase")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render", currentApi.forClass("wipeout.bindings.ic-render")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", currentApi.forClass("wipeout.bindings.itemsControl")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render", currentApi.forClass("wipeout.bindings.render")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout", currentApi.forClass("wipeout.bindings.wipeout")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type", currentApi.forClass("wipeout.bindings.wipeout-type")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo", currentApi.forClass("wipeout.bindings.wo"))
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("template", [
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("asyncLoader", currentApi.forClass("wipeout.template.asyncLoader")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine", currentApi.forClass("wipeout.template.engine")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder", currentApi.forClass("wipeout.template.htmlBuilder"))
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("utils", [
                //TODO: ko
                
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("bindingDomManipulationWorker", currentApi.forClass("wipeout.utils.bindingDomManipulationWorker")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("call", currentApi.forClass("wipeout.utils.call")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("domData", currentApi.forClass("wipeout.utils.domData")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("domManipulationWorkerBase", currentApi.forClass("wipeout.utils.domManipulationWorkerBase")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("find", currentApi.forClass("wipeout.utils.find")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlAsync", currentApi.forClass("wipeout.utils.htmlAsync")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("mutationObserverDomManipulationWorker", currentApi.forClass("wipeout.utils.mutationObserverDomManipulationWorker")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", currentApi.forClass("wipeout.utils.html")),
                //new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wipeout.utils.ko.array")),
                //new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wipeout.utils.ko"), {staticProperties: { "array": koArrayBranch}}),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", currentApi.forClass("wipeout.utils.obj"))
            ])
        ]);
        
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