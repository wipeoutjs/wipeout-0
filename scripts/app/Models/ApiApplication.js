compiler.registerClass("Wipeout.Docs.Models.ApiApplication", "wo.object", function() {
    
    var staticContructor = function() {
        if(window.wipeoutApi) return;
                        
        //wipeout.profile.profile();
        
        wipeoutApi = new Wipeout.Docs.Models.Components.ApiBuilder(wipeout, "wipeout")
            .build({
                knownParents: [{key:"ko.templateEngine", value: ko.templateEngine}], 
                filter: function(i) {
                    return i.key.indexOf("wipeout.debug") !== 0 && i.key.indexOf("wipeout.profile") !== 0;
                }
            });     
         
        woApi = new Wipeout.Docs.Models.Components.ApiBuilder(wo, "wo").build();     
    };
    
    ApiApplication.routableUrl = function(item) {
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
    
    ApiApplication.getModel = function(modelPointer) {
        if(!modelPointer) return null;
                
        switch (modelPointer.type) {
            case "api":
                return ApiApplication.getApiModel(modelPointer);             
        }
        
        return null;
    };
    
    parseBool = function(item) {
        return item && item.toLowerCase() !== "false";
    }
    
    ApiApplication.getApiModel = function(modelPointer) {
        
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
    
    ApiApplication.getSubBranches = function(classDescription) {        
        
        var output = [];
        
        enumerate(classDescription.staticEvents, function(event) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(event.eventName, ApiApplication.routableUrl(event)));            
        });
        
        enumerate(classDescription.staticProperties, function(property) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(property.propertyName, ApiApplication.routableUrl(property)));
        });
        
        enumerate(classDescription.staticFunctions, function(_function) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(_function.functionName, ApiApplication.routableUrl(_function)));
        });
        
        enumerate(classDescription.events, function(event) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(event.eventName, ApiApplication.routableUrl(event)));            
        });
        
        enumerate(classDescription.properties, function(property) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(property.propertyName, ApiApplication.routableUrl(property)));            
        });
        
        enumerate(classDescription.functions, function(_function) {
            output.push(new Wipeout.Docs.Models.Components.TreeViewBranch(_function.functionName, ApiApplication.routableUrl(_function)));            
        });
        
        output.sort(function() { return arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    ApiApplication.treeViewBranchFor = function(api, classFullName) {
        var friendlyName = classFullName.split(".");
        friendlyName = friendlyName[friendlyName.length - 1];
        
        var definition = api.forClass(classFullName);
        for (var i = definition.staticProperties.length - 1; i >= 0; i--)
            if(definition.staticProperties[i].name === "__woName")
                definition.staticProperties.splice(i, 1);
        
        return new Wipeout.Docs.Models.Components.TreeViewBranch(
            friendlyName, 
            ApiApplication.routableUrl(definition), 
            ApiApplication.getSubBranches(definition));
    };
    
    function ApiApplication() {
        staticContructor();
        
        this._super();
        
        this.content = ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());
        var _wipeout = new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", null, [
            new Wipeout.Docs.Models.Components.TreeViewBranch("base", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.contentControl"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.disposable"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.event"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.if"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.itemsControl"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.object"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEvent"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEventArgs"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEventModel"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.routedEventRegistration"),                
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.view"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.base.visual")
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("bindings", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.bindingBase"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.ic-render"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.itemsControl"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.render"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.wipeout"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.wipeout-type"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.bindings.wo")
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("template", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.asyncLoader"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.engine"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.template.htmlBuilder")
            ]),
            new Wipeout.Docs.Models.Components.TreeViewBranch("utils", null, [
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.bindingDomManipulationWorker"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.call"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.domData"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.domManipulationWorkerBase"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.find"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.html"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.htmlAsync"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.ko"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.mutationObserverDomManipulationWorker"),
                ApiApplication.treeViewBranchFor(wipeoutApi, "wipeout.utils.obj")
            ])
        ]);
        
        var _wo = new Wipeout.Docs.Models.Components.TreeViewBranch("wo", null, [
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.bindingDomManipulationWorker"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.call"),
            ApiApplication.treeViewBranchFor(woApi, "wo.contentControl"),
            ApiApplication.treeViewBranchFor(woApi, "wo.disposable"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.domData"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.domManipulationWorkerBase"),
            ApiApplication.treeViewBranchFor(woApi, "wo.event"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.find"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.html"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.htmlAsync"),
            ApiApplication.treeViewBranchFor(woApi, "wo.if"),
            ApiApplication.treeViewBranchFor(woApi, "wo.itemsControl"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.ko"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.mutationObserverDomManipulationWorker"),
            ApiApplication.treeViewBranchFor(wipeoutApi, "wo.obj"),
            ApiApplication.treeViewBranchFor(woApi, "wo.object"),
            ApiApplication.treeViewBranchFor(woApi, "wo.routedEvent"),
            ApiApplication.treeViewBranchFor(woApi, "wo.routedEventArgs"),
            ApiApplication.treeViewBranchFor(woApi, "wo.routedEventModel"),
            ApiApplication.treeViewBranchFor(woApi, "wo.routedEventRegistration"),                
            ApiApplication.treeViewBranchFor(woApi, "wo.view"),
            ApiApplication.treeViewBranchFor(woApi, "wo.visual")
        ]);
        
        this.menu = new Wipeout.Docs.Models.Components.TreeViewBranch("API", null, [
            _wo,
            _wipeout
        ]);
    };
    
    return ApiApplication;
});