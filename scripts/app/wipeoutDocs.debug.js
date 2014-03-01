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


window.NS = function(namespace) {
    
    namespace = namespace.split(".");
    var current = window;
    for(var i = 0, ii = namespace.length; i < ii; i++) {
        current = current[namespace[i]] || (current[namespace[i]] = {});
    }
    
    return current;
};

window.vmChooser = function(model) {
    model = ko.unwrap(model);
    
    if(model == null) return null;
    
    throw "Unknown model type";
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

compiler.registerClass("Wipeout.Docs.Models.Application", "wo.object", function() {
    
    return function() {
        
        this.content = ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());
        
        var currentApi = new Wipeout.Docs.Models.Components.Api();
                
        //wo
        var _wo = (function() {
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
            
            var htmlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", currentApi.forClass("wo.html"));
            var koVirtualElementsBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements", currentApi.forClass("wo.ko.virtualElements"));
            var koArrayBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wipeout.utils.ko.array"));
            var koBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wo.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch, "array": koArrayBranch}});
            var objBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", currentApi.forClass("wo.obj"));
            
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
        
        this.menu =
            new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", [
                new Wipeout.Docs.Models.Components.TreeViewBranch("API", [
                    _wo,
                    _bindings,
                    _wipeout
                ])
        ]);        
    };
});


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

compiler.registerClass("Wipeout.Docs.Models.Components.Api", "wo.object", function() {    
    
    var api = function(rootNamespace) {
        this._super();
        
        this.classes = [];
    };
    
    api.prototype.getClassDescription = function(classConstructor) {
        for(var i = 0, ii = this.classes.length; i < ii; i++)            
            if(this.classes[i].classConstructor === classConstructor)
                return this.classes[i].classDescription;
    };
    
    api.prototype.forClass = function(className) {
        
        var classConstructor = get(className);
        var result = this.getClassDescription(classConstructor);
        if(result)
            return result;
        
        var desc = new Wipeout.Docs.Models.Descriptions.Class(className, this);
        this.classes.push({
            classDescription: desc,
            classConstructor: classConstructor
        });
        
        return desc;
    };
    
    return api;
});

compiler.registerClass("Wipeout.Docs.Models.Components.ClassTreeViewBranch", "Wipeout.Docs.Models.Components.PageTreeViewBranch", function() {
    var classTreeViewBranch = function(name, classDescription, customBranches) {
        this._super(name, classDescription, classTreeViewBranch.compileBranches(classDescription, customBranches));
    };
    
    classTreeViewBranch.compileBranches = function(classDescription, customBranches /*optional*/) {
        var output = [];
        
        customBranches = customBranches || {};
        customBranches.staticEvents = customBranches.staticEvents || {};
        customBranches.staticProperties = customBranches.staticProperties || {};
        customBranches.staticFunctions = customBranches.staticFunctions || {};
        customBranches.events = customBranches.events || {};
        customBranches.properties = customBranches.properties || {};
        customBranches.functions = customBranches.functions || {};
        
        output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch("constructor"));    
        
        enumerate(classDescription.staticEvents, function(event) {
            if(customBranches.staticEvents[event.eventName])
                output.push(customBranches.staticEvents[event.eventName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(event.eventName, null));            
        });
        
        enumerate(classDescription.staticProperties, function(property) {
            if(customBranches.staticProperties[property.propertyName])
                output.push(customBranches.staticProperties[property.propertyName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(property.propertyName, null));
        });
        
        enumerate(classDescription.staticFunctions, function(_function) {
            if(customBranches.staticFunctions[_function.functionName])
                output.push(customBranches.staticFunctions[_function.functionName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(_function.functionName, null));            
        });
        
        enumerate(classDescription.events, function(event) {
            if(customBranches.events[event.eventName])
                output.push(customBranches.events[event.eventName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(event.eventName, null));            
        });
        
        enumerate(classDescription.properties, function(property) {
            if(customBranches.staticProperties[property.propertyName])
                output.push(customBranches.staticProperties[property.propertyName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(property.propertyName, null));            
        });
        
        enumerate(classDescription.functions, function(_function) {
            if(customBranches.functions[_function.functionName])
                output.push(customBranches.functions[_function.functionName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(_function.functionName, null));            
        });
        
        output.sort(function() { return arguments[0].name === "constructor" ? -1 : arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    return classTreeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch", "Wipeout.Docs.Models.Components.TreeViewBranch", function() {
    var pageTreeViewBranch = function(name, page, branches) {
        this._super(name, branches);
            
        this.page = page;
    };
    
    pageTreeViewBranch.prototype.payload = function() {
        return this.page;
    };
    
    return pageTreeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch", "wo.object", function() {
    var treeViewBranch = function(name, branches) {
        this._super();
            
        this.name = name;
        this.branches = branches;
    };
    
    treeViewBranch.prototype.payload = function() {
        return null;
    };
    
    return treeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Class", "wo.object", function() {
    var classDescription = function(classFullName, api) {
        this._super();
        
        this.className = classDescription.getClassName(classFullName);
        this.constructorFunction = get(classFullName);
        this.classFullName = classFullName;
        this.api = api;
        
        this.classConstructor = null;
        this.events = [];
        this.staticEvents = [];
        this.properties = [];
        this.staticProperties = [];
        this.functions = [];
        this.staticFunctions = [];
        
        this.rebuild();
    };
    
    classDescription.getClassName = function(classFullName) {
        classFullName = classFullName.split(".");
        return classFullName[classFullName.length - 1];
    };
    
    classDescription.prototype.rebuild = function() {
        this.classConstructor = null;
        this.events.length = 0;
        this.staticEvents.length = 0;
        this.properties.length = 0;
        this.staticProperties.length = 0;
        this.functions.length = 0;
        this.staticFunctions.length = 0;
                
        for(var i in this.constructorFunction) {
            if(this.constructorFunction.hasOwnProperty(i)) {
                if(this.constructorFunction[i] instanceof wo.event) {
                    this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName));
                } else if(this.constructorFunction[i] instanceof Function && !ko.isObservable(this.constructorFunction[i])) {
                    this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[i], i, this.classFullName));
                } else {
                    this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction, i, this.classFullName));
                }
            }
        }
        
        for(var i in this.constructorFunction.prototype) {
            if(this.constructorFunction.prototype.hasOwnProperty(i)) {                    
                if(this.constructorFunction.prototype[i] instanceof wo.event) { 
                    this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName));
                } else if(this.constructorFunction.prototype[i] instanceof Function && !ko.isObservable(this.constructorFunction.prototype[i])) {
                    this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[i], i, this.classFullName));
                } else {
                    this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction, i, this.classFullName));
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            var anInstance = new this.constructorFunction();        
            for(var i in anInstance) {
                if(anInstance.hasOwnProperty(i)) {                    
                    if(anInstance[i] instanceof wo.event) { 
                        this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName));
                    } else if(anInstance[i] instanceof Function && !ko.isObservable(anInstance[i])) { 
                        this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(anInstance[i], i, this.classFullName));
                    } else {
                        this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction, i, this.classFullName));
                    }
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            var current = this.constructorFunction;
            while((current = Object.getPrototypeOf(current.prototype).constructor) !== Object) {  
                var parentClass = this.api.getClassDescription(current);
                if(!parentClass)
                    throw "Class has not been defined yet";
                
                var copy = function(fromTo, nameProperty) {
                    enumerate(parentClass[fromTo], function(fn) { 
                        if(this[fromTo].indexOf(fn) !== -1) return;
                        
                        for(var i = 0, ii = this[fromTo].length; i < ii; i++) {                    
                            if(this[fromTo][i][nameProperty] === fn[nameProperty]) {
                                if(!this[fromTo][i].overrides)
                                    this[fromTo][i].overrides = fn;
                                
                                return;
                            }
                        }
                        
                        this[fromTo].push(fn);
                    }, this);
                };
                
                // instance items only (no statics)
                copy.call(this, "events", "eventName");
                copy.call(this, "properties", "propertyName");
                copy.call(this, "functions", "functionName");
            }
        }
        
        var pullSummaryFromOverride = function(fromTo) {
            enumerate(this[fromTo], function(item) {
                var current = item;
                while (current && current.overrides && !current.summary) {
                    if(current.overrides.summary) {
                        current.summary = current.overrides.summary + 
                            (current.overrides.summaryInherited ? "" : " (from " + current.overrides.classFullName + ")");
                        current.summaryInherited = true;
                    }
                    
                    current = current.overrides;
                }
            });
        };
        
        pullSummaryFromOverride.call(this, "staticProperties");
        pullSummaryFromOverride.call(this, "staticFunctions");
        pullSummaryFromOverride.call(this, "staticEvents");
        pullSummaryFromOverride.call(this, "events");
        pullSummaryFromOverride.call(this, "properties");
        pullSummaryFromOverride.call(this, "functions");
        
        for(var i = 0, ii = this.functions.length; i < ii; i++) {
            if(this.functions[i].functionName === "constructor") {
                this.classConstructor = this.functions.splice(i, 1)[0];
                break;
            }
        }
        
        if(i === this.functions.length)
            this.classConstructor = new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction, this.className, this.classFullName);
        
        var sort = function() { return arguments[0].name.localeCompare(arguments[1].name); };
        
        this.events.sort(sort);
        this.staticEvents.sort(sort);
        this.properties.sort(sort);
        this.staticProperties.sort(sort);
        this.functions.sort(sort);
        this.staticFunctions.sort(sort);
    };
    
    return classDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.ClassItem", "wo.object", function() {
    return function(itemName, itemSummary) {
        this._super();
        
        this.name = itemName;
        this.summary = itemSummary;
    }
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Event", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var eventDescription = function(constructorFunction, eventName, classFullName) {
        this._super(eventName, Wipeout.Docs.Models.Descriptions.PropertyDescription.getPropertySummary(constructorFunction, eventName));
        
        this.eventName = eventName;
        this.classFullName = classFullName;
    };
    
    return eventDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Function", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction));
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.overrides = null;
    };
        
    functionDescription.getFunctionSummary = function(theFunction) {
        var functionString = theFunction.toString();
        
        var isInlineComment = false;
        var isBlockComment = false;
        
        var removeFunctionDefinition = function() {
            var firstInline = functionString.indexOf("//");
            var firstBlock = functionString.indexOf("/*");
            var openFunction = functionString.indexOf("{");
            
            if(firstInline === -1) firstInline = Number.MAX_VALUE;
            if(firstBlock === -1) firstBlock = Number.MAX_VALUE;
                    
            if(openFunction < firstInline && openFunction < firstBlock) {
                functionString = functionString.substr(openFunction + 1).replace(/^\s+|\s+$/g, '');
            } else { 
                if(firstInline < firstBlock) {
                    functionString = functionString.substr(functionString.indexOf("\n")).replace(/^\s+|\s+$/g, '');
                } else {
                    functionString = functionString.substr(functionString.indexOf("*/")).replace(/^\s+|\s+$/g, '');
                }
                
                removeFunctionDefinition();
            }
        };
        
        removeFunctionDefinition();
        
        if (functionString.indexOf("///<summary>") === 0) {
            return functionString.substring(12, functionString.indexOf("</summary>"));
        }
        
        return "";   
    };  
    
    return functionDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.PropertyDescription", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var property = function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, property.getPropertySummary(constructorFunction, propertyName, classFullName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
    };
    
    var inlineCommentOnly = /^\/\//;
    property.getPropertySummary = function(constructorFunction, propertyName, classFullName) {
        var result;
        if(result =  property.getPropertyDescriptionOverride(classFullName + "." + propertyName))
            return result;
        
        constructorFunction = constructorFunction.toString();
                
        var search = function(regex) {
            var i = constructorFunction.search(regex);
            if(i !== -1) {
                var func = constructorFunction.substring(0, i);
                var lastLine = func.lastIndexOf("\n");
                if(lastLine > 0) {
                    func = func.substring(lastLine);
                } 
                
                func = func.replace(/^\s+|\s+$/g, '');
                if(inlineCommentOnly.test(func))
                    return func.substring(2);
                else
                    return null;
            }
        }
        
        result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName + "\"\\s*\\]\\s*="));        
    };
    
    property.getPropertyDescriptionOverride = function(classDelimitedPropertyName) {
        
        var current = property.descriptionOverrides;
        enumerate(classDelimitedPropertyName.split("."), function(item) {
            if(!current) return;
            current = current[item];
        });
        
        return current;
    };
        
    property.descriptionOverrides = {
        wo: {
            'if': {
                woInvisibleDefault: "The default value for woInvisible for the wo.if class."
            },
            html: {
                specialTags: "A list of html tags which cannot be placed inside a div element."
            },
            ko: {
                array: "Utils for operating on observableArrays",
                virtualElements: "Utils for operating on knockout virtual elements"
            },
            object: {
                useVirtualCache: "When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."
            },
            view: {
                //TODO: give this a page
                objectParser: "Used to parse string values into a given type",
                //TODO: give this a page
                reservedPropertyNames: "Properties which cannot be set on a wipeout object via the template"
            },
            visual: {
                reservedTags: "A list of names which cannot be used as wipeout object names. These are mostly html tag names",
                woInvisibleDefault: "The default value for woInvisible for the wo.visual class."
            }
        },
        wipeout: {
            template: {
                engine: {
            closeCodeTag: "Signifies the end of a wipeout code block. \"" + wipeout.template.engine.closeCodeTag + "\".",
            instance: "An instance of a wipeout.template.engine which is used by the render binding.",
            openCodeTag: "Signifies the beginning of a wipeout code block. \"" + wipeout.template.engine.openCodeTag + "\".",
            scriptCache: "A placeholder for precompiled scripts.",
            scriptHasBeenReWritten: "TODO"
                }}
        }
    };
    
    return property;
});

compiler.registerClass("Wipeout.Docs.Models.Pages.DisplayItem", "wo.object", function() {
    return function(name) {
        this._super();
        
        this.title = name;
    };
});

compiler.registerClass("Wipeout.Docs.Models.Pages.LandingPage", "Wipeout.Docs.Models.Pages.DisplayItem", function() {
    return function(title) {
       this._super(title); 
    }
});

compiler.compile(window.Wipeout);


//window.Wipeout = Wipeout;



})();


(function(){window.Wipeout={};Wipeout.compiler=(function(){var f=function(h,g){this.classes=[];for(var j=0,k=h.length;j<k;j++){this.classes.push(h[j])}this.compiled=[];for(var j=0,k=g.length;j<k;j++){this.compiled.push({name:g[j],value:e(g[j])})}};function e(k){var g=window;k=k.split(".");for(var h=0,j=k.length;h<j;h++){g=g[k[h]]}return g}f.prototype.checkDependency=function(g){for(var h=0,j=this.compiled.length;h<j;h++){if(this.compiled[h].name===g){return true}}return false};f.prototype.getClass=function(g){for(var h=0,j=this.compiled.length;h<j;h++){if(this.compiled[h].name===g){return this.compiled[h].value}}return null};f.prototype.checkDependencies=function(g){for(var h=0,j=g.length;h<j;h++){if(!this.checkDependency(g[h])){return false}}return true};f.prototype.compile=function(){while(this.classes.length){var l=this.classes.length;for(var h=0;h<this.classes.length;h++){if(this.checkDependencies(this.classes[h].dependencies)){var g=this.classes[h].className;if(g.indexOf(".")!==-1){g=g.substr(g.lastIndexOf(".")+1)}var m=this.classes[h].constructor();var o={};for(var k in m){o[k]=m[k]}var n=m.prototype;m=this.getClass(this.classes[h].parentClass).extend(m,g);for(k in n){m.prototype[k]=n[k]}for(k in o){m[k]=o[k]}this.compiled.push({name:this.classes[h].className,value:m});this.classes.splice(h,1);h--}}if(l===this.classes.length){throw {message:"Cannot compile remainig classes. They all have dependencies not registered with this constructor",classes:this.classes}}}};function d(i,g,h){this.rootNamespace=i;this.baseClass=g;this.dependencies=h||[];this.classes=[]}d.prototype.namespaceCorrectly=function(g){if(this.rootNamespace&&g&&g.indexOf(this.rootNamespace+".")===0){g=g.substr(this.rootNamespace.length+1)}return g};d.prototype.registerClass=function(h,l,g){var l=!l||l===this.baseClass?this.baseClass:this.namespaceCorrectly(l);var m={className:this.namespaceCorrectly(h),constructor:g,parentClass:l,dependencies:[l]};for(var j=0,k=this.classes.length;j<k;j++){if(this.classes[j].className===m.className){throw"There is already a class named "+h}}for(j=3,k=arguments.length;j<k;j++){m.dependencies.push(this.namespaceCorrectly(arguments[j]))}this.classes.push(m)};d.append=function(g,l){var k=g.name.split(".");for(var h=0,j=k.length-1;h<j;h++){l=l[k[h]]=l[k[h]]||{}}l[k[h]]=g.value};d.prototype.compile=function(l){l=l||{};var g=[this.baseClass];for(var h=0,k=this.dependencies.length;h<k;h++){g.push(this.dependencies[h])}var j=new f(this.classes,g);j.compile();for(h=1,k=j.compiled.length;h<k;h++){d.append(j.compiled[h],l)}return l};return d})();var a=new Wipeout.compiler("Wipeout","wo.object",["wo.visual","wo.view","wo.contentControl","wo.itemsControl","wo.if"]);var b=function(f,d,e){e=e||window;if(f){for(var g=0,h=f.length;g<h;g++){d.call(e,f[g],g)}}};var c=function(e,f){var d=f||window;b(e.split("."),function(g){d=d[g]});return d};(function(){window.Wipeout={};Wipeout.compiler=(function(){var i=function(k,j){this.classes=[];for(var l=0,m=k.length;l<m;l++){this.classes.push(k[l])}this.compiled=[];for(var l=0,m=j.length;l<m;l++){this.compiled.push({name:j[l],value:h(j[l])})}};function h(m){var j=window;m=m.split(".");for(var k=0,l=m.length;k<l;k++){j=j[m[k]]}return j}i.prototype.checkDependency=function(j){for(var k=0,l=this.compiled.length;k<l;k++){if(this.compiled[k].name===j){return true}}return false};i.prototype.getClass=function(j){for(var k=0,l=this.compiled.length;k<l;k++){if(this.compiled[k].name===j){return this.compiled[k].value}}return null};i.prototype.checkDependencies=function(j){for(var k=0,l=j.length;k<l;k++){if(!this.checkDependency(j[k])){return false}}return true};i.prototype.compile=function(){while(this.classes.length){var n=this.classes.length;for(var l=0;l<this.classes.length;l++){if(this.checkDependencies(this.classes[l].dependencies)){var k=this.classes[l].className;if(k.indexOf(".")!==-1){k=k.substr(k.lastIndexOf(".")+1)}var o=this.classes[l].constructor();var q={};for(var m in o){q[m]=o[m]}var p=o.prototype;o=this.getClass(this.classes[l].parentClass).extend(o,k);for(m in p){o.prototype[m]=p[m]}for(m in q){o[m]=q[m]}this.compiled.push({name:this.classes[l].className,value:o});this.classes.splice(l,1);l--}}if(n===this.classes.length){throw {message:"Cannot compile remainig classes. They all have dependencies not registered with this constructor",classes:this.classes}}}};function g(l,j,k){this.rootNamespace=l;this.baseClass=j;this.dependencies=k||[];this.classes=[]}g.prototype.namespaceCorrectly=function(j){if(this.rootNamespace&&j&&j.indexOf(this.rootNamespace+".")===0){j=j.substr(this.rootNamespace.length+1)}return j};g.prototype.registerClass=function(k,n,j){var n=!n||n===this.baseClass?this.baseClass:this.namespaceCorrectly(n);var o={className:this.namespaceCorrectly(k),constructor:j,parentClass:n,dependencies:[n]};for(var l=0,m=this.classes.length;l<m;l++){if(this.classes[l].className===o.className){throw"There is already a class named "+k}}for(l=3,m=arguments.length;l<m;l++){o.dependencies.push(this.namespaceCorrectly(arguments[l]))}this.classes.push(o)};g.append=function(j,n){var m=j.name.split(".");for(var k=0,l=m.length-1;k<l;k++){n=n[m[k]]=n[m[k]]||{}}n[m[k]]=j.value};g.prototype.compile=function(n){n=n||{};var j=[this.baseClass];for(var k=0,m=this.dependencies.length;k<m;k++){j.push(this.dependencies[k])}var l=new i(this.classes,j);l.compile();for(k=1,m=l.compiled.length;k<m;k++){g.append(l.compiled[k],n)}return n};return g})();var d=new Wipeout.compiler("Wipeout","wo.object",["wo.visual","wo.view","wo.contentControl","wo.itemsControl","wo.if"]);window.NS=function(k){k=k.split(".");var g=window;for(var h=0,j=k.length;h<j;h++){g=g[k[h]]||(g[k[h]]={})}return g};window.vmChooser=function(g){g=ko.unwrap(g);if(g==null){return null}throw"Unknown model type"};d.registerClass("Wipeout.Docs.ViewModels.Application","wo.view",function(){function g(){this._super("Wipeout.Docs.ViewModels.Application");this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage,function(h){this.model().content(h.data)},this)}g.prototype.onRendered=function(){this._super.apply(this,arguments);this.templateItems.treeView.select()};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.CodeBlock","wo.view",function(){var g=function(h){this._super(h||"Wipeout.Docs.ViewModels.Components.CodeBlock");this.code=ko.observable();this.code.subscribe(this.onCodeChanged,this)};g.prototype.onCodeChanged=function(h){};g.prototype.onRendered=function(){this._super.apply(this,arguments);prettyPrint(null,this.templateItems.codeBlock)};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.DynamicRender","wo.contentControl",function(){var g=function(){this._super();this.content=ko.observable();this.template("<!-- ko render: content --><!-- /ko -->")};g.prototype.onModelChanged=function(j,h){this._super(j,h);var j=this.content();if(h==null){this.content(null)}else{var i=null;if(h instanceof Wipeout.Docs.Models.Pages.LandingPage){i=new Wipeout.Docs.ViewModels.Pages.LandingPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Class){i=new Wipeout.Docs.ViewModels.Pages.ClassPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Event){i=new Wipeout.Docs.ViewModels.Pages.EventPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Property){i=new Wipeout.Docs.ViewModels.Pages.PropertyPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Function){i=new Wipeout.Docs.ViewModels.Pages.FunctionPage()}else{throw"Unknown model type"}}}}}i.model(h);this.content(i)}};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.JsCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var g=function(){this._super.apply(this,arguments)};g.prototype.onCodeChanged=function(h){new Function(h.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))()};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.TemplateCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var g=function(){g.staticConstructor();this._super.apply(this,arguments)};var h;g.staticConstructor=function(){if(h){return}h=document.createElement("div");h.setAttribute("style","display: none");document.getElementsByTagName("body")[0].appendChild(h)};g.prototype.onCodeChanged=function(i){h.innerHTML+=i.replace(/\&lt;/g,"<").replace(/\&gt;/g,">")};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch","wo.view",function(){var g=function(){this._super(g.nullTemplate)};g.branchTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";g.leafTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";g.nullTemplate=wo.visual.getBlankTemplateId();g.prototype.onModelChanged=function(i,h){this._super(i,h);if(h&&(h.branches||h.payload())){this.templateId(g.branchTemplate)}else{if(h){this.templateId(g.leafTemplate)}else{this.templateId(g.nullTemplate)}}};g.prototype.select=function(){if(this.model().branches){$(this.templateItems.content).toggle()}var h=this.model().payload();if($(this.templateItems.content).filter(":visible").length&&h){this.triggerRoutedEvent(g.renderPage,h)}};g.renderPage=new wo.routedEvent();return g});d.registerClass("Wipeout.Docs.ViewModels.Components.UsageCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var g=function(){this._super("Wipeout.Docs.ViewModels.Components.UsageCodeBlock");this.usage=ko.observable()};g.prototype.onCodeChanged=function(h){this.usage(h.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))};return g});d.registerClass("Wipeout.Docs.ViewModels.Pages.ClassItemTable","wo.itemsControl",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassItemTable","Wipeout.Docs.ViewModels.Pages.ClassItemRow")}});d.registerClass("Wipeout.Docs.ViewModels.Pages.ClassPage","wo.view",function(){var g=function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassPage");this.usagesTemplateId=ko.computed(function(){if(this.model()){var h=this.model().classFullName+g.classUsagesTemplateSuffix;if(document.getElementById(h)){return h}}return wo.contentControl.getBlankTemplateId()},this)};g.classUsagesTemplateSuffix="_ClassUsages";return g});d.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage")}});d.registerClass("Wipeout.Docs.ViewModels.Pages.LandingPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.LandingPage")}});d.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage")}});d.registerClass("Wipeout.Docs.Models.Application","wo.object",function(){return function(){this.content=ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());var j=new Wipeout.Docs.Models.Components.Api();var i=(function(){var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",j.forClass("wo.object"));var w=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",j.forClass("wo.routedEventModel"));var z=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",j.forClass("wo.visual"));var y=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",j.forClass("wo.view"));var k=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",j.forClass("wo.contentControl"));var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",j.forClass("wo.if"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",j.forClass("wo.itemsControl"));var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",j.forClass("wo.event"));var v=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",j.forClass("wo.routedEvent"));var u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",j.forClass("wo.routedEventArgs"));var x=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",j.forClass("wo.routedEventRegistration"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",j.forClass("wo.html"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",j.forClass("wo.ko.virtualElements"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",j.forClass("wipeout.utils.ko.array"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",j.forClass("wo.ko"),{staticProperties:{virtualElements:r,array:p}});var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",j.forClass("wo.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("wo",[k,l,n,m,o,q,s,t,v,u,w,x,y,z])})();var g=(function(){var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",j.forClass("wipeout.bindings.itemsControl"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",j.forClass("wipeout.bindings.render"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",j.forClass("wipeout.bindings.wipeout-type"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",j.forClass("wipeout.bindings.wo"));var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",j.forClass("wipeout.bindings.wipeout"));var k=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",j.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[k,n,o,p,m,l])})();var h=(function(){var k=(function(){var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",j.forClass("wo.object"));var v=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",j.forClass("wo.routedEventModel"));var y=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",j.forClass("wo.visual"));var x=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",j.forClass("wo.view"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",j.forClass("wo.contentControl"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",j.forClass("wo.if"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",j.forClass("wo.itemsControl"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",j.forClass("wo.event"));var u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",j.forClass("wo.routedEvent"));var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",j.forClass("wo.routedEventArgs"));var w=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",j.forClass("wo.routedEventRegistration"));return new Wipeout.Docs.Models.Components.TreeViewBranch("base",[o,p,q,r,s,u,t,v,w,x,y])})();var l=(function(){var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",j.forClass("wipeout.bindings.itemsControl"));var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",j.forClass("wipeout.bindings.render"));var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",j.forClass("wipeout.bindings.wipeout-type"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",j.forClass("wipeout.bindings.wo"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",j.forClass("wipeout.bindings.wipeout"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",j.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[o,r,s,t,q,p])})();var m=(function(){j.forClass("ko.templateEngine");var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine",j.forClass("wipeout.template.engine"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder",j.forClass("wipeout.template.htmlBuilder"));return new Wipeout.Docs.Models.Components.TreeViewBranch("template",[o,p])})();var n=(function(){var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",j.forClass("wipeout.utils.html"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",j.forClass("wipeout.utils.ko.virtualElements"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",j.forClass("wipeout.utils.ko.array"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",j.forClass("wipeout.utils.ko"),{staticProperties:{virtualElements:r,array:p}});var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",j.forClass("wipeout.utils.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("utils",[o,q,s])})();return new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout (debug mode only)",[k,l,m,n])})();this.menu=new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout",[new Wipeout.Docs.Models.Components.TreeViewBranch("API",[i,g,h])])}});var e=function(j,g,h){h=h||window;if(j){for(var k=0,l=j.length;k<l;k++){g.call(h,j[k],k)}}};var f=function(h,i){var g=i||window;e(h.split("."),function(j){g=g[j]});return g};d.registerClass("Wipeout.Docs.Models.Components.Api","wo.object",function(){var g=function(h){this._super();this.classes=[]};g.prototype.getClassDescription=function(h){for(var j=0,k=this.classes.length;j<k;j++){if(this.classes[j].classConstructor===h){return this.classes[j].classDescription}}};g.prototype.forClass=function(i){var h=f(i);var k=this.getClassDescription(h);if(k){return k}var j=new Wipeout.Docs.Models.Descriptions.Class(i,this);this.classes.push({classDescription:j,classConstructor:h});return j};return g});d.registerClass("Wipeout.Docs.Models.Components.ClassTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){var g=function(j,h,i){this._super(j,h,g.compileBranches(h,i))};g.compileBranches=function(h,i){var j=[];i=i||{};i.staticEvents=i.staticEvents||{};i.staticProperties=i.staticProperties||{};i.staticFunctions=i.staticFunctions||{};i.events=i.events||{};i.properties=i.properties||{};i.functions=i.functions||{};j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch("constructor"));e(h.staticEvents,function(k){if(i.staticEvents[k.eventName]){j.push(i.staticEvents[k.eventName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.eventName,null))}});e(h.staticProperties,function(k){if(i.staticProperties[k.propertyName]){j.push(i.staticProperties[k.propertyName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.propertyName,null))}});e(h.staticFunctions,function(k){if(i.staticFunctions[k.functionName]){j.push(i.staticFunctions[k.functionName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.functionName,null))}});e(h.events,function(k){if(i.events[k.eventName]){j.push(i.events[k.eventName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.eventName,null))}});e(h.properties,function(k){if(i.staticProperties[k.propertyName]){j.push(i.staticProperties[k.propertyName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.propertyName,null))}});e(h.functions,function(k){if(i.functions[k.functionName]){j.push(i.functions[k.functionName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.functionName,null))}});j.sort(function(){return arguments[0].name==="constructor"?-1:arguments[0].name.localeCompare(arguments[1].name)});return j};return g});d.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch","Wipeout.Docs.Models.Components.TreeViewBranch",function(){var g=function(i,j,h){this._super(i,h);this.page=j};g.prototype.payload=function(){return this.page};return g});d.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch","wo.object",function(){var g=function(i,h){this._super();this.name=i;this.branches=h};g.prototype.payload=function(){return null};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.Class","wo.object",function(){var g=function(i,h){this._super();this.className=g.getClassName(i);this.constructorFunction=f(i);this.classFullName=i;this.api=h;this.classConstructor=null;this.events=[];this.staticEvents=[];this.properties=[];this.staticProperties=[];this.functions=[];this.staticFunctions=[];this.rebuild()};g.getClassName=function(h){h=h.split(".");return h[h.length-1]};g.prototype.rebuild=function(){this.classConstructor=null;this.events.length=0;this.staticEvents.length=0;this.properties.length=0;this.staticProperties.length=0;this.functions.length=0;this.staticFunctions.length=0;for(var l in this.constructorFunction){if(this.constructorFunction.hasOwnProperty(l)){if(this.constructorFunction[l] instanceof wo.event){this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,l,this.classFullName))}else{if(this.constructorFunction[l] instanceof Function&&!ko.isObservable(this.constructorFunction[l])){this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[l],l,this.classFullName))}else{this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,l,this.classFullName))}}}}for(var l in this.constructorFunction.prototype){if(this.constructorFunction.prototype.hasOwnProperty(l)){if(this.constructorFunction.prototype[l] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,l,this.classFullName))}else{if(this.constructorFunction.prototype[l] instanceof Function&&!ko.isObservable(this.constructorFunction.prototype[l])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[l],l,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,l,this.classFullName))}}}}if(this.constructorFunction.constructor===Function){var h=new this.constructorFunction();for(var l in h){if(h.hasOwnProperty(l)){if(h[l] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,l,this.classFullName))}else{if(h[l] instanceof Function&&!ko.isObservable(h[l])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(h[l],l,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,l,this.classFullName))}}}}}if(this.constructorFunction.constructor===Function){var k=this.constructorFunction;while((k=Object.getPrototypeOf(k.prototype).constructor)!==Object){var n=this.api.getClassDescription(k);if(!n){throw"Class has not been defined yet"}var j=function(i,q){e(n[i],function(r){if(this[i].indexOf(r)!==-1){return}for(var s=0,t=this[i].length;s<t;s++){if(this[i][s][q]===r[q]){if(!this[i][s].overrides){this[i][s].overrides=r}return}}this[i].push(r)},this)};j.call(this,"events","eventName");j.call(this,"properties","propertyName");j.call(this,"functions","functionName")}}var o=function(i){e(this[i],function(r){var q=r;while(q&&q.overrides&&!q.summary){if(q.overrides.summary){q.summary=q.overrides.summary+(q.overrides.summaryInherited?"":" (from "+q.overrides.classFullName+")");q.summaryInherited=true}q=q.overrides}})};o.call(this,"staticProperties");o.call(this,"staticFunctions");o.call(this,"staticEvents");o.call(this,"events");o.call(this,"properties");o.call(this,"functions");for(var l=0,m=this.functions.length;l<m;l++){if(this.functions[l].functionName==="constructor"){this.classConstructor=this.functions.splice(l,1)[0];break}}if(l===this.functions.length){this.classConstructor=new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction,this.className,this.classFullName)}var p=function(){return arguments[0].name.localeCompare(arguments[1].name)};this.events.sort(p);this.staticEvents.sort(p);this.properties.sort(p);this.staticProperties.sort(p);this.functions.sort(p);this.staticFunctions.sort(p)};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.ClassItem","wo.object",function(){return function(g,h){this._super();this.name=g;this.summary=h}});d.registerClass("Wipeout.Docs.Models.Descriptions.Event","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var g=function(i,j,h){this._super(j,Wipeout.Docs.Models.Descriptions.PropertyDescription.getPropertySummary(i,j));this.eventName=j;this.classFullName=h};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.Function","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var g=function(j,i,h){this._super(i,g.getFunctionSummary(j));this["function"]=j;this.functionName=i;this.classFullName=h;this.overrides=null};g.getFunctionSummary=function(l){var h=l.toString();var j=false;var i=false;var k=function(){var n=h.indexOf("//");var m=h.indexOf("/*");var o=h.indexOf("{");if(n===-1){n=Number.MAX_VALUE}if(m===-1){m=Number.MAX_VALUE}if(o<n&&o<m){h=h.substr(o+1).replace(/^\s+|\s+$/g,"")}else{if(n<m){h=h.substr(h.indexOf("\n")).replace(/^\s+|\s+$/g,"")}else{h=h.substr(h.indexOf("*/")).replace(/^\s+|\s+$/g,"")}k()}};k();if(h.indexOf("///<summary>")===0){return h.substring(12,h.indexOf("</summary>"))}return""};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.PropertyDescription","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var h=function(j,k,i){this._super(k,h.getPropertySummary(j,k,i));this.propertyName=k;this.classFullName=i};var g=/^\/\//;h.getPropertySummary=function(j,k,i){var l;if(l=h.getPropertyDescriptionOverride(i+"."+k)){return l}j=j.toString();var m=function(q){var o=j.search(q);if(o!==-1){var n=j.substring(0,o);var p=n.lastIndexOf("\n");if(p>0){n=n.substring(p)}n=n.replace(/^\s+|\s+$/g,"");if(g.test(n)){return n.substring(2)}else{return null}}};l=m(new RegExp("\\s*this\\s*\\.\\s*"+k+"\\s*="));if(l){return l}return m(new RegExp('\\s*this\\s*\\[\\s*"'+k+'"\\s*\\]\\s*='))};h.getPropertyDescriptionOverride=function(i){var j=h.descriptionOverrides;e(i.split("."),function(k){if(!j){return}j=j[k]});return j};h.descriptionOverrides={wo:{"if":{woInvisibleDefault:"The default value for woInvisible for the wo.if class."},html:{specialTags:"A list of html tags which cannot be placed inside a div element."},ko:{array:"Utils for operating on observableArrays",virtualElements:"Utils for operating on knockout virtual elements"},object:{useVirtualCache:"When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."},view:{objectParser:"Used to parse string values into a given type",reservedPropertyNames:"Properties which cannot be set on a wipeout object via the template"},visual:{reservedTags:"A list of names which cannot be used as wipeout object names. These are mostly html tag names",woInvisibleDefault:"The default value for woInvisible for the wo.visual class."}},wipeout:{template:{engine:{closeCodeTag:'Signifies the end of a wipeout code block. "'+wipeout.template.engine.closeCodeTag+'".',instance:"An instance of a wipeout.template.engine which is used by the render binding.",openCodeTag:'Signifies the beginning of a wipeout code block. "'+wipeout.template.engine.openCodeTag+'".',scriptCache:"A placeholder for precompiled scripts.",scriptHasBeenReWritten:"TODO"}}}};return h});d.registerClass("Wipeout.Docs.Models.Pages.DisplayItem","wo.object",function(){return function(g){this._super();this.title=g}});d.registerClass("Wipeout.Docs.Models.Pages.LandingPage","Wipeout.Docs.Models.Pages.DisplayItem",function(){return function(g){this._super(g)}});d.compile(window.Wipeout)})();(function(){window.Wipeout={};Wipeout.compiler=(function(){var i=function(m,l){this.classes=[];for(var n=0,o=m.length;n<o;n++){this.classes.push(m[n])}this.compiled=[];for(var n=0,o=l.length;n<o;n++){this.compiled.push({name:l[n],value:h(l[n])})}};function h(o){var l=window;o=o.split(".");for(var m=0,n=o.length;m<n;m++){l=l[o[m]]}return l}i.prototype.checkDependency=function(k){for(var l=0,m=this.compiled.length;l<m;l++){if(this.compiled[l].name===k){return true}}return false};i.prototype.getClass=function(k){for(var l=0,m=this.compiled.length;l<m;l++){if(this.compiled[l].name===k){return this.compiled[l].value}}return null};i.prototype.checkDependencies=function(k){for(var l=0,m=k.length;l<m;l++){if(!this.checkDependency(k[l])){return false}}return true};i.prototype.compile=function(){while(this.classes.length){var r=this.classes.length;for(var p=0;p<this.classes.length;p++){if(this.checkDependencies(this.classes[p].dependencies)){var j=this.classes[p].className;if(j.indexOf(".")!==-1){j=j.substr(j.lastIndexOf(".")+1)}var s=this.classes[p].constructor();var u={};for(var q in s){u[q]=s[q]}var t=s.prototype;s=this.getClass(this.classes[p].parentClass).extend(s,j);for(q in t){s.prototype[q]=t[q]}for(q in u){s[q]=u[q]}this.compiled.push({name:this.classes[p].className,value:s});this.classes.splice(p,1);p--}}if(r===this.classes.length){throw {message:"Cannot compile remainig classes. They all have dependencies not registered with this constructor",classes:this.classes}}}};function g(l,j,k){this.rootNamespace=l;this.baseClass=j;this.dependencies=k||[];this.classes=[]}g.prototype.namespaceCorrectly=function(j){if(this.rootNamespace&&j&&j.indexOf(this.rootNamespace+".")===0){j=j.substr(this.rootNamespace.length+1)}return j};g.prototype.registerClass=function(o,r,n){var r=!r||r===this.baseClass?this.baseClass:this.namespaceCorrectly(r);var s={className:this.namespaceCorrectly(o),constructor:n,parentClass:r,dependencies:[r]};for(var p=0,q=this.classes.length;p<q;p++){if(this.classes[p].className===s.className){throw"There is already a class named "+o}}for(p=3,q=arguments.length;p<q;p++){s.dependencies.push(this.namespaceCorrectly(arguments[p]))}this.classes.push(s)};g.append=function(m,q){var p=m.name.split(".");for(var n=0,o=p.length-1;n<o;n++){q=q[p[n]]=q[p[n]]||{}}q[p[n]]=m.value};g.prototype.compile=function(q){q=q||{};var m=[this.baseClass];for(var n=0,p=this.dependencies.length;n<p;n++){m.push(this.dependencies[n])}var o=new i(this.classes,m);o.compile();for(n=1,p=o.compiled.length;n<p;n++){g.append(o.compiled[n],q)}return q};return g})();var d=new Wipeout.compiler("Wipeout","wo.object",["wo.visual","wo.view","wo.contentControl","wo.itemsControl","wo.if"]);window.NS=function(k){k=k.split(".");var h=window;for(var i=0,j=k.length;i<j;i++){h=h[k[i]]||(h[k[i]]={})}return h};window.vmChooser=function(g){g=ko.unwrap(g);if(g==null){return null}throw"Unknown model type"};d.registerClass("Wipeout.Docs.ViewModels.Application","wo.view",function(){function g(){this._super("Wipeout.Docs.ViewModels.Application");this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage,function(h){this.model().content(h.data)},this)}g.prototype.onRendered=function(){this._super.apply(this,arguments);this.templateItems.treeView.select()};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.CodeBlock","wo.view",function(){var g=function(h){this._super(h||"Wipeout.Docs.ViewModels.Components.CodeBlock");this.code=ko.observable();this.code.subscribe(this.onCodeChanged,this)};g.prototype.onCodeChanged=function(h){};g.prototype.onRendered=function(){this._super.apply(this,arguments);prettyPrint(null,this.templateItems.codeBlock)};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.DynamicRender","wo.contentControl",function(){var g=function(){this._super();this.content=ko.observable();this.template("<!-- ko render: content --><!-- /ko -->")};g.prototype.onModelChanged=function(j,h){this._super(j,h);var j=this.content();if(h==null){this.content(null)}else{var i=null;if(h instanceof Wipeout.Docs.Models.Pages.LandingPage){i=new Wipeout.Docs.ViewModels.Pages.LandingPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Class){i=new Wipeout.Docs.ViewModels.Pages.ClassPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Event){i=new Wipeout.Docs.ViewModels.Pages.EventPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Property){i=new Wipeout.Docs.ViewModels.Pages.PropertyPage()}else{if(h instanceof Wipeout.Docs.Models.Descriptions.Function){i=new Wipeout.Docs.ViewModels.Pages.FunctionPage()}else{throw"Unknown model type"}}}}}i.model(h);this.content(i)}};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.JsCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var g=function(){this._super.apply(this,arguments)};g.prototype.onCodeChanged=function(h){new Function(h.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))()};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.TemplateCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var g=function(){g.staticConstructor();this._super.apply(this,arguments)};var h;g.staticConstructor=function(){if(h){return}h=document.createElement("div");h.setAttribute("style","display: none");document.getElementsByTagName("body")[0].appendChild(h)};g.prototype.onCodeChanged=function(i){h.innerHTML+=i.replace(/\&lt;/g,"<").replace(/\&gt;/g,">")};return g});d.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch","wo.view",function(){var g=function(){this._super(g.nullTemplate)};g.branchTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";g.leafTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";g.nullTemplate=wo.visual.getBlankTemplateId();g.prototype.onModelChanged=function(i,h){this._super(i,h);if(h&&(h.branches||h.payload())){this.templateId(g.branchTemplate)}else{if(h){this.templateId(g.leafTemplate)}else{this.templateId(g.nullTemplate)}}};g.prototype.select=function(){if(this.model().branches){$(this.templateItems.content).toggle()}var h=this.model().payload();if($(this.templateItems.content).filter(":visible").length&&h){this.triggerRoutedEvent(g.renderPage,h)}};g.renderPage=new wo.routedEvent();return g});d.registerClass("Wipeout.Docs.ViewModels.Components.UsageCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var g=function(){this._super("Wipeout.Docs.ViewModels.Components.UsageCodeBlock");this.usage=ko.observable()};g.prototype.onCodeChanged=function(h){this.usage(h.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))};return g});d.registerClass("Wipeout.Docs.ViewModels.Pages.ClassItemTable","wo.itemsControl",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassItemTable","Wipeout.Docs.ViewModels.Pages.ClassItemRow")}});d.registerClass("Wipeout.Docs.ViewModels.Pages.ClassPage","wo.view",function(){var g=function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassPage");this.usagesTemplateId=ko.computed(function(){if(this.model()){var h=this.model().classFullName+g.classUsagesTemplateSuffix;if(document.getElementById(h)){return h}}return wo.contentControl.getBlankTemplateId()},this)};g.classUsagesTemplateSuffix="_ClassUsages";return g});d.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage")}});d.registerClass("Wipeout.Docs.ViewModels.Pages.LandingPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.LandingPage")}});d.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage")}});d.registerClass("Wipeout.Docs.Models.Application","wo.object",function(){return function(){this.content=ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());var k=new Wipeout.Docs.Models.Components.Api();var j=(function(){var F=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",k.forClass("wo.object"));var I=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",k.forClass("wo.routedEventModel"));var L=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",k.forClass("wo.visual"));var K=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",k.forClass("wo.view"));var g=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",k.forClass("wo.contentControl"));var z=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",k.forClass("wo.if"));var A=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",k.forClass("wo.itemsControl"));var x=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",k.forClass("wo.event"));var H=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",k.forClass("wo.routedEvent"));var G=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",k.forClass("wo.routedEventArgs"));var J=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",k.forClass("wo.routedEventRegistration"));var y=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",k.forClass("wo.html"));var D=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",k.forClass("wo.ko.virtualElements"));var B=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",k.forClass("wipeout.utils.ko.array"));var C=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",k.forClass("wo.ko"),{staticProperties:{virtualElements:D,array:B}});var E=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",k.forClass("wo.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("wo",[g,x,z,y,A,C,E,F,H,G,I,J,K,L])})();var h=(function(){var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",k.forClass("wipeout.bindings.itemsControl"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",k.forClass("wipeout.bindings.render"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",k.forClass("wipeout.bindings.wipeout-type"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",k.forClass("wipeout.bindings.wo"));var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",k.forClass("wipeout.bindings.wipeout"));var g=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",k.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[g,p,q,r,o,n])})();var i=(function(){var g=(function(){var A=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",k.forClass("wo.object"));var D=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",k.forClass("wo.routedEventModel"));var G=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",k.forClass("wo.visual"));var F=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",k.forClass("wo.view"));var w=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",k.forClass("wo.contentControl"));var y=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",k.forClass("wo.if"));var z=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",k.forClass("wo.itemsControl"));var x=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",k.forClass("wo.event"));var C=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",k.forClass("wo.routedEvent"));var B=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",k.forClass("wo.routedEventArgs"));var E=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",k.forClass("wo.routedEventRegistration"));return new Wipeout.Docs.Models.Components.TreeViewBranch("base",[w,x,y,z,A,C,B,D,E,F,G])})();var l=(function(){var u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",k.forClass("wipeout.bindings.itemsControl"));var v=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",k.forClass("wipeout.bindings.render"));var w=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",k.forClass("wipeout.bindings.wipeout-type"));var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",k.forClass("wipeout.bindings.wo"));var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",k.forClass("wipeout.bindings.wipeout"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",k.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[r,u,v,w,t,s])})();var m=(function(){k.forClass("ko.templateEngine");var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine",k.forClass("wipeout.template.engine"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder",k.forClass("wipeout.template.htmlBuilder"));return new Wipeout.Docs.Models.Components.TreeViewBranch("template",[o,p])})();var n=(function(){var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",k.forClass("wipeout.utils.html"));var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",k.forClass("wipeout.utils.ko.virtualElements"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",k.forClass("wipeout.utils.ko.array"));var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",k.forClass("wipeout.utils.ko"),{staticProperties:{virtualElements:t,array:r}});var u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",k.forClass("wipeout.utils.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("utils",[q,s,u])})();return new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout (debug mode only)",[g,l,m,n])})();this.menu=new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout",[new Wipeout.Docs.Models.Components.TreeViewBranch("API",[j,h,i])])}});var e=function(k,i,j){j=j||window;if(k){for(var l=0,m=k.length;l<m;l++){i.call(j,k[l],l)}}};var f=function(h,i){var g=i||window;e(h.split("."),function(j){g=g[j]});return g};d.registerClass("Wipeout.Docs.Models.Components.Api","wo.object",function(){var g=function(h){this._super();this.classes=[]};g.prototype.getClassDescription=function(h){for(var i=0,j=this.classes.length;i<j;i++){if(this.classes[i].classConstructor===h){return this.classes[i].classDescription}}};g.prototype.forClass=function(j){var i=f(j);var l=this.getClassDescription(i);if(l){return l}var k=new Wipeout.Docs.Models.Descriptions.Class(j,this);this.classes.push({classDescription:k,classConstructor:i});return k};return g});d.registerClass("Wipeout.Docs.Models.Components.ClassTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){var g=function(j,h,i){this._super(j,h,g.compileBranches(h,i))};g.compileBranches=function(h,i){var j=[];i=i||{};i.staticEvents=i.staticEvents||{};i.staticProperties=i.staticProperties||{};i.staticFunctions=i.staticFunctions||{};i.events=i.events||{};i.properties=i.properties||{};i.functions=i.functions||{};j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch("constructor"));e(h.staticEvents,function(k){if(i.staticEvents[k.eventName]){j.push(i.staticEvents[k.eventName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.eventName,null))}});e(h.staticProperties,function(k){if(i.staticProperties[k.propertyName]){j.push(i.staticProperties[k.propertyName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.propertyName,null))}});e(h.staticFunctions,function(k){if(i.staticFunctions[k.functionName]){j.push(i.staticFunctions[k.functionName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.functionName,null))}});e(h.events,function(k){if(i.events[k.eventName]){j.push(i.events[k.eventName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.eventName,null))}});e(h.properties,function(k){if(i.staticProperties[k.propertyName]){j.push(i.staticProperties[k.propertyName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.propertyName,null))}});e(h.functions,function(k){if(i.functions[k.functionName]){j.push(i.functions[k.functionName])}else{j.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(k.functionName,null))}});j.sort(function(){return arguments[0].name==="constructor"?-1:arguments[0].name.localeCompare(arguments[1].name)});return j};return g});d.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch","Wipeout.Docs.Models.Components.TreeViewBranch",function(){var g=function(i,j,h){this._super(i,h);this.page=j};g.prototype.payload=function(){return this.page};return g});d.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch","wo.object",function(){var g=function(i,h){this._super();this.name=i;this.branches=h};g.prototype.payload=function(){return null};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.Class","wo.object",function(){var g=function(i,h){this._super();this.className=g.getClassName(i);this.constructorFunction=f(i);this.classFullName=i;this.api=h;this.classConstructor=null;this.events=[];this.staticEvents=[];this.properties=[];this.staticProperties=[];this.functions=[];this.staticFunctions=[];this.rebuild()};g.getClassName=function(h){h=h.split(".");return h[h.length-1]};g.prototype.rebuild=function(){this.classConstructor=null;this.events.length=0;this.staticEvents.length=0;this.properties.length=0;this.staticProperties.length=0;this.functions.length=0;this.staticFunctions.length=0;for(var p in this.constructorFunction){if(this.constructorFunction.hasOwnProperty(p)){if(this.constructorFunction[p] instanceof wo.event){this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,p,this.classFullName))}else{if(this.constructorFunction[p] instanceof Function&&!ko.isObservable(this.constructorFunction[p])){this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[p],p,this.classFullName))}else{this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,p,this.classFullName))}}}}for(var p in this.constructorFunction.prototype){if(this.constructorFunction.prototype.hasOwnProperty(p)){if(this.constructorFunction.prototype[p] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,p,this.classFullName))}else{if(this.constructorFunction.prototype[p] instanceof Function&&!ko.isObservable(this.constructorFunction.prototype[p])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[p],p,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,p,this.classFullName))}}}}if(this.constructorFunction.constructor===Function){var i=new this.constructorFunction();for(var p in i){if(i.hasOwnProperty(p)){if(i[p] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,p,this.classFullName))}else{if(i[p] instanceof Function&&!ko.isObservable(i[p])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(i[p],p,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,p,this.classFullName))}}}}}if(this.constructorFunction.constructor===Function){var o=this.constructorFunction;while((o=Object.getPrototypeOf(o.prototype).constructor)!==Object){var r=this.api.getClassDescription(o);if(!r){throw"Class has not been defined yet"}var n=function(h,j){e(r[h],function(k){if(this[h].indexOf(k)!==-1){return}for(var l=0,m=this[h].length;l<m;l++){if(this[h][l][j]===k[j]){if(!this[h][l].overrides){this[h][l].overrides=k}return}}this[h].push(k)},this)};n.call(this,"events","eventName");n.call(this,"properties","propertyName");n.call(this,"functions","functionName")}}var s=function(h){e(this[h],function(k){var j=k;while(j&&j.overrides&&!j.summary){if(j.overrides.summary){j.summary=j.overrides.summary+(j.overrides.summaryInherited?"":" (from "+j.overrides.classFullName+")");j.summaryInherited=true}j=j.overrides}})};s.call(this,"staticProperties");s.call(this,"staticFunctions");s.call(this,"staticEvents");s.call(this,"events");s.call(this,"properties");s.call(this,"functions");for(var p=0,q=this.functions.length;p<q;p++){if(this.functions[p].functionName==="constructor"){this.classConstructor=this.functions.splice(p,1)[0];break}}if(p===this.functions.length){this.classConstructor=new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction,this.className,this.classFullName)}var t=function(){return arguments[0].name.localeCompare(arguments[1].name)};this.events.sort(t);this.staticEvents.sort(t);this.properties.sort(t);this.staticProperties.sort(t);this.functions.sort(t);this.staticFunctions.sort(t)};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.ClassItem","wo.object",function(){return function(g,h){this._super();this.name=g;this.summary=h}});d.registerClass("Wipeout.Docs.Models.Descriptions.Event","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var g=function(i,j,h){this._super(j,Wipeout.Docs.Models.Descriptions.PropertyDescription.getPropertySummary(i,j));this.eventName=j;this.classFullName=h};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.Function","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var g=function(j,i,h){this._super(i,g.getFunctionSummary(j));this["function"]=j;this.functionName=i;this.classFullName=h;this.overrides=null};g.getFunctionSummary=function(n){var j=n.toString();var l=false;var k=false;var m=function(){var i=j.indexOf("//");var h=j.indexOf("/*");var o=j.indexOf("{");if(i===-1){i=Number.MAX_VALUE}if(h===-1){h=Number.MAX_VALUE}if(o<i&&o<h){j=j.substr(o+1).replace(/^\s+|\s+$/g,"")}else{if(i<h){j=j.substr(j.indexOf("\n")).replace(/^\s+|\s+$/g,"")}else{j=j.substr(j.indexOf("*/")).replace(/^\s+|\s+$/g,"")}m()}};m();if(j.indexOf("///<summary>")===0){return j.substring(12,j.indexOf("</summary>"))}return""};return g});d.registerClass("Wipeout.Docs.Models.Descriptions.PropertyDescription","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var h=function(j,k,i){this._super(k,h.getPropertySummary(j,k,i));this.propertyName=k;this.classFullName=i};var g=/^\/\//;h.getPropertySummary=function(l,m,k){var n;if(n=h.getPropertyDescriptionOverride(k+"."+m)){return n}l=l.toString();var o=function(q){var j=l.search(q);if(j!==-1){var i=l.substring(0,j);var p=i.lastIndexOf("\n");if(p>0){i=i.substring(p)}i=i.replace(/^\s+|\s+$/g,"");if(g.test(i)){return i.substring(2)}else{return null}}};n=o(new RegExp("\\s*this\\s*\\.\\s*"+m+"\\s*="));if(n){return n}return o(new RegExp('\\s*this\\s*\\[\\s*"'+m+'"\\s*\\]\\s*='))};h.getPropertyDescriptionOverride=function(i){var j=h.descriptionOverrides;e(i.split("."),function(k){if(!j){return}j=j[k]});return j};h.descriptionOverrides={wo:{"if":{woInvisibleDefault:"The default value for woInvisible for the wo.if class."},html:{specialTags:"A list of html tags which cannot be placed inside a div element."},ko:{array:"Utils for operating on observableArrays",virtualElements:"Utils for operating on knockout virtual elements"},object:{useVirtualCache:"When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."},view:{objectParser:"Used to parse string values into a given type",reservedPropertyNames:"Properties which cannot be set on a wipeout object via the template"},visual:{reservedTags:"A list of names which cannot be used as wipeout object names. These are mostly html tag names",woInvisibleDefault:"The default value for woInvisible for the wo.visual class."}},wipeout:{template:{engine:{closeCodeTag:'Signifies the end of a wipeout code block. "'+wipeout.template.engine.closeCodeTag+'".',instance:"An instance of a wipeout.template.engine which is used by the render binding.",openCodeTag:'Signifies the beginning of a wipeout code block. "'+wipeout.template.engine.openCodeTag+'".',scriptCache:"A placeholder for precompiled scripts.",scriptHasBeenReWritten:"TODO"}}}};return h});d.registerClass("Wipeout.Docs.Models.Pages.DisplayItem","wo.object",function(){return function(g){this._super();this.title=g}});d.registerClass("Wipeout.Docs.Models.Pages.LandingPage","Wipeout.Docs.Models.Pages.DisplayItem",function(){return function(g){this._super(g)}});d.compile(window.Wipeout)})();a.registerClass("Wipeout.Docs.Models.Application","wo.object",function(){return function(){this.content=ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());var g=new Wipeout.Docs.Models.Components.Api();var f=(function(){var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",g.forClass("wo.object"));var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",g.forClass("wo.routedEventModel"));var w=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",g.forClass("wo.visual"));var v=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",g.forClass("wo.view"));var h=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",g.forClass("wo.contentControl"));var k=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",g.forClass("wo.if"));var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",g.forClass("wo.itemsControl"));var i=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",g.forClass("wo.event"));var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",g.forClass("wo.routedEvent"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",g.forClass("wo.routedEventArgs"));var u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",g.forClass("wo.routedEventRegistration"));var j=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",g.forClass("wo.html"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",g.forClass("wo.ko.virtualElements"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",g.forClass("wipeout.utils.ko.array"));var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",g.forClass("wo.ko"),{staticProperties:{virtualElements:o,array:m}});var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",g.forClass("wo.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("wo",[h,i,k,j,l,n,p,q,s,r,t,u,v,w])})();var d=(function(){var k=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",g.forClass("wipeout.bindings.itemsControl"));var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",g.forClass("wipeout.bindings.render"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",g.forClass("wipeout.bindings.wipeout-type"));var j=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",g.forClass("wipeout.bindings.wo"));var i=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",g.forClass("wipeout.bindings.wipeout"));var h=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",g.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[h,k,l,m,j,i])})();var e=(function(){var h=(function(){var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",g.forClass("wo.object"));var s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",g.forClass("wo.routedEventModel"));var v=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",g.forClass("wo.visual"));var u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",g.forClass("wo.view"));var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",g.forClass("wo.contentControl"));var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",g.forClass("wo.if"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",g.forClass("wo.itemsControl"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",g.forClass("wo.event"));var r=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",g.forClass("wo.routedEvent"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",g.forClass("wo.routedEventArgs"));var t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",g.forClass("wo.routedEventRegistration"));return new Wipeout.Docs.Models.Components.TreeViewBranch("base",[l,m,n,o,p,r,q,s,t,u,v])})();var i=(function(){var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",g.forClass("wipeout.bindings.itemsControl"));var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",g.forClass("wipeout.bindings.render"));var q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",g.forClass("wipeout.bindings.wipeout-type"));var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",g.forClass("wipeout.bindings.wo"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",g.forClass("wipeout.bindings.wipeout"));var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",g.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[l,o,p,q,n,m])})();var j=(function(){g.forClass("ko.templateEngine");var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine",g.forClass("wipeout.template.engine"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder",g.forClass("wipeout.template.htmlBuilder"));return new Wipeout.Docs.Models.Components.TreeViewBranch("template",[l,m])})();var k=(function(){var l=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",g.forClass("wipeout.utils.html"));var o=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",g.forClass("wipeout.utils.ko.virtualElements"));var m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",g.forClass("wipeout.utils.ko.array"));var n=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",g.forClass("wipeout.utils.ko"),{staticProperties:{virtualElements:o,array:m}});var p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",g.forClass("wipeout.utils.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("utils",[l,n,p])})();return new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout (debug mode only)",[h,i,j,k])})();this.menu=new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout",[new Wipeout.Docs.Models.Components.TreeViewBranch("API",[f,d,e])])}});a.registerClass("Wipeout.Docs.Models.Components.Api","wo.object",function(){var d=function(e){this._super();this.classes=[]};d.prototype.getClassDescription=function(e){for(var f=0,g=this.classes.length;f<g;f++){if(this.classes[f].classConstructor===e){return this.classes[f].classDescription}}};d.prototype.forClass=function(f){var e=c(f);var h=this.getClassDescription(e);if(h){return h}var g=new Wipeout.Docs.Models.Descriptions.Class(f,this);this.classes.push({classDescription:g,classConstructor:e});return g};return d});a.registerClass("Wipeout.Docs.Models.Components.ClassTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){var d=function(g,e,f){this._super(g,e,d.compileBranches(e,f))};d.compileBranches=function(e,f){var g=[];f=f||{};f.staticEvents=f.staticEvents||{};f.staticProperties=f.staticProperties||{};f.staticFunctions=f.staticFunctions||{};f.events=f.events||{};f.properties=f.properties||{};f.functions=f.functions||{};g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch("constructor"));b(e.staticEvents,function(h){if(f.staticEvents[h.eventName]){g.push(f.staticEvents[h.eventName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.eventName,null))}});b(e.staticProperties,function(h){if(f.staticProperties[h.propertyName]){g.push(f.staticProperties[h.propertyName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.propertyName,null))}});b(e.staticFunctions,function(h){if(f.staticFunctions[h.functionName]){g.push(f.staticFunctions[h.functionName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.functionName,null))}});b(e.events,function(h){if(f.events[h.eventName]){g.push(f.events[h.eventName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.eventName,null))}});b(e.properties,function(h){if(f.staticProperties[h.propertyName]){g.push(f.staticProperties[h.propertyName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.propertyName,null))}});b(e.functions,function(h){if(f.functions[h.functionName]){g.push(f.functions[h.functionName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.functionName,null))}});g.sort(function(){return arguments[0].name==="constructor"?-1:arguments[0].name.localeCompare(arguments[1].name)});return g};return d});a.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch","Wipeout.Docs.Models.Components.TreeViewBranch",function(){var d=function(f,g,e){this._super(f,e);this.page=g};d.prototype.payload=function(){return this.page};return d});a.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch","wo.object",function(){var d=function(f,e){this._super();this.name=f;this.branches=e};d.prototype.payload=function(){return null};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.Class","wo.object",function(){var d=function(f,e){this._super();this.className=d.getClassName(f);this.constructorFunction=c(f);this.classFullName=f;this.api=e;this.classConstructor=null;this.events=[];this.staticEvents=[];this.properties=[];this.staticProperties=[];this.functions=[];this.staticFunctions=[];this.rebuild()};d.getClassName=function(e){e=e.split(".");return e[e.length-1]};d.prototype.rebuild=function(){this.classConstructor=null;this.events.length=0;this.staticEvents.length=0;this.properties.length=0;this.staticProperties.length=0;this.functions.length=0;this.staticFunctions.length=0;for(var h in this.constructorFunction){if(this.constructorFunction.hasOwnProperty(h)){if(this.constructorFunction[h] instanceof wo.event){this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,h,this.classFullName))}else{if(this.constructorFunction[h] instanceof Function&&!ko.isObservable(this.constructorFunction[h])){this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[h],h,this.classFullName))}else{this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,h,this.classFullName))}}}}for(var h in this.constructorFunction.prototype){if(this.constructorFunction.prototype.hasOwnProperty(h)){if(this.constructorFunction.prototype[h] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,h,this.classFullName))}else{if(this.constructorFunction.prototype[h] instanceof Function&&!ko.isObservable(this.constructorFunction.prototype[h])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[h],h,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,h,this.classFullName))}}}}if(this.constructorFunction.constructor===Function){var e=new this.constructorFunction();for(var h in e){if(e.hasOwnProperty(h)){if(e[h] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,h,this.classFullName))}else{if(e[h] instanceof Function&&!ko.isObservable(e[h])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(e[h],h,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction,h,this.classFullName))}}}}}if(this.constructorFunction.constructor===Function){var g=this.constructorFunction;while((g=Object.getPrototypeOf(g.prototype).constructor)!==Object){var k=this.api.getClassDescription(g);if(!k){throw"Class has not been defined yet"}var f=function(i,n){b(k[i],function(o){if(this[i].indexOf(o)!==-1){return}for(var p=0,q=this[i].length;p<q;p++){if(this[i][p][n]===o[n]){if(!this[i][p].overrides){this[i][p].overrides=o}return}}this[i].push(o)},this)};f.call(this,"events","eventName");f.call(this,"properties","propertyName");f.call(this,"functions","functionName")}}var l=function(i){b(this[i],function(o){var n=o;while(n&&n.overrides&&!n.summary){if(n.overrides.summary){n.summary=n.overrides.summary+(n.overrides.summaryInherited?"":" (from "+n.overrides.classFullName+")");n.summaryInherited=true}n=n.overrides}})};l.call(this,"staticProperties");l.call(this,"staticFunctions");l.call(this,"staticEvents");l.call(this,"events");l.call(this,"properties");l.call(this,"functions");for(var h=0,j=this.functions.length;h<j;h++){if(this.functions[h].functionName==="constructor"){this.classConstructor=this.functions.splice(h,1)[0];break}}if(h===this.functions.length){this.classConstructor=new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction,this.className,this.classFullName)}var m=function(){return arguments[0].name.localeCompare(arguments[1].name)};this.events.sort(m);this.staticEvents.sort(m);this.properties.sort(m);this.staticProperties.sort(m);this.functions.sort(m);this.staticFunctions.sort(m)};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.ClassItem","wo.object",function(){return function(d,e){this._super();this.name=d;this.summary=e}});a.registerClass("Wipeout.Docs.Models.Descriptions.Event","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var d=function(f,g,e){this._super(g,Wipeout.Docs.Models.Descriptions.PropertyDescription.getPropertySummary(f,g));this.eventName=g;this.classFullName=e};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.Function","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var d=function(g,f,e){this._super(f,d.getFunctionSummary(g));this["function"]=g;this.functionName=f;this.classFullName=e;this.overrides=null};d.getFunctionSummary=function(i){var e=i.toString();var g=false;var f=false;var h=function(){var k=e.indexOf("//");var j=e.indexOf("/*");var l=e.indexOf("{");if(k===-1){k=Number.MAX_VALUE}if(j===-1){j=Number.MAX_VALUE}if(l<k&&l<j){e=e.substr(l+1).replace(/^\s+|\s+$/g,"")}else{if(k<j){e=e.substr(e.indexOf("\n")).replace(/^\s+|\s+$/g,"")}else{e=e.substr(e.indexOf("*/")).replace(/^\s+|\s+$/g,"")}h()}};h();if(e.indexOf("///<summary>")===0){return e.substring(12,e.indexOf("</summary>"))}return""};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.PropertyDescription","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var e=function(g,h,f){this._super(h,e.getPropertySummary(g,h,f));this.propertyName=h;this.classFullName=f};var d=/^\/\//;e.getPropertySummary=function(g,h,f){var i;if(i=e.getPropertyDescriptionOverride(f+"."+h)){return i}g=g.toString();var j=function(n){var l=g.search(n);if(l!==-1){var k=g.substring(0,l);var m=k.lastIndexOf("\n");if(m>0){k=k.substring(m)}k=k.replace(/^\s+|\s+$/g,"");if(d.test(k)){return k.substring(2)}else{return null}}};i=j(new RegExp("\\s*this\\s*\\.\\s*"+h+"\\s*="));if(i){return i}return j(new RegExp('\\s*this\\s*\\[\\s*"'+h+'"\\s*\\]\\s*='))};e.getPropertyDescriptionOverride=function(f){var g=e.descriptionOverrides;b(f.split("."),function(h){if(!g){return}g=g[h]});return g};e.descriptionOverrides={wo:{"if":{woInvisibleDefault:"The default value for woInvisible for the wo.if class."},html:{specialTags:"A list of html tags which cannot be placed inside a div element."},ko:{array:"Utils for operating on observableArrays",virtualElements:"Utils for operating on knockout virtual elements"},object:{useVirtualCache:"When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."},view:{objectParser:"Used to parse string values into a given type",reservedPropertyNames:"Properties which cannot be set on a wipeout object via the template"},visual:{reservedTags:"A list of names which cannot be used as wipeout object names. These are mostly html tag names",woInvisibleDefault:"The default value for woInvisible for the wo.visual class."}},wipeout:{template:{engine:{closeCodeTag:'Signifies the end of a wipeout code block: "'+wipeout.template.engine.closeCodeTag+'".',instance:"An instance of a wipeout.template.engine which is used by the render binding.",openCodeTag:'Signifies the beginning of a wipeout code block: "'+wipeout.template.engine.openCodeTag+'".',scriptCache:"A placeholder for precompiled scripts.",scriptHasBeenReWritten:"TODO"}}}};return e});a.registerClass("Wipeout.Docs.Models.Pages.DisplayItem","wo.object",function(){return function(d){this._super();this.title=d}});a.registerClass("Wipeout.Docs.Models.Pages.LandingPage","Wipeout.Docs.Models.Pages.DisplayItem",function(){return function(d){this._super(d)}});a.registerClass("Wipeout.Docs.ViewModels.Application","wo.view",function(){function d(){this._super("Wipeout.Docs.ViewModels.Application");this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage,function(e){this.model().content(e.data)},this)}d.prototype.onRendered=function(){this._super.apply(this,arguments);this.templateItems.treeView.select()};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.CodeBlock","wo.view",function(){var d=function(e){this._super(e||"Wipeout.Docs.ViewModels.Components.CodeBlock");this.code=ko.observable();this.code.subscribe(this.onCodeChanged,this)};d.prototype.onCodeChanged=function(e){};d.prototype.onRendered=function(){this._super.apply(this,arguments);prettyPrint(null,this.templateItems.codeBlock)};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.DynamicRender","wo.contentControl",function(){var d=function(){this._super();this.content=ko.observable();this.template("<!-- ko render: content --><!-- /ko -->")};d.prototype.onModelChanged=function(g,e){this._super(g,e);var g=this.content();if(e==null){this.content(null)}else{var f=null;if(e instanceof Wipeout.Docs.Models.Pages.LandingPage){f=new Wipeout.Docs.ViewModels.Pages.LandingPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Class){f=new Wipeout.Docs.ViewModels.Pages.ClassPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Event){f=new Wipeout.Docs.ViewModels.Pages.EventPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Property){f=new Wipeout.Docs.ViewModels.Pages.PropertyPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Function){f=new Wipeout.Docs.ViewModels.Pages.FunctionPage()}else{throw"Unknown model type"}}}}}f.model(e);this.content(f)}};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.JsCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var d=function(){this._super.apply(this,arguments)};d.prototype.onCodeChanged=function(e){new Function(e.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))()};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.TemplateCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var d=function(){d.staticConstructor();this._super.apply(this,arguments)};var e;d.staticConstructor=function(){if(e){return}e=document.createElement("div");e.setAttribute("style","display: none");document.getElementsByTagName("body")[0].appendChild(e)};d.prototype.onCodeChanged=function(f){e.innerHTML+=f.replace(/\&lt;/g,"<").replace(/\&gt;/g,">")};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch","wo.view",function(){var d=function(){this._super(d.nullTemplate)};d.branchTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";d.leafTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";d.nullTemplate=wo.visual.getBlankTemplateId();d.prototype.onModelChanged=function(f,e){this._super(f,e);if(e&&(e.branches||e.payload())){this.templateId(d.branchTemplate)}else{if(e){this.templateId(d.leafTemplate)}else{this.templateId(d.nullTemplate)}}};d.prototype.select=function(){if(this.model().branches){$(this.templateItems.content).toggle()}var e=this.model().payload();if($(this.templateItems.content).filter(":visible").length&&e){this.triggerRoutedEvent(d.renderPage,e)}};d.renderPage=new wo.routedEvent();return d});a.registerClass("Wipeout.Docs.ViewModels.Components.UsageCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var d=function(){this._super("Wipeout.Docs.ViewModels.Components.UsageCodeBlock");this.usage=ko.observable()};d.prototype.onCodeChanged=function(e){this.usage(e.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))};return d});a.registerClass("Wipeout.Docs.ViewModels.Pages.ClassItemTable","wo.itemsControl",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassItemTable","Wipeout.Docs.ViewModels.Pages.ClassItemRow")}});a.registerClass("Wipeout.Docs.ViewModels.Pages.ClassPage","wo.view",function(){var d=function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassPage");this.usagesTemplateId=ko.computed(function(){if(this.model()){var e=this.model().classFullName+d.classUsagesTemplateSuffix;if(document.getElementById(e)){return e}}return wo.contentControl.getBlankTemplateId()},this)};d.classUsagesTemplateSuffix="_ClassUsages";return d});a.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage")}});a.registerClass("Wipeout.Docs.ViewModels.Pages.LandingPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.LandingPage")}});a.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage")}});a.compile(window.Wipeout)})();

compiler.registerClass("Wipeout.Docs.Models.Application", "wo.object", function() {
    
    return function() {
        
        this.content = ko.observable(new Wipeout.Docs.Models.Pages.LandingPage());
        
        var currentApi = new Wipeout.Docs.Models.Components.Api();
                
        //wo
        var _wo = (function() {
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
            
            var htmlBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html", currentApi.forClass("wo.html"));
            var koVirtualElementsBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements", currentApi.forClass("wo.ko.virtualElements"));
            var koArrayBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wipeout.utils.ko.array"));
            var koBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko", currentApi.forClass("wo.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch, "array": koArrayBranch}});
            var objBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj", currentApi.forClass("wo.obj"));
            
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
        
        this.menu =
            new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout", [
                new Wipeout.Docs.Models.Components.TreeViewBranch("API", [
                    _wo,
                    _bindings,
                    _wipeout
                ])
        ]);        
    };
});

compiler.registerClass("Wipeout.Docs.Models.Components.Api", "wo.object", function() {    
    
    var api = function(rootNamespace) {
        this._super();
        
        this.classes = [];
    };
    
    api.prototype.getClassDescription = function(classConstructor) {
        for(var i = 0, ii = this.classes.length; i < ii; i++)            
            if(this.classes[i].classConstructor === classConstructor)
                return this.classes[i].classDescription;
    };
    
    api.prototype.forClass = function(className) {
        
        var classConstructor = get(className);
        var result = this.getClassDescription(classConstructor);
        if(result)
            return result;
        
        var desc = new Wipeout.Docs.Models.Descriptions.Class(className, this);
        this.classes.push({
            classDescription: desc,
            classConstructor: classConstructor
        });
        
        return desc;
    };
    
    return api;
});

compiler.registerClass("Wipeout.Docs.Models.Components.ClassTreeViewBranch", "Wipeout.Docs.Models.Components.PageTreeViewBranch", function() {
    var classTreeViewBranch = function(name, classDescription, customBranches) {
        this._super(name, classDescription, classTreeViewBranch.compileBranches(classDescription, customBranches));
    };
    
    classTreeViewBranch.compileBranches = function(classDescription, customBranches /*optional*/) {
        var output = [];
        
        customBranches = customBranches || {};
        customBranches.staticEvents = customBranches.staticEvents || {};
        customBranches.staticProperties = customBranches.staticProperties || {};
        customBranches.staticFunctions = customBranches.staticFunctions || {};
        customBranches.events = customBranches.events || {};
        customBranches.properties = customBranches.properties || {};
        customBranches.functions = customBranches.functions || {};
        
        output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch("constructor"));    
        
        enumerate(classDescription.staticEvents, function(event) {
            if(customBranches.staticEvents[event.eventName])
                output.push(customBranches.staticEvents[event.eventName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(event.eventName, null));            
        });
        
        enumerate(classDescription.staticProperties, function(property) {
            if(customBranches.staticProperties[property.propertyName])
                output.push(customBranches.staticProperties[property.propertyName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(property.propertyName, null));
        });
        
        enumerate(classDescription.staticFunctions, function(_function) {
            if(customBranches.staticFunctions[_function.functionName])
                output.push(customBranches.staticFunctions[_function.functionName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(_function.functionName, null));            
        });
        
        enumerate(classDescription.events, function(event) {
            if(customBranches.events[event.eventName])
                output.push(customBranches.events[event.eventName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(event.eventName, null));            
        });
        
        enumerate(classDescription.properties, function(property) {
            if(customBranches.staticProperties[property.propertyName])
                output.push(customBranches.staticProperties[property.propertyName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(property.propertyName, null));            
        });
        
        enumerate(classDescription.functions, function(_function) {
            if(customBranches.functions[_function.functionName])
                output.push(customBranches.functions[_function.functionName]);
            else
                output.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(_function.functionName, null));            
        });
        
        output.sort(function() { return arguments[0].name === "constructor" ? -1 : arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    return classTreeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch", "Wipeout.Docs.Models.Components.TreeViewBranch", function() {
    var pageTreeViewBranch = function(name, page, branches) {
        this._super(name, branches);
            
        this.page = page;
    };
    
    pageTreeViewBranch.prototype.payload = function() {
        return this.page;
    };
    
    return pageTreeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch", "wo.object", function() {
    var treeViewBranch = function(name, branches) {
        this._super();
            
        this.name = name;
        this.branches = branches;
    };
    
    treeViewBranch.prototype.payload = function() {
        return null;
    };
    
    return treeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Class", "wo.object", function() {
    var classDescription = function(classFullName, api) {
        this._super();
        
        this.className = classDescription.getClassName(classFullName);
        this.constructorFunction = get(classFullName);
        this.classFullName = classFullName;
        this.api = api;
        
        this.classConstructor = null;
        this.events = [];
        this.staticEvents = [];
        this.properties = [];
        this.staticProperties = [];
        this.functions = [];
        this.staticFunctions = [];
        
        this.rebuild();
    };
    
    classDescription.getClassName = function(classFullName) {
        classFullName = classFullName.split(".");
        return classFullName[classFullName.length - 1];
    };
    
    classDescription.prototype.rebuild = function() {
        this.classConstructor = null;
        this.events.length = 0;
        this.staticEvents.length = 0;
        this.properties.length = 0;
        this.staticProperties.length = 0;
        this.functions.length = 0;
        this.staticFunctions.length = 0;
                
        for(var i in this.constructorFunction) {
            if(this.constructorFunction.hasOwnProperty(i)) {
                if(this.constructorFunction[i] instanceof wo.event) {
                    this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName));
                } else if(this.constructorFunction[i] instanceof Function && !ko.isObservable(this.constructorFunction[i])) {
                    this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[i], i, this.classFullName));
                } else {
                    this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction, i, this.classFullName));
                }
            }
        }
        
        for(var i in this.constructorFunction.prototype) {
            if(this.constructorFunction.prototype.hasOwnProperty(i)) {                    
                if(this.constructorFunction.prototype[i] instanceof wo.event) { 
                    this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName));
                } else if(this.constructorFunction.prototype[i] instanceof Function && !ko.isObservable(this.constructorFunction.prototype[i])) {
                    this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[i], i, this.classFullName));
                } else {
                    this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction, i, this.classFullName));
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            var anInstance = new this.constructorFunction();        
            for(var i in anInstance) {
                if(anInstance.hasOwnProperty(i)) {                    
                    if(anInstance[i] instanceof wo.event) { 
                        this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName));
                    } else if(anInstance[i] instanceof Function && !ko.isObservable(anInstance[i])) { 
                        this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(anInstance[i], i, this.classFullName));
                    } else {
                        this.properties.push(new Wipeout.Docs.Models.Descriptions.PropertyDescription(this.constructorFunction, i, this.classFullName));
                    }
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            var current = this.constructorFunction;
            while((current = Object.getPrototypeOf(current.prototype).constructor) !== Object) {  
                var parentClass = this.api.getClassDescription(current);
                if(!parentClass)
                    throw "Class has not been defined yet";
                
                var copy = function(fromTo, nameProperty) {
                    enumerate(parentClass[fromTo], function(fn) { 
                        if(this[fromTo].indexOf(fn) !== -1) return;
                        
                        for(var i = 0, ii = this[fromTo].length; i < ii; i++) {                    
                            if(this[fromTo][i][nameProperty] === fn[nameProperty]) {
                                if(!this[fromTo][i].overrides)
                                    this[fromTo][i].overrides = fn;
                                
                                return;
                            }
                        }
                        
                        this[fromTo].push(fn);
                    }, this);
                };
                
                // instance items only (no statics)
                copy.call(this, "events", "eventName");
                copy.call(this, "properties", "propertyName");
                copy.call(this, "functions", "functionName");
            }
        }
        
        var pullSummaryFromOverride = function(fromTo) {
            enumerate(this[fromTo], function(item) {
                var current = item;
                while (current && current.overrides && !current.summary) {
                    if(current.overrides.summary) {
                        current.summary = current.overrides.summary + 
                            (current.overrides.summaryInherited ? "" : " (from " + current.overrides.classFullName + ")");
                        current.summaryInherited = true;
                    }
                    
                    current = current.overrides;
                }
            });
        };
        
        pullSummaryFromOverride.call(this, "staticProperties");
        pullSummaryFromOverride.call(this, "staticFunctions");
        pullSummaryFromOverride.call(this, "staticEvents");
        pullSummaryFromOverride.call(this, "events");
        pullSummaryFromOverride.call(this, "properties");
        pullSummaryFromOverride.call(this, "functions");
        
        for(var i = 0, ii = this.functions.length; i < ii; i++) {
            if(this.functions[i].functionName === "constructor") {
                this.classConstructor = this.functions.splice(i, 1)[0];
                break;
            }
        }
        
        if(i === this.functions.length)
            this.classConstructor = new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction, this.className, this.classFullName);
        
        var sort = function() { return arguments[0].name.localeCompare(arguments[1].name); };
        
        this.events.sort(sort);
        this.staticEvents.sort(sort);
        this.properties.sort(sort);
        this.staticProperties.sort(sort);
        this.functions.sort(sort);
        this.staticFunctions.sort(sort);
    };
    
    return classDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.ClassItem", "wo.object", function() {
    return function(itemName, itemSummary) {
        this._super();
        
        this.name = itemName;
        this.summary = itemSummary;
    }
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Event", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var eventDescription = function(constructorFunction, eventName, classFullName) {
        this._super(eventName, Wipeout.Docs.Models.Descriptions.PropertyDescription.getPropertySummary(constructorFunction, eventName));
        
        this.eventName = eventName;
        this.classFullName = classFullName;
    };
    
    return eventDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Function", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction));
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.overrides = null;
    };
        
    functionDescription.getFunctionSummary = function(theFunction) {
        var functionString = theFunction.toString();
        
        var isInlineComment = false;
        var isBlockComment = false;
        
        var removeFunctionDefinition = function() {
            var firstInline = functionString.indexOf("//");
            var firstBlock = functionString.indexOf("/*");
            var openFunction = functionString.indexOf("{");
            
            if(firstInline === -1) firstInline = Number.MAX_VALUE;
            if(firstBlock === -1) firstBlock = Number.MAX_VALUE;
                    
            if(openFunction < firstInline && openFunction < firstBlock) {
                functionString = functionString.substr(openFunction + 1).replace(/^\s+|\s+$/g, '');
            } else { 
                if(firstInline < firstBlock) {
                    functionString = functionString.substr(functionString.indexOf("\n")).replace(/^\s+|\s+$/g, '');
                } else {
                    functionString = functionString.substr(functionString.indexOf("*/")).replace(/^\s+|\s+$/g, '');
                }
                
                removeFunctionDefinition();
            }
        };
        
        removeFunctionDefinition();
        
        if (functionString.indexOf("///<summary>") === 0) {
            return functionString.substring(12, functionString.indexOf("</summary>"));
        }
        
        return "";   
    };  
    
    return functionDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.PropertyDescription", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var property = function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, property.getPropertySummary(constructorFunction, propertyName, classFullName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
    };
    
    var inlineCommentOnly = /^\/\//;
    property.getPropertySummary = function(constructorFunction, propertyName, classFullName) {
        var result;
        if(result =  property.getPropertyDescriptionOverride(classFullName + "." + propertyName))
            return result;
        
        constructorFunction = constructorFunction.toString();
                
        var search = function(regex) {
            var i = constructorFunction.search(regex);
            if(i !== -1) {
                var func = constructorFunction.substring(0, i);
                var lastLine = func.lastIndexOf("\n");
                if(lastLine > 0) {
                    func = func.substring(lastLine);
                } 
                
                func = func.replace(/^\s+|\s+$/g, '');
                if(inlineCommentOnly.test(func))
                    return func.substring(2);
                else
                    return null;
            }
        }
        
        result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName + "\"\\s*\\]\\s*="));        
    };
    
    property.getPropertyDescriptionOverride = function(classDelimitedPropertyName) {
        
        var current = property.descriptionOverrides;
        enumerate(classDelimitedPropertyName.split("."), function(item) {
            if(!current) return;
            current = current[item];
        });
        
        return current;
    };
        
    property.descriptionOverrides = {
        wo: {
            'if': {
                woInvisibleDefault: "The default value for woInvisible for the wo.if class."
            },
            html: {
                specialTags: "A list of html tags which cannot be placed inside a div element."
            },
            ko: {
                array: "Utils for operating on observableArrays",
                virtualElements: "Utils for operating on knockout virtual elements"
            },
            object: {
                useVirtualCache: "When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."
            },
            view: {
                //TODO: give this a page
                objectParser: "Used to parse string values into a given type",
                //TODO: give this a page
                reservedPropertyNames: "Properties which cannot be set on a wipeout object via the template"
            },
            visual: {
                reservedTags: "A list of names which cannot be used as wipeout object names. These are mostly html tag names",
                woInvisibleDefault: "The default value for woInvisible for the wo.visual class."
            }
        },
        wipeout: {
            template: {
                engine: {
                    closeCodeTag: "Signifies the end of a wipeout code block: \"" + wipeout.template.engine.closeCodeTag + "\".",
                    instance: "An instance of a wipeout.template.engine which is used by the render binding.",
                    openCodeTag: "Signifies the beginning of a wipeout code block: \"" + wipeout.template.engine.openCodeTag + "\".",
                    scriptCache: "A placeholder for precompiled scripts.",
                    scriptHasBeenReWritten: "TODO"
                }
            }
        }
    };
    
    return property;
});

compiler.registerClass("Wipeout.Docs.Models.Pages.DisplayItem", "wo.object", function() {
    return function(name) {
        this._super();
        
        this.title = name;
    };
});

compiler.registerClass("Wipeout.Docs.Models.Pages.LandingPage", "Wipeout.Docs.Models.Pages.DisplayItem", function() {
    return function(title) {
       this._super(title); 
    }
});


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
