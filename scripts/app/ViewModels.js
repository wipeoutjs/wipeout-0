
$.extend(NS("Wipeout.Docs.ViewModels"), (function() {
    
    var application = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Application");
        
        this.registerRoutedEvent(treeViewBranch.renderPage, function (args) {
            this.model().content(args.data);
        }, this);
    });
    
    var treeViewBranch =  wo.view.extend(function() {
        this._super(treeViewBranch.nullTemplate);        
    });
    
    treeViewBranch.branchTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";
    treeViewBranch.leafTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";
    treeViewBranch.nullTemplate = wo.visual.getBlankTemplateId();
    
    treeViewBranch.prototype.modelChanged = function(oldVal, newVal) {
        this._super(oldVal, newVal);
        if(newVal && (newVal.branches || newVal.payload())) {
            this.templateId(treeViewBranch.branchTemplate);
        } else if(newVal) {
            this.templateId(treeViewBranch.leafTemplate);
        } else {
            this.templateId(treeViewBranch.nullTemplate);
        }
    };
    
    treeViewBranch.prototype.select = function() {
        if(this.model().branches)
            $(this.templateItems.content).toggle();
        
        var payload = this.model().payload();
        if ($(this.templateItems.content).filter(":visible").length && payload) {
            this.triggerRoutedEvent(treeViewBranch.renderPage, payload);
        }
    };
    
    treeViewBranch.renderPage = new wo.routedEvent();    
    
    var dynamicRender = wo.contentControl.extend(function() {
        this._super();
        
        this.content = ko.observable();
        
        this.template("<!-- ko render: content --><!-- /ko -->");
    });
    
    dynamicRender.prototype.modelChanged = function(oldVal, newVal) {
        this._super(oldVal, newVal);
               
        var oldVal = this.content();
        try { 
            if(newVal == null) {
                this.content(null);
            } else {
                var newVm = null;
                if(newVal instanceof Wipeout.Docs.Models.Pages.LandingPage) {
                    newVm = new Wipeout.Docs.ViewModels.Pages.LandingPage();
                } else if(newVal instanceof Wipeout.Docs.Models.Descriptions.Class) {
                    newVm = new Wipeout.Docs.ViewModels.Pages.ClassPage();
                } else if(newVal instanceof Wipeout.Docs.Models.Descriptions.Event) {
                    newVm = new Wipeout.Docs.ViewModels.Pages.EventPage();
                } else if(newVal instanceof Wipeout.Docs.Models.Descriptions.Property) {
                    newVm = new Wipeout.Docs.ViewModels.Pages.PropertyPage();
                } else if(newVal instanceof Wipeout.Docs.Models.Descriptions.Function) {
                    newVm = new Wipeout.Docs.ViewModels.Pages.FunctionPage();
                } else {
                    throw "Unknown model type";
                }
                
                newVm.model(newVal);
                this.content(newVm);
            }
        } finally {
            if(oldVal)
                oldVal.dispose();
        }
    };    
    
    var landingPage = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Pages.LandingPage");
    });    
    
    var classPage = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Pages.ClassPage");
        
        this.usagesTemplateId = ko.computed(function() {
            if(this.model()) {
                var className = this.model().classFullName + classPage.classUsagesTemplateSuffix;
                if(document.getElementById(className))
                    return className;
            }
            
            return wo.contentControl.getBlankTemplateId();
        }, this);
    });
    
    classPage.classUsagesTemplateSuffix = "_ClassUsages";
    
    var propertyPage = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage");
    });
    
    var functionPage = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage");
    });
    
    var classItemTable = wo.itemsControl.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Pages.ClassItemTable", "Wipeout.Docs.ViewModels.Pages.ClassItemRow");
    });
    
    var codeBlock = wo.view.extend(function() {
        this._super("Wipeout.Docs.ViewModels.Components.CodeBlock");        
        this.code = null;
    });
    
    codeBlock.prototype.rootHtmlChanged = function() {
        this._super.apply(this, arguments);
        prettyPrint(null, this.templateItems.codeBlock);
    };
    
    var components = {
        TreeViewBranch: treeViewBranch,
        DynamicRender: dynamicRender,
        CodeBlock: codeBlock
    };
    
    var pages = {
        ClassItemTable: classItemTable,
        LandingPage: landingPage,
        ClassPage: classPage,
        PropertyPage: propertyPage,
        FunctionPage: functionPage
    };
    
    return {
        Application: application,
        Components: components,
        Pages: pages
    };
})());