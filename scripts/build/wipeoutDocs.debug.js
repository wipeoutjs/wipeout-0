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
        
        // skip base classes
        for(i = 1 + this.dependencies.length, ii = ic.compiled.length; i < ii; i++)
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

compiler.registerClass("Wipeout.Docs.Models.HowDoIApplication", "wo.object", function() {
    
    var buildHref = function(parameters) {
        var output = []
        for(var i in parameters)
            output.push(i + "=" + parameters[i]);
        
        return location.origin + location.pathname + "?" + output.join("&");
    };
    
    function HowDoIApplication() {
        this._super();
        
        this.leftHandNav = [{
            header: {
                text: "Get started",
                href: buildHref({article: "get-started"})
            },
            items: [{
                text: "With knockout",
                href: buildHref({article: "get-started-with-knockout"})
            }, {
                text: "With Hello World",
                href: buildHref({article: "get-started-with-hello-world"})
            }, {
                text: "With custom components",
                href: buildHref({article: "get-started-with-custom-components"})
            }, {
                text: "With lists",
                href: buildHref({article: "get-started-with-lists"})
            }]
        }, {
            header: {
                text: "Bind or set properties",
                href: buildHref({article: "bind-or-set-propertes"})
            },
            items: [{
                text: "Bind to a static value",
                href: buildHref({article: "bind-to-static-value"})
            }, {
                text: "Bind to a property on the view model",
                href: buildHref({article: "bind-in-scope"})
            }, {
                text: "Bind to a property on the model",
                href: buildHref({article: "bind-to-model"})
            }, {
                text: "Bind to a property on the parent's view model",
                href: buildHref({article: "bind-to-parents-view-model"})
            }, {
                text: "Set the model from the parent's model",
                href: buildHref({article: "bind-to-parents-model"})
            }, {
                text: "Cascading models",
                href: buildHref({article: "cascading-models"})
            }, {
                text: "Two way bindings",
                href: buildHref({article: "bind-two-way"})
            }, {
                text: "Bind to a global value",
                href: buildHref({article: "bind-to-global"})
            }, {
                text: "Bind in javascript code",
                href: buildHref({article: "bind-in-code"})
            }, {
                text: "Find an ancestor to bind to",
                href: buildHref({article: "bind-to-ancestor"})
            }, {
                text: "Call a method on another object",
                href: buildHref({article: "call-method-out-of-scope"})
            }]
        }, {
            header: {
                text: "Use the wipeout OO framework",
                href: buildHref({article: "wipeout-oo"})
            },
            items: [{
                text: "Inheritance",
                href: buildHref({article: "inheritance"})
            }, {
                text: "Overriding methods",
                href: buildHref({article: "overriding-methods"})
            }, {
                text: "Virtual method cache",
                href: buildHref({article: "virtual-method-cache"})
            }, {
                text: "Strict mode",
                href: buildHref({article: "strict-mode"})
            }]
        }, {
            header: {
                text: "The model layer",
                href: buildHref({article: "models"})
            },
            items: []
        }];
    };
    
    return HowDoIApplication;
});

compiler.registerClass("Wipeout.Docs.Models.Components.Api", "wo.object", function() {    
    
    var api = function() {
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
        this.classes.push(new Wipeout.Docs.Models.Components.ApiClass(desc, classConstructor));
        
        return desc;
    };
    
    function ns(namespace, root) {
        namespace = namespace.split(".");
        root = root || window;
        
        // skip last part
        for(var i = 0, ii = namespace.length - 1; i < ii; i++) {
            root = root[namespace[i]] = (root[namespace[i]] || {});
        }
        
        return root;
    }
    
    api.prototype.codeHelper = function(codeHelperGenerator) {
        if(!(codeHelperGenerator instanceof Wipeout.Docs.Models.Components.Generators.CodeHelperGenerator))
            throw "Invalid input";
        
        return codeHelperGenerator.generate(this);
    };
    
    api.prototype.namespaced = function() {
        var output = {};
        
        for(var i = 0, ii = this.classes.length; i < ii; i++) {
            ns(this.classes[i].classDescription.classFullName, output)[this.classes[i].classDescription.className] = this.classes[i];
        }        
        
        return output;
    };
    
    return api;
});

compiler.registerClass("Wipeout.Docs.Models.Components.ApiBuilder", "wo.object", function() {    
    
    function apiBuilder(root, rootNamespace) {
        this._super();
        
        this.classes = apiBuilder.flatten(root, rootNamespace);
    };
    
    apiBuilder.prototype.build = function(settings) {
        settings = settings ||{};
        
        var api = new Wipeout.Docs.Models.Components.Api();
        
        var classes = apiBuilder.toArray(this.classes);
        if(settings.knownParents)
            for(var i = 0, ii = settings.knownParents.length; i < ii; i++)
                classes.push(settings.knownParents[i]);
        
        
        var done = wo.obj.copyArray(settings.knownParents || []);
        done.push(Object);
        
        if(settings.filter)
            for(var i = classes.length - 1; i >= 0; i--)
                if(!settings.filter(classes[i]))
                   classes.splice(i, 1);
        
        while (classes.length) {
            var length = classes.length;
            
            for(var i = classes.length - 1; i >= 0; i--) {
                if(done.indexOf(apiBuilder.getParentClass(classes[i].value)) !== -1) {
                    api.forClass(classes[i].key);
                    done.push(classes[i].value);
                    classes.splice(i, 1);
                }
            }
            
            if(length === classes.length)
                throw "Could not find parent classes for the remaining classes";
        }
        
        return api;
    }
    
    apiBuilder.getParentClass = function(childClass) {
        return Object.getPrototypeOf(childClass.prototype).constructor;
    };
    
    apiBuilder.toArray = function(obj) {
        var array = [];
        for(var i in obj)
            array.push({key: i, value: obj[i]});
        
        return array;
    };
            
    apiBuilder.flatten = function(root, rootNamespace) {
        
        var output = {};
        
        for(var i in root) {
            if(root[i] instanceof Function) {
                output[rootNamespace + "." + i] = root[i];
            } else if (root[i] instanceof Object) {
                var flattened = apiBuilder.flatten(root[i], rootNamespace + "." + i);
                for(var j in flattened)
                    output[j] = flattened[j];
            }
        }
        
        return output;
    }
    
    return apiBuilder;
});

compiler.registerClass("Wipeout.Docs.Models.Components.ApiClass", "wo.object", function() {    
    return function(classDescription, classConstructor) {
        this.classDescription= classDescription;
        this.classConstructor = classConstructor;
    }
});

compiler.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch", "wo.object", function() {
    var treeViewBranch = function(name, href, branches) {
        this._super();
            
        this.name = name;
        this.href = href;
        this.branches = branches;
    };
    
    return treeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Components.Generators.CodeHelperGenerator", "wo.object", function() {
    
    function select(input, converter, context) {
        var output = [];
        context = context || window;
        for(var i = 0, ii = input.length; i < ii; i++)
            output.push(converter.call(context, input[i]));
        
        return output;
    }
    
    function codeHelperGenerator() {
        this.truncateNamespaces = true;
        
        this.resultStream = [];
        this.indentation = 0;
        this.indentationType = "\t";
    }
    
    codeHelperGenerator.prototype.write = function(input) {
        if(this.resultStream.length === 0)
            this.resultStream.push(input);
        else
            this.resultStream[this.resultStream.length -1] += input;
            
    };
    
    codeHelperGenerator.prototype.writeLine = function(input) {
        var tab = [];
        for(var i = 0; i < this.indentation; i++)
            tab.push(this.indentationType);
        
        this.resultStream.push(tab.join("") + input);            
    };
    
    codeHelperGenerator.prototype.addNamespaceBeginning = function(name) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addNamespaceEnd = function(name) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addClassBeginning = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addClassEnd = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addConstructorBeginning = function(className) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addConstructorEnd = function(className) {
        throw "Abstract functions must be implemented";
    };    
    
    codeHelperGenerator.prototype.addArgument = function(name, type, totalArguments) {
        throw "Abstract functions must be implemented";
    };   
    
    codeHelperGenerator.prototype.addArgumentSeparator = function(totalArguments) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addFunctionBeginning = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addFunctionEnd = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addProperty = function(name, type, _protected, _private, _static) {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.addHeader = function() {
        throw "Abstract functions must be implemented";
    };
    
    codeHelperGenerator.prototype.convertNamespace = function(name, namespaceObject) {
        
        var result= [];
        
        this.addNamespaceBeginning(name);
        
        this.indentation++;
        
        for(var item in namespaceObject) {
            if(namespaceObject[item] instanceof Wipeout.Docs.Models.Components.ApiClass) {
                this.convertClass(namespaceObject[item].classDescription);
            } else {
                this.convertNamespace(item, namespaceObject[item]);
            }            
        }
        
        this.indentation--;
        
        this.addNamespaceEnd(name);
    };
    
    codeHelperGenerator.prototype.convertClass = function(classDescription) {
        //TODO
        if(classDescription.className === "if") return;
        
        var parentClass = classDescription.parentClass ? classDescription.parentClass.classFullName : "";
        
        this.addClassBeginning(classDescription.className, parentClass);                
        this.indentation++;
        
        this.convertConstructor(classDescription.className, classDescription.classConstructor);
        select(classDescription.events, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], false);
        }, this);
        select(classDescription.properties, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], false); 
        }, this);
        select(classDescription.functions, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertFunction(arguments[0], false); 
        }, this);
        select(classDescription.staticEvents, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], true); 
        }, this);
        select(classDescription.staticProperties, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertProperty(arguments[0], true); 
        }, this);
        select(classDescription.staticFunctions, function() { 
            if(arguments[0].classFullName === classDescription.classFullName)
                this.convertFunction(arguments[0], true); 
        }, this);
        
        this.indentation--;        
        this.addClassEnd(classDescription.className, parentClass);        
    };
    
    codeHelperGenerator.prototype.convertConstructor = function(className, functionDescription) {        
        this.addConstructorBeginning(className);
        this.indentation++;
        this.convertArguments(functionDescription.arguments);
        this.indentation--;
        this.addConstructorEnd(className);
    };  
    
    codeHelperGenerator.prototype.convertArgument = function(argument, totalArguments) {
        this.addArgument(argument.name, argument.type, totalArguments);
    }; 
    
    codeHelperGenerator.prototype.convertFunction = function(functionDescription, _static) {
        var _private = functionDescription.name && functionDescription.name.indexOf("__") === 0;
        var _protected = !_private && functionDescription.name && functionDescription.name.indexOf("_") === 0;
        
        this.addFunctionBeginning(functionDescription.name, functionDescription.returns.type, functionDescription.returns.genericTypes, _protected, _private, _static);
        this.indentation++;
        this.convertArguments(functionDescription.arguments);
        this.indentation--;
        this.addFunctionEnd(functionDescription.name, functionDescription.returns.type, functionDescription.returns.genericTypes, _protected, _private, _static);
    };
    
    codeHelperGenerator.prototype.convertArguments = function(args) {
        for (var i = 0, ii = args.length; i < ii; i++) {
            if(i !== 0) this.addArgumentSeparator(ii);
            this.convertArgument(args[i], ii);
        }
    };
    
    codeHelperGenerator.prototype.convertProperty = function(propertyDescription, _static) {
        if(propertyDescription.overrides) return;
        
        var _private = propertyDescription.name && propertyDescription.name.indexOf("__") === 0;
        var _protected = !_private && propertyDescription.name && propertyDescription.name.indexOf("_") === 0;        
        
        this.addProperty(propertyDescription.name, "Any", _protected, _private, _static);
    };
    
    codeHelperGenerator.prototype.generate = function(api) {
        api = api.namespaced();
        var result = [];
        
        this.addHeader();
        
        for(var namespace in api) {
            // until it is fixed
            if (namespace !== "wo") continue;
            this.convertNamespace(namespace, api[namespace], 0);
        }
        
        return this.resultStream.join("\n");
    };
    
    return codeHelperGenerator;
});

compiler.registerClass("Wipeout.Docs.Models.Components.Generators.Typescript", "Wipeout.Docs.Models.Components.Generators.CodeHelperGenerator", function() {
    
    var defaultIndentation = "\t";
    
    function typescript() {
        this._super();
    }    
    
    typescript.convertType = function(type, generics) {
        type = (type === "Any" ? "any" :
            (type === "HTMLNode" ? "Node" :
            (type === "Array" && (!generics || !generics.length) ? "Array<any>" :
            (type))));
        
        if(generics && generics.length) {
            var gen = [];
            for(var i = 0, ii = generics.length; i <ii; i++)
                gen.push(typescript.convertType(generics[i]));
            
            type += "<" + gen.join(", ") + ">";
        }
        
        return type;
    };
    
    typescript.prototype.addNamespaceBeginning = function(name) {
        if(this.indentation === 0)
            this.writeLine("declare module " + name + " {");
        else
            this.writeLine("export module " + name + " {");
    };
    
    typescript.prototype.addNamespaceEnd = function(name) {
        this.writeLine("}");
    };
    
    typescript.prototype.addClassBeginning = function(name, parentClass) {
        this.writeLine((this.indentation === 0 ? "declare" : "export") + " class " + name + (parentClass ? " extends " + parentClass : "") + " {");
    };
    
    typescript.prototype.addClassEnd = function(className, parentClass) {
        this.writeLine("}");
    };
    
    typescript.prototype.addConstructorBeginning = function(className) {
        this.writeLine("constructor(");
    };
    
    typescript.prototype.addConstructorEnd = function(className) {
        this.write(");");
    };    
    
    typescript.prototype.addArgument = function(name, type, totalArguments) {
        this.write(name + ": " + typescript.convertType(type));
    };
    
    typescript.prototype.addArgumentSeparator = function(totalArguments) {
        this.write(", ");
    };
    
    typescript.prototype.addFunctionBeginning = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        this.writeLine(
            (_private ? "private " : (_protected ? "" : "")) + 
            (_static ? "static " : "")  +
            name + "(");
    };
    
    typescript.prototype.addFunctionEnd = function(name, returnType, returnTypeGenerics, _protected, _private, _static) {
        this.write("): " + typescript.convertType(returnType, returnTypeGenerics) + ";");
    };
    
    typescript.prototype.addProperty = function(name, type, _protected, _private, _static) {
        this.writeLine(
            (_private ? "private " : (_protected ? "" : "")) + 
            (_static ? "static " : "")  +
            name + ": " +
            typescript.convertType(type) + ";");
    };
    
    typescript.prototype.addHeader = function() {
        this.writeLine("// wipeout.d.ts");
        this.writeLine("");
    };
    
    return typescript;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Argument", "wo.object", function() {
    function argument(itemDetails) {
        this._super();
        
        this.name = itemDetails.name;
        this.type = itemDetails.type;
        this.optional = !!itemDetails.optional;
        this.description = itemDetails.description;
        
        this.generics = itemDetails.description || [];
    }
    
    return argument;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Class", "wo.object", function() {
    var classDescription = function(classFullName, api) {
        this._super();
        
        this.className = classDescription.getClassName(classFullName);
        this.constructorFunction = get(classFullName);
        this.classFullName = classFullName;
        this.api = api;
        
        this.parentClass = null;
        
        this.classConstructor = null;
        this.events = [];
        this.staticEvents = [];
        this.properties = [];
        this.staticProperties = [];
        this.functions = [];
        this.staticFunctions = [];
        
        this.title = this.classFullName;
        
        this.rebuild();
    };
    
    classDescription.getClassName = function(classFullName) {
        classFullName = classFullName.split(".");
        return classFullName[classFullName.length - 1];
    };
    
    classDescription.prototype.getFunction = function (name, isStatic) {
        var functions = isStatic ? this.staticFunctions : this.functions;
        
        for(var i = 0, ii = functions.length; i < ii; i++) {
            if(functions[i].functionName === name)
                return functions[i];
        }
        
        return null;
    };
    
    classDescription.prototype.getEvent = function (name, isStatic) {
        var events = isStatic ? this.staticEvents : this.events;
        
        for(var i = 0, ii = events.length; i < ii; i++) {
            if(events[i].eventName === name)
                return events[i];
        }
        
        return null;
    };
    
    classDescription.prototype.getProperty = function (name, isStatic) {
        var properties = isStatic ? this.staticProperties : this.properties;
        
        for(var i = 0, ii = properties.length; i < ii; i++) {
            if(properties[i].propertyName === name)
                return properties[i];
        }
        
        return null;
    };
    
    classDescription.prototype.rebuild = function() {
        this.classConstructor = null;
        this.events.length = 0;
        this.staticEvents.length = 0;
        this.properties.length = 0;
        this.staticProperties.length = 0;
        this.functions.length = 0;
        this.staticFunctions.length = 0;
        this.parentClass = null;
                
        for(var i in this.constructorFunction) {
            if(this.constructorFunction.hasOwnProperty(i)) {
                if(this.constructorFunction[i] instanceof wo.event) {
                    this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName, true));
                } else if(this.constructorFunction[i] instanceof Function && !ko.isObservable(this.constructorFunction[i])) {
                    this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[i], i, this.classFullName, true));
                } else {
                    this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction, i, this.classFullName, true));
                }
            }
        }
        
        for(var i in this.constructorFunction.prototype) {
            if(this.constructorFunction.prototype.hasOwnProperty(i)) {                    
                if(this.constructorFunction.prototype[i] instanceof wo.event) { 
                    this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName, false));
                } else if(this.constructorFunction.prototype[i] instanceof Function && !ko.isObservable(this.constructorFunction.prototype[i])) {
                    this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[i], i, this.classFullName, false));
                } else {
                    this.properties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction, i, this.classFullName, false));
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            
            var anInstance;
            try {
                anInstance = new this.constructorFunction();
            } catch (e) {
            }
            
            if (anInstance) {
                for(var i in anInstance) {
                    if(anInstance.hasOwnProperty(i)) {                    
                        if(anInstance[i] instanceof wo.event) { 
                            this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction, i, this.classFullName, false));
                        } else if(anInstance[i] instanceof Function && !ko.isObservable(anInstance[i])) { 
                            this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(anInstance[i], i, this.classFullName, false));
                        } else {
                            this.properties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction, i, this.classFullName, false));
                        }
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
            this.classConstructor = new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction, this.className, this.classFullName, false);
        
        var sort = function() { return arguments[0].name.localeCompare(arguments[1].name); };
        
        if(this.constructorFunction.prototype)
            this.parentClass = this.api.getClassDescription(Object.getPrototypeOf(this.constructorFunction.prototype).constructor);
        
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
    return function(itemName, itemSummary, isStatic) {
        this._super();
        
        this.name = itemName;
        this.summary = itemSummary;
        this.isStatic = isStatic;
    }
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Event", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var eventDescription = function(constructorFunction, eventName, classFullName, isStatic) {
        this._super(eventName, Wipeout.Docs.Models.Descriptions.Property.getPropertySummary(constructorFunction, eventName), isStatic);
                        
        this.eventName = eventName;
        this.classFullName = classFullName;
        
        this.title = this.eventName;
    };
    
    return eventDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Function", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    
    var functionDescription = function(theFunction, functionName, classFullName, isStatic) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction), isStatic);
        
        this["function"] = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.title = this.functionName;
        
        var xmlSummary = this.getXmlSummary();
        
        this.arguments = this.getArguments(xmlSummary);
        
        this.returns = functionDescription.getReturnSummary(xmlSummary);
        
        this.overrides = null;
        
        this.fullyQualifiedName = ko.computed(function() {
            return this.classFullName + "." + this.functionName;
        }, this);
    };
            
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var COMMA = /([^\s,]+)/g;
    functionDescription.prototype.getArguments = function(xmlSummary) {
        if(!this["function"] || !(this["function"] instanceof Function)) return [];
        
        var fnStr = this["function"].toString().replace(STRIP_COMMENTS, '')
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(COMMA);
        
        if(!result)
            return [];
        
        for(var i = 0, ii = result.length; i < ii; i++) {
            result[i] = new Wipeout.Docs.Models.Descriptions.Argument(functionDescription.getArgumentSummary(result[i], xmlSummary));
        }
        
        return result;
    }; 
        
    functionDescription.removeFunctionDefinition = function(functionString) {
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

            functionString = functionDescription.removeFunctionDefinition(functionString);
        }

        return functionString;
    };
    
    var functionMeta = /^\s*\/\/\//g;
    functionDescription.getXmlSummary = function(theFunction) {
        var functionString = functionDescription.removeFunctionDefinition(theFunction.toString()).split("\n");
        for(var i = 0, ii = functionString.length; i < ii; i++) {
            if(functionString[i].search(functionMeta) !== 0)
                break;
            
            functionString[i] = functionString[i].replace(functionMeta, "");
        }
                
        return new DOMParser().parseFromString("<meta>" + functionString.splice(0, i).join("") + "</meta>", "application/xml").documentElement;
    };
    
    functionDescription.prototype.getXmlSummary = function() {
        return functionDescription.getXmlSummary(this["function"]);
    };
            
    functionDescription.getArgumentSummary = function(argument, xmlSummary) {
        var comment = null;
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "param" && xmlSummary.childNodes[i].getAttribute("name") === argument) {
                comment = xmlSummary.childNodes[i];
                break;
            }
        }
        
        if(comment) {  
            var generics = [];
            
            var tmp;
            var g = "generic";
            var i = 0;
            for(var i = 0; tmp = comment.getAttribute(g + i); i++) {
                generics.push(tmp);
            }
            
            return {
                name: argument,
                type: comment.getAttribute("type"),
                optional: wo.view.objectParser.bool(comment.getAttribute("optional")),
                description: comment.innerHTML,
                genericTypes: generics
            };  
        }
        
        return {
            name: argument
        };   
    };   
            
    functionDescription.getFunctionSummary = function(theFunction) {
        var xmlSummary = functionDescription.getXmlSummary(theFunction);
        
        var comment = null;
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "summary") {
                comment = xmlSummary.childNodes[i];
                break;
            }
        }
        
        if(comment) {  
            return comment.innerHTML;
        }
        
        return "";   
    };   
            
    functionDescription.getReturnSummary = function(xmlSummary) { 
        for(var i = 0, ii = xmlSummary.childNodes.length; i < ii; i++) {
            if(xmlSummary.childNodes[i].nodeName === "returns") {
                var generics = [];

                var tmp;
                var g = "generic";
                for(var j = 0; tmp = xmlSummary.childNodes[i].getAttribute(g + j); j++) {
                    generics.push(tmp);
                }
                
                return {
                    summary: xmlSummary.childNodes[i].innerHTML,
                    type: xmlSummary.childNodes[i].getAttribute("type"),
                    genericTypes: generics
                };
            }
        }
        
        return {
            type: "void"
        };
    };  
    
    return functionDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Property", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var property = function(constructorFunction, propertyName, classFullName, isStatic) {
        this._super(propertyName, property.getPropertySummary(constructorFunction, propertyName, classFullName), isStatic);
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
        
        this.title = this.propertyName;
        
        var xml = property.getPropertySummaryXml(constructorFunction, propertyName, classFullName);
        this.propertyType = xml ? property.getPropertyType(xml) : null;
                
        this.fullyQualifiedName = ko.computed(function() {
            return this.classFullName + "." + this.propertyName;
        }, this);
    };
    
    var summary = /^\/\/\/<[sS]ummary\s*type=".+".*>.*<\/[sS]ummary>/;
    property.getPropertySummary = function(constructorFunction, propertyName, classFullName) {
        return (property.getPropertySummaryXml(constructorFunction, propertyName, classFullName) || {}).innerHTML;
    };
    
    property.getPropertySummaryXml = function(constructorFunction, propertyName, classFullName) {
        var result;
        if(result = property.getPropertyDescriptionOverride(classFullName + "." + propertyName))
            return new DOMParser().parseFromString(result.description, "application/xml").documentElement;
        
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
                if(summary.test(func)) {
                    return new DOMParser().parseFromString(func.substring(3), "application/xml").documentElement;
                } else {
                    return null;
                }
            }
        }
         
        result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName + "\"\\s*\\]\\s*="));        
    };
            
    property.getPropertyType = function(xmlDefinition) {
        
        var generics = [];

        var tmp;
        var g = "generic";
        for(var i = 0; tmp = xmlDefinition.getAttribute(g + i); i++) {
            generics.push(tmp);
        }

        return {
            type: xmlDefinition.getAttribute("type"),
            genericTypes: generics
        };  
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
        wo: {},
        wipeout: {
            base: {
                itemsControl: {
                    removeItem: {
                        description: "<summary type=\"wo.routedEvent\">Routed event. Signals that the model in the routed event args is to be removed from the catching itemsControl</summary>"
                    }
                },
                "if": {
                    blankTemplateId: {
                        description: "<summary type=\"Object\">An id for a blank template.</summary>"
                    }
                },
                visual: {
                    reservedTags: {
                        description: "<summary type=\"Object\">A dictionary of html tags which wipeout will ignore. For example div and span.</summary>"
                    }
                },
                object: {
                    useVirtualCache: {
                        description: "<summary type=\"Boolean\">If set to true, pointers to methods called using \"_super\" are cached for faster lookup in the future. Default: true</summary>"
                    }
                },
                view: {
                    objectParser: {
                        description: "<summary type=\"Object\">A collection of objects to parse from string. These correspond to a the \"constructor\" property used in setting property types. Custom parsers can be added to this list</summary>"
                    },
                    reservedPropertyNames: {
                        description: "<summary type=\"Array\">A list of property names which are not bound or are bound in a different way, e.g. \"constructor\" and \"id\"</summary>"
                    }
                }
            },
            bindings: {
                bindingBase: {
                    dataKey: {
                        description: "<summary type=\"String\">A key for dom data related to wipeout bindings</summary>"
                    },
                    registered: {
                        description: "<summary type=\"Object\">A cache of all bindings created</summary>"
                    }
                },
                itemsControl: {
                    utils: {
                        description: "<summary type=\"Object\">Utils used by the itemsControl binding</summary>"                            
                    }
                },
                wipeout: {
                    utils: {
                        description: "<summary type=\"Object\">Utils used by the wipeout binding</summary>"                            
                    }
                },
                'wipeout-type': {
                    utils: {
                        description: "<summary type=\"Object\">Utils used by the wipeout-type binding</summary>"
                    }
                }
            },
            template: {
                asyncLoader: {                    
                    instance: {
                        description: "<summary type=\"wipeout.template.asyncLoader\">A static instance of the async loader</summary>"
                    }
                },
                engine: {
                    closeCodeTag: { 
                        description: "<summary type=\"String\">Signifies the end of a wipeout code block: \"" + wipeout.template.engine.closeCodeTag.replace("<", "&lt;").replace(">", "&gt;") + "\".</summary>"
                    },
                    instance: { 
                        description: "<summary type=\"wipeout.template.engin\">An instance of a wipeout.template.engine which is used by the render binding.</summary>"
                    },
                    openCodeTag: { 
                        description: "<summary type=\"String\">Signifies the beginning of a wipeout code block: \"" + wipeout.template.engine.openCodeTag.replace("<", "&lt;").replace(">", "&gt;") + "\".</summary>"
                    },
                    scriptCache: { 
                        description: "<summary type=\"Object\">A placeholder for precompiled scripts.</summary>"
                    },
                    scriptHasBeenReWritten: { 
                        description: "<summary type=\"Regexp\">Regex to determine whether knockout has rewritten a template.</summary>"
                    },
                    xmlCache: { 
                        description: "<summary type=\"Object\">A repository for processed templates.</summary>"
                    },
                    prototype: {
                        isTemplateRewritten: {
                            description: "<summary type=\"\">A knockout native function</summary>"
                        },
                        makeTemplateSource: {
                            description: "<summary type=\"\">A knockout native function</summary>"
                        },
                        renderTemplate: {
                            description: "<summary type=\"\">A knockout native function</summary>"
                        }
                    }
                }
            },
            utils: {
                find: {
                    regex: {
                        description: "<summary type=\"Object\">Regular expressions used by $find</summary>"
                    }
                },
                html: {
                    cannotCreateTags: {
                        description: "<summary type=\"Object\">A list of html tags which wipeout refuses to create, for example \"html\".</summary>"
                    },
                    specialTags: {
                        description: "<summary type=\"Object\">A list of html tags which cannot be placed inside a div element.</summary>"
                    }
                },
                ko: {
                    array: {
                        description: "<summary type=\"Object\">Items needed to deal with knockout arrays.</summary>"
                    }
                }
            }
        }
    };
    
    for(var i in property.descriptionOverrides.wipeout.base)
        property.descriptionOverrides.wo[i] = property.descriptionOverrides.wipeout.base[i];
    
    for(var i in property.descriptionOverrides.wipeout.utils)
        property.descriptionOverrides.wo[i] = property.descriptionOverrides.wipeout.utils[i];
    
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


compiler.registerClass("Wipeout.Docs.ViewModels.ApiApplication", "Wipeout.Docs.ViewModels.Application", function() {
    
    function ApiApplication() {
        this._super("Wipeout.Docs.ViewModels.ApiApplication", "/wipeout-0/api.html");
        
        this.registerDisposable(ko.computed(function() {
            var tmp;
            if( (tmp = this.model()) &&
                (tmp = tmp.content()))
                    $("#headerText").html(tmp.title);
        }, this));
    };
    
    ApiApplication.prototype.route = function(query) { 
        var temp = Wipeout.Docs.Models.ApiApplication.getModel(query);        
        if (temp)
            this.model().content(temp);
    };
    
    ApiApplication.prototype.routeTo = function(item) {
        history.pushState(null, '', Wipeout.Docs.Models.ApiApplication.routableUrl(item));
        crossroads.parse(location.pathname + location.search);
    };
    
    ApiApplication.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        //TODO: this
        this.templateItems.treeView.select();
    };
    
    return ApiApplication;
});


compiler.registerClass("Wipeout.Docs.ViewModels.Application", "wo.view", function() {
    
    function Application(templateId, rootUrl) {
        if(this.constructor === Application) throw "Cannot create an instance of an abstract class";
        
        this._super(templateId);
                
        var _this = this;
        crossroads.addRoute(rootUrl + '{?query}', function(query){
            _this.route(query);
        });
    };
    
    Application.prototype.route = function(query) {
        throw "Abstract method must be overridden";
    };
    
    Application.prototype.onRendered = function() {
        this._super.apply(this, arguments);
        
        if (this.templateItems.content)
            this.registerDisposable(this.templateItems.content.model.subscribe(function() {                
                window.scrollTo(0,0);
            }));
    };
    
    return Application;
});


compiler.registerClass("Wipeout.Docs.ViewModels.HowDoIApplication", "Wipeout.Docs.ViewModels.Application", function() {
    
    function HowDoIApplication() {
        this._super("Wipeout.Docs.ViewModels.HowDoIApplication", "/wipeout-0/how-do-i.html");
        
        this.contentTemplate = ko.observable(wo.contentControl.getBlankTemplateId());
    };
    
    HowDoIApplication.prototype.route = function(query) { 
        if(query.article) {
            this.contentTemplate("Articles." + query.article);
        } else {
            this.contentTemplate(wo.contentControl.getBlankTemplateId());
        }
    };
    
    return HowDoIApplication;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.CodeBlock", "wo.view", function() {
    var codeBlock = function(templateId) {
        this._super(templateId || "Wipeout.Docs.ViewModels.Components.CodeBlock");        
        this.code = ko.observable();
        
        this.code.subscribe(this.onCodeChanged, this);        
        this.renderCode = ko.computed(function() {
            var code = this.code();
            return code ? code.replace(/</g, "&lt;") : code;
        }, this);
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
            } else if(newVal instanceof Wipeout.Docs.Models.Components.StaticPageTreeViewBranchTemplate) {
                newVm = new wo.view(newVal.templateId);
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

compiler.registerClass("Wipeout.Docs.ViewModels.Components.NewTemplateCodeBlock", "Wipeout.Docs.ViewModels.Components.TemplateCodeBlock", function() {
    var newTemplateCodeBlock = function() {
        this._super.apply(this, arguments);
    };
    
    newTemplateCodeBlock.prototype.getTemplateHtml = function(newVal) {
        
        if(!this.newScriptId) throw "You must specify a script id";
        
        return '<script type="text/xml" id="' + 
            this.newScriptId + '">' + 
            this._super(newVal.replace(/\&lt;/g, "<").replace(/\&gt;/g, ">")) + 
            "</script>";
    };
    
    return newTemplateCodeBlock;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.RouteLink", "wo.view", function() {
    var RouteLink = function() {
        this._super("Wipeout.Docs.ViewModels.Components.RouteLink");
    };
    
    RouteLink.prototype.onRendered = function(oldValues, newValues) {
        this._super(oldValues, newValues);
        
        $(this.templateItems.link).on("click", function(e) {
            if(e.button === 1)
                return;
            
            e.preventDefault();
            window.history.pushState(null, "", this.href);
            crossroads.parse(location.pathname + location.search);
        });
    }
    
    return RouteLink;
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
    
    templateCodeBlock.prototype.getTemplateHtml = function(newVal) {
        return newVal
            .replace(/\&lt;/g, "<")
            .replace(/\&gt;/g, ">");
    };
    
    templateCodeBlock.prototype.onCodeChanged = function(newVal) {  
        templateDiv.innerHTML += this.getTemplateHtml(newVal);
    };
    
    return templateCodeBlock;
});

compiler.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch", "wo.view", function() {
    var treeViewBranch = function() {
        this._super(treeViewBranch.nullTemplate);
        
        this.isOpen = ko.observable();
        
        this.glyphClass = ko.computed(function() {
            var open = this.isOpen(),
                model = this.model(),
                hasBranches = model && model.branches && model.branches.length;
                        
            if(this.isOpen() && hasBranches)                
                return "glyphicon glyphicon-chevron-down";
            if(model && model.href && !hasBranches)                
                return "glyphicon glyphicon-chevron-right";
            
            return "";
        }, this);
    };
    
    treeViewBranch.branchTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";
    treeViewBranch.leafTemplate = "Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";
    treeViewBranch.nullTemplate = wo.visual.getBlankTemplateId();
    
    treeViewBranch.prototype.onRendered = function(oldValues, newValues) {  
        this._super(oldValues, newValues);
                
        this.isOpen(!!$(this.templateItems.content).filter(":visible").length);
    };
    
    treeViewBranch.prototype.onModelChanged = function(oldVal, newVal) {  
        this._super(oldVal, newVal);
        
        if(newVal && (newVal.branches || newVal.href)) {
            this.templateId(treeViewBranch.branchTemplate);
        } else if(newVal) {
            this.templateId(treeViewBranch.leafTemplate);
        } else {
            this.templateId(treeViewBranch.nullTemplate);
        }
    };
    
    treeViewBranch.prototype.select = function() {
        var content = this.templateItems.content.templateItems.content;
        
        if(this.model().branches)
            $(content).toggle();
        
        this.isOpen(!!$(content).filter(":visible").length);
                
        if(this.model().href) {  
            if (this.isOpen() || !this.model().branches || !this.model().branches.length) {
                history.pushState(null, "", this.model().href);
                crossroads.parse(location.pathname + location.search);
            }
        }
    };
    
    return treeViewBranch;
});


compiler.registerClass("Wipeout.Docs.ViewModels.Components.UsageCodeBlock", "Wipeout.Docs.ViewModels.Components.CodeBlock", function() {
    var usageCodeBlock = function() {
        this._super("Wipeout.Docs.ViewModels.Components.UsageCodeBlock");
        
        this.usage = ko.observable();
        
        this.showDefinitionCode = ko.observable(true);
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
        
        this.itemType = "Function";
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

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.EventPage", "wo.view", function() {
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.EventPage");
    };
});

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage", "wo.view", function() {
    var functionPage = function() {
        this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage");
        
        this.showCode = ko.observable(false);
        
        this.showReturnValue = true;
                
        this.usagesTemplateId = ko.computed(function() {
            if(this.model()) {
                var name = this.model().fullyQualifiedName() + functionPage.classUsagesTemplateSuffix;
                if(document.getElementById(name))
                    return name;
            }

            return wo.contentControl.getBlankTemplateId();
        }, this);
    };
    
    functionPage.classUsagesTemplateSuffix = "_FunctionUsages";
    
    return functionPage;
});


compiler.registerClass("Wipeout.Docs.ViewModels.Pages.LandingPage", "wo.view", function() {
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.LandingPage");
    };
});

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage", "wo.view", function() {
    function propertyPage() {
        this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage");
        
        this.usagesTemplateId = ko.computed(function() {
            if(this.model()) {
                var name = this.model().fullyQualifiedName() + propertyPage.classUsagesTemplateSuffix;
                if(document.getElementById(name))
                    return name;
            }

            return wo.contentControl.getBlankTemplateId();
        }, this);
    };
    
    propertyPage.classUsagesTemplateSuffix = "_PropertyUsages";
    
    return propertyPage;
});

compiler.compile(window.Wipeout);
delete compiler;



})();
