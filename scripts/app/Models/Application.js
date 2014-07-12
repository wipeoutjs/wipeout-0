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
         
        woApi = new Wipeout.Docs.Models.Components.ApiBuilder(wo, "wo").build();     
    };
    
    application.routableUrl = function(item) {
        if(item instanceof Wipeout.Docs.Models.Descriptions.Class)
            output = "type=api&className=" + item.classFullName;
        else if(item instanceof Wipeout.Docs.Models.Descriptions.Event)
            output = "type=api&className=" + item.classFullName + "&eventName=" + item.eventName + "&isStatic=" + item.isStatic;
        else if(item instanceof Wipeout.Docs.Models.Descriptions.Property)
            output = "type=api&className=" + item.classFullName + "&propertyName=" + item.propertyName + "&isStatic=" + item.isStatic;
        else if(item instanceof Wipeout.Docs.Models.Descriptions.Function)
            output = "type=api&className=" + item.classFullName + "&functionName=" + item.functionName + "&isStatic=" + item.isStatic;
        else if(item instanceof Wipeout.Docs.Models.Descriptions.Class)
            output = "type=Home";
        else
            throw "Unknown page type";
        
        return location.origin + location.pathname + "?" + output;
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
        
        var api = modelPointer.className.indexOf("wipeout") === 0 ?
            wipeoutApi :
            (modelPointer.className.indexOf("wo") === 0 ? woApi : null);
        
        var _class = api.forClass(modelPointer.className);
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
    
    application.getSubBranches = function(classDescription) {        
        
        var output = [];
        
        enumerate(classDescription.staticEvents, function(event) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(event.eventName, application.routableUrl(event)));            
        });
        
        enumerate(classDescription.staticProperties, function(property) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(property.propertyName, application.routableUrl(property)));
        });
        
        enumerate(classDescription.staticFunctions, function(_function) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(_function.functionName, application.routableUrl(_function)));
        });
        
        enumerate(classDescription.events, function(event) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(event.eventName, application.routableUrl(event)));            
        });
        
        enumerate(classDescription.properties, function(property) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(property.propertyName, application.routableUrl(property)));            
        });
        
        enumerate(classDescription.functions, function(_function) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(_function.functionName, application.routableUrl(_function)));            
        });
        
        output.sort(function() { return arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    application.treeViewBranchFor = function(api, classFullName) {
        var friendlyName = classFullName.split(".");
        friendlyName = friendlyName[friendlyName.length - 1];
        
        var definition = api.forClass(classFullName);
        return new Wipeout.Docs.Models.Components.TreeViewBranch(
            friendlyName, 
            application.routableUrl(definition), 
            application.getSubBranches(definition));
    };
    
    function application() {
        staticContructor();
        
        this.content = ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());
        var _wipeout = new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", null, [
            new Wipeout.Docs.Models.Components.TreeViewBranch("base", null, [
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.contentControl"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.disposable"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.event"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.if"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.itemsControl"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.object"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEvent"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEventArgs"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEventModel"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEventRegistration"),                
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.view"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.base.visual")
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", null, [
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.bindingBase"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.ic-render"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.itemsControl"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.render"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.wipeout"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.wipeout-type"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.bindings.wo")
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("template", null, [
                application.treeViewBranchFor(wipeoutApi, "wipeout.template.asyncLoader"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.template.engine"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.template.htmlBuilder")
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("utils", null, [
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.bindingDomManipulationWorker"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.call"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.domData"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.domManipulationWorkerBase"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.find"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.html"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.htmlAsync"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.ko"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.mutationObserverDomManipulationWorker"),
                application.treeViewBranchFor(wipeoutApi, "wipeout.utils.obj")
            ])
        ]);
        
        var _wo = new Wipeout.Docs.Models.Components.TreeViewBranch("wo", null, [
            application.treeViewBranchFor(wipeoutApi, "wo.bindingDomManipulationWorker"),
            application.treeViewBranchFor(wipeoutApi, "wo.call"),
            application.treeViewBranchFor(woApi, "wo.contentControl"),
            application.treeViewBranchFor(woApi, "wo.disposable"),
            application.treeViewBranchFor(wipeoutApi, "wo.domData"),
            application.treeViewBranchFor(wipeoutApi, "wo.domManipulationWorkerBase"),
            application.treeViewBranchFor(woApi, "wo.event"),
            application.treeViewBranchFor(wipeoutApi, "wo.find"),
            application.treeViewBranchFor(wipeoutApi, "wo.html"),
            application.treeViewBranchFor(wipeoutApi, "wo.htmlAsync"),
            application.treeViewBranchFor(woApi, "wo.if"),
            application.treeViewBranchFor(woApi, "wo.itemsControl"),
            application.treeViewBranchFor(wipeoutApi, "wo.ko"),
            application.treeViewBranchFor(wipeoutApi, "wo.mutationObserverDomManipulationWorker"),
            application.treeViewBranchFor(wipeoutApi, "wo.obj"),
            application.treeViewBranchFor(woApi, "wo.object"),
            application.treeViewBranchFor(woApi, "wo.routedEvent"),
            application.treeViewBranchFor(woApi, "wo.routedEventArgs"),
            application.treeViewBranchFor(woApi, "wo.routedEventModel"),
            application.treeViewBranchFor(woApi, "wo.routedEventRegistration"),                
            application.treeViewBranchFor(woApi, "wo.view"),
            application.treeViewBranchFor(woApi, "wo.visual")
        ]);
        
        this.menu = new Wipeout.Docs.Models.Components.TreeViewBranch("API", null, [
            _wo,
            _wipeout
        ]);
    };
    
    return application;
});