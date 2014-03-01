(function () { window.Wipeout = {};
Wipeout.compiler = (function () {
    
    var innerCompiler = function(classes, baseClasses) {        
        this.classes = [];
        for(var i = 0, ii = classes.length; i < ii; i++)
            this.classes.push(classes[i]);
        
        this.compiled = [];
        for(var i = 0, ii = baseClasses.length; i < ii; i++) {
            this.compiled.push({
                name: baseClasses[i],
                value: get(baseClasses[i])
            });
        }
    };
    
    function get(namespacedObject) {
        var current = window;
        namespacedObject = namespacedObject.split(".");
        for(var i = 0, ii = namespacedObject.length; i < ii; i++) {
            current = current[namespacedObject[i]];
        }
        
        return current;
    }
    
    innerCompiler.prototype.checkDependency = function(dependency) {
        for(var i = 0, ii = this.compiled.length; i < ii; i++) {
            if(this.compiled[i].name === dependency)
                return true;
        }
        
        return false;        
    };
    
    innerCompiler.prototype.getClass = function(className) {
        for(var i = 0, ii = this.compiled.length; i < ii; i++) {
            if(this.compiled[i].name === className)
                return this.compiled[i].value;
        }
        
        return null;
    };
    
    innerCompiler.prototype.checkDependencies = function(dependencies) {
        for(var i = 0, ii = dependencies.length; i < ii; i++) {
            if(!this.checkDependency(dependencies[i]))
                return false;
        }
        
        return true;
    };
        
    innerCompiler.prototype.compile = function() {        
        while (this.classes.length) {
            var length = this.classes.length;
            
            for(var i = 0; i < this.classes.length; i++) {
                if(this.checkDependencies(this.classes[i].dependencies)) {
                    var className = this.classes[i].className;
                    if(className.indexOf(".") !== -1)
                        className = className.substr(className.lastIndexOf(".") + 1);
                    
                    var newClass = this.classes[i].constructor();
                    var statics = {};
                    for (var j in newClass)
                        statics[j] = newClass[j];
                    
                    var proto = newClass.prototype;
                    newClass = this.getClass(this.classes[i].parentClass).extend(newClass, className);
                    for(j in proto)
                        newClass.prototype[j] = proto[j];
                    for(j in statics)
                        newClass[j] = statics[j];
                    
                    this.compiled.push({
                        name: this.classes[i].className,
                        value: newClass
                    });
                    this.classes.splice(i, 1);
                    i--;
                }
            }    
            
            if(length === this.classes.length) {
                throw {
                    message: "Cannot compile remainig classes. They all have dependencies not registered with this constructor",
                    classes: this.classes
                };
            }
        }
    }
        
    function compiler(rootNamespace, baseClass, dependencies) {
        this.rootNamespace = rootNamespace;
        this.baseClass = baseClass;
        this.dependencies = dependencies || [];
        this.classes = [];
    };
    
    compiler.prototype.namespaceCorrectly = function(itemFullName) {
        if(this.rootNamespace && itemFullName && itemFullName.indexOf(this.rootNamespace + ".") === 0) {
            itemFullName = itemFullName.substr(this.rootNamespace.length + 1);        
        }
        
        return itemFullName;
    };
    
    compiler.prototype.registerClass = function(className, parentClass, buildConstructorFunction /* any extra arguments are counted as dependencies */) {      
        
        var parentClass = !parentClass || parentClass === this.baseClass ? this.baseClass : this.namespaceCorrectly(parentClass);
        
        var theClass = {
            className: this.namespaceCorrectly(className),
            constructor: buildConstructorFunction,
            parentClass: parentClass,
            dependencies: [parentClass]
        };
        
        for(var i = 0, ii = this.classes.length; i < ii; i++)
            if(this.classes[i].className === theClass.className)
                throw "There is already a class named " + className;
        
        for(i = 3, ii = arguments.length; i < ii; i++)
            theClass.dependencies.push(this.namespaceCorrectly(arguments[i]));
        
        this.classes.push(theClass);
    };
    
    compiler.append = function(append, to) {
        var name = append.name.split(".");
        for(var i = 0, ii = name.length - 1; i < ii; i++)
            to = to[name[i]] = to[name[i]] || {};
        
        to[name[i]] = append.value;
    }
       
    compiler.prototype.compile = function(root /* optional */) {
        root = root || {};
        
        var baseClasses = [this.baseClass];
        for(var i = 0, ii = this.dependencies.length; i < ii; i++) {
            baseClasses.push(this.dependencies[i]);
        }
        
        var ic = new innerCompiler(this.classes, baseClasses);
        ic.compile();
        
        // skip base class
        for(i = 1, ii = ic.compiled.length; i < ii; i++)
            compiler.append(ic.compiled[i], root);
        
        return root;
    };        
    
    return compiler;
    
})();

var compiler = new Wipeout.compiler("Wipeout", "wo.object", [
    "wo.visual", "wo.view", "wo.contentControl", "wo.itemsControl", "wo.if"
]);


var enumerate = function(enumerate, callback, context) {
    context = context || window;

    if(enumerate)
        for(var i = 0, ii = enumerate.length; i < ii; i++)
            callback.call(context, enumerate[i], i);
};

var get = function(item, root) {

    var current = root || window;
    enumerate(item.split("."), function(item) {
        current = current[item];
    });

    return current;
};


compiler.registerClass("Wipeout.Docs.ViewModels.Application", "wo.view", function() {
    
    function application() {
        this._super("Wipeout.Docs.ViewModels.Application");
        
        this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage, function (args) {
            this.model().content(args.data);
        }, this);
    };
    
    application.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        //TODO: this
        this.templateItems.treeView.select();
    };
    
    return application;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.CodeBlock", "wo.view", function() {
    var codeBlock = function(templateId) {
        this._super(templateId || "Wipeout.Docs.ViewModels.Components.CodeBlock");        
        this.code = ko.observable();
        
        this.code.subscribe(this.onCodeChanged, this);
    };
    
    codeBlock.prototype.onCodeChanged = function(newVal) {
    };
    
    codeBlock.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        prettyPrint(null, this.templateItems.codeBlock);
    };
    
    return codeBlock;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.DynamicRender", "wo.contentControl", function() {
    var dynamicRender = function() {
        this._super();
        
        this.content = ko.observable();
        
        this.template("<!-- ko render: content --><!-- /ko -->");
    };
    
    dynamicRender.prototype.onModelChanged = function(oldVal, newVal) {
        this._super(oldVal, newVal);
               
        var oldVal = this.content();
        
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
    };  
    
    return dynamicRender
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.JsCodeBlock", "Wipeout.Docs.ViewModels.Components.CodeBlock", function () {
    var jsCodeBlock = function() {
        this._super.apply(this, arguments);
    };
    
    jsCodeBlock.prototype.onCodeChanged = function(newVal) {  
        new Function(newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&amp;/g, "&")
            .replace(/\&gt;/g, ">"))();
    };

    return jsCodeBlock;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.TemplateCodeBlock", "Wipeout.Docs.ViewModels.Components.CodeBlock", function() {
    var templateCodeBlock = function() {
        templateCodeBlock.staticConstructor();
        this._super.apply(this, arguments);
    };
    
    var templateDiv;
    templateCodeBlock.staticConstructor = function() {
        if(templateDiv) return;
        
        templateDiv = document.createElement("div");
        templateDiv.setAttribute("style", "display: none");
        document.getElementsByTagName("body")[0].appendChild(templateDiv);
    };
    
    templateCodeBlock.prototype.onCodeChanged = function(newVal) {  
        templateDiv.innerHTML += newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&gt;/g, ">");
    };
    
    return templateCodeBlock;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch", "wo.view", function() {
    var treeViewBranch = function() {
        this._super(treeViewBranch.nullTemplate);  
    };
    
    treeViewBranch.branchTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";
    treeViewBranch.leafTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";
    treeViewBranch.nullTemplate = wo.visual.getBlankTemplateId();
    
    treeViewBranch.prototype.onModelChanged = function(oldVal, newVal) {  
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
    
    return treeViewBranch;
});


compiler.registerClass("Wipeout.Docs.ViewModels.Components.UsageCodeBlock", "Wipeout.Docs.ViewModels.Components.CodeBlock", function() {
    var usageCodeBlock = function() {
        this._super("Wipeout.Docs.ViewModels.Components.UsageCodeBlock");
        
        this.usage = ko.observable();
    };
    
    usageCodeBlock.prototype.onCodeChanged = function(newVal) {  
        this.usage(newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&amp;/g, "&")
            .replace(/\&gt;/g, ">"));
    };
    
    return usageCodeBlock;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.ClassItemTable", "wo.itemsControl", function() {
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.ClassItemTable", "Wipeout.Docs.ViewModels.Pages.ClassItemRow");
    };
});


    compiler.registerClass("Wipeout.Docs.ViewModels.Pages.ClassPage", "wo.view", function() {
        var classPage = function() {
            this._super("Wipeout.Docs.ViewModels.Pages.ClassPage");

            this.usagesTemplateId = ko.computed(function() {
                if(this.model()) {
                    var className = this.model().classFullName + classPage.classUsagesTemplateSuffix;
                    if(document.getElementById(className))
                        return className;
                }

                return wo.contentControl.getBlankTemplateId();
            }, this);
        };

        classPage.classUsagesTemplateSuffix = "_ClassUsages";
        
        return classPage;
    });

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage", "wo.view", function() {
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage");
    };
});


compiler.registerClass("Wipeout.Docs.ViewModels.Pages.LandingPage", "wo.view", function() {
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.LandingPage");
    };
});

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage", "wo.view", function() {
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage");
    };
});

compiler.compile(window.Wipeout);


//window.Wipeout = Wipeout;



})();
