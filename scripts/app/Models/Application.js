compiler.registerClass("Wipeout.Docs.Models.Application", "wo.object", function() {
    
    var staticContructor = function() {
        if(window.wipeoutApi) return;
                
        wipeoutApi = new Wipeout.Docs.Models.Components.ApiBuilder(wipeout, "wipeout")
            .build({
                knownParents: [{key:"ko.templateEngine", value: ko.templateEngine}], 
                filter: function(i) {
                    return i.key.indexOf("wipeout.debug") !== 0 && i.key.indexOf("wipeout.profile") !== 0;
                }
            });
        
        Wipeout.Docs.Models.Descriptions.Class.prototype.$routableUrl = function() {
            return "type=api&className=" + this.classFullName;
        };
        
        Wipeout.Docs.Models.Descriptions.Event.prototype.$routableUrl = function() {
            return "type=api&className=" + this.classFullName + "&eventName=" + this.eventName + "&isStatic=" + this.isStatic;
        };
        
        Wipeout.Docs.Models.Descriptions.Property.prototype.$routableUrl = function() {
            return "type=api&className=" + this.classFullName + "&propertyName=" + this.propertyName + "&isStatic=" + this.isStatic;
        };
        
        Wipeout.Docs.Models.Descriptions.Function.prototype.$routableUrl = function() {
            return "type=api&className=" + this.classFullName + "&functionName=" + this.functionName + "&isStatic=" + this.isStatic;
        };
        
        Wipeout.Docs.Models.Pages.LandingPage.prototype.$routableUrl = function() {
            return "type=Home";
        };
    };
    
    application.getModel = function(modelPointer) {
        if(!modelPointer) return null;
                
        switch (modelPointer.type) {
            case "api":
                return application.getApiModel(modelPointer);             
        }
        
        return null;
    };
    
    parseBool = function(item) {
        return item && item.toLowerCase() !== "false";
    }
    
    application.getApiModel = function(modelPointer) {
        
        var _class = wipeoutApi.forClass(modelPointer.className);
        if(_class) {
            if(modelPointer.eventName)
                return _class.getEvent(modelPointer.eventName, parseBool(modelPointer.isStatic));
            if(modelPointer.propertyName)
                return _class.getProperty(modelPointer.propertyName, parseBool(modelPointer.isStatic));
            if(modelPointer.functionName)
                return _class.getFunction(modelPointer.functionName, parseBool(modelPointer.isStatic));
        }
        
        return _class;        
    };
    
    function application() {
        staticContructor();
        
        this.content = ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());
        
        var _wipeout = new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", [
            new Wipeout.Docs.Models.Components.TreeViewBranch("base", [
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl", wipeoutApi.forClass("wipeout.base.contentControl")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("disposable", wipeoutApi.forClass("wipeout.base.disposable")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event", wipeoutApi.forClass("wipeout.base.event")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if", wipeoutApi.forClass("wipeout.base.if")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", wipeoutApi.forClass("wipeout.base.itemsControl")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object", wipeoutApi.forClass("wipeout.base.object")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent", wipeoutApi.forClass("wipeout.base.routedEvent")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs", wipeoutApi.forClass("wo.routedEventArgs")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel", wipeoutApi.forClass("wipeout.base.routedEventModel")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration", wipeoutApi.forClass("wo.routedEventRegistration")),                
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view", wipeoutApi.forClass("wipeout.base.view")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual", wipeoutApi.forClass("wipeout.base.visual"))
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", [
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("bindingBase", wipeoutApi.forClass("wipeout.bindings.bindingBase")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render", wipeoutApi.forClass("wipeout.bindings.ic-render")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl", wipeoutApi.forClass("wipeout.bindings.itemsControl")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render", wipeoutApi.forClass("wipeout.bindings.render")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout", wipeoutApi.forClass("wipeout.bindings.wipeout")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type", wipeoutApi.forClass("wipeout.bindings.wipeout-type")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo", wipeoutApi.forClass("wipeout.bindings.wo"))
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("template", [
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("asyncLoader", wipeoutApi.forClass("wipeout.template.asyncLoader")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine", wipeoutApi.forClass("wipeout.template.engine")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder", wipeoutApi.forClass("wipeout.template.htmlBuilder"))
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("utils", [
                //TODO: ko
                
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("bindingDomManipulationWorker", wipeoutApi.forClass("wipeout.utils.bindingDomManipulationWorker")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("call", wipeoutApi.forClass("wipeout.utils.call")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("domData", wipeoutApi.forClass("wipeout.utils.domData")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("domManipulationWorkerBase", wipeoutApi.forClass("wipeout.utils.domManipulationWorkerBase")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("find", wipeoutApi.forClass("wipeout.utils.find")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlAsync", wipeoutApi.forClass("wipeout.utils.htmlAsync")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("mutationObserverDomManipulationWorker", wipeoutApi.forClass("wipeout.utils.mutationObserverDomManipulationWorker")),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", wipeoutApi.forClass("wipeout.utils.html")),
                //new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wipeout.utils.ko.array")),
                //new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wipeout.utils.ko"), {staticProperties: { "array": koArrayBranch}}),
                new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", wipeoutApi.forClass("wipeout.utils.obj"))
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
            var typecript = new Wipeout.Docs.Models.Components.TextContentTreeViewBranch("Typescript", new Wipeout.Docs.Models.Components.Generators.Typescript().generate(wipeoutApi));
            
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