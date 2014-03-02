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
            var koArrayBranch = new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array", currentApi.forClass("wo.ko.array"));
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
            else {
                output.push(new Wipeout.Docs.Models.Components.FunctionTreeViewBranch(_function));            }
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
                output.push(new Wipeout.Docs.Models.Components.FunctionTreeViewBranch(_function));            
        });
        
        output.sort(function() { return arguments[0].name === "constructor" ? -1 : arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    return classTreeViewBranch;
});

compiler.registerClass("Wipeout.Docs.Models.Components.FunctionTreeViewBranch", "Wipeout.Docs.Models.Components.PageTreeViewBranch", function() {
    var functionTreeViewBranch = function(functionDescription) {
        this._super(functionDescription.functionName, functionDescription);
    };
    
    return functionTreeViewBranch;
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

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Argument", "wo.object", function() {
    return function(itemDetails) {
        this._super();
        
        this.name = itemDetails.name;
        this.type = itemDetails.type;
        this.optional = !!itemDetails.optional;
        this.description = itemDetails.description;
    }
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
                    this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction, i, this.classFullName));
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
                    this.properties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction, i, this.classFullName));
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
                        this.properties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction, i, this.classFullName));
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
        this._super(eventName, Wipeout.Docs.Models.Descriptions.Property.getPropertySummary(constructorFunction, eventName));
        
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
        
        this.arguments = functionDescription.getArguments(theFunction);
        
        this.returns = functionDescription.getReturnSummary(theFunction);
        
        this.overrides = null;
        
        this.fullyQualifiedName = ko.computed(function() {
            return this.classFullName + "." + this.functionName;
        }, this);
    };
            
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var COMMA = /([^\s,]+)/g;
    functionDescription.getArguments = function(theFunction) {
        if(!theFunction || !(theFunction instanceof Function)) return [];
        
        var fnStr = theFunction.toString().replace(STRIP_COMMENTS, '')
        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(COMMA);
        
        if(!result)
            return [];
        
        for(var i = 0, ii = result.length; i < ii; i++) {
            result[i] = new Wipeout.Docs.Models.Descriptions.Argument(functionDescription.getArgumentSummary(result[i], theFunction));
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
    
    functionDescription.getCommentsAsXml = function(theFunction, commentRegex) {
        var functionString = functionDescription.removeFunctionDefinition(theFunction.toString());
        
        var i;
        if ((i = functionString.search(commentRegex)) !== -1) {
            // get rid of "///"
            var current = functionString.substr(i + 3);            
            return new DOMParser().parseFromString(current.substr(0, current.indexOf("\n")), "application/xml").documentElement;
        }
        
        return null;
    }
        
    functionDescription.getArgumentSummary = function(argument, theFunction) {
        
        var regex = new RegExp("///\\s*<param\\s*name=\"" + argument + "\"\\s*(\\s+type=\".*\"){0,1}>.*</param>\\s*\n");
        var comment = functionDescription.getCommentsAsXml(theFunction, regex);
        
        if(comment) {  
            return {
                name: argument,
                type: comment.getAttribute("type"),
                optional: wo.view.objectParser.bool(comment.getAttribute("optional")),
                description: comment.innerHTML
            };  
        }
        
        return {
            name: argument
        };   
    };   
            
    functionDescription.getFunctionSummary = function(theFunction) {        
        var regex = new RegExp("///\\s*<summary>.*</summary>\\s*\n");
        var comment = functionDescription.getCommentsAsXml(theFunction, regex);
        if(comment) {  
            return comment.innerHTML;
        }
        
        return "";   
    };   
            
    functionDescription.getReturnSummary = function(theFunction) {  
        var regex = new RegExp("///\\s*<returns\\s*(type=\".*\"){0,1}>.*</returns>\\s*\n");
        var comment = functionDescription.getCommentsAsXml(theFunction, regex);
        if(comment) {
            if(comment.getAttribute("type") === "void") return null;
            
            return {
                summary: comment.innerHTML,
                type: comment.getAttribute("type")
            };
        }
        
        return {
            type: "void"
        };   
    };  
    
    return functionDescription;
});

compiler.registerClass("Wipeout.Docs.Models.Descriptions.Property", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var property = function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, property.getPropertySummary(constructorFunction, propertyName, classFullName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
    };
    
    var inlineCommentOnly = /^\/\//;
    property.getPropertySummary = function(constructorFunction, propertyName, classFullName) {
        var result;
        if(result = property.getPropertyDescriptionOverride(classFullName + "." + propertyName))
            return result.description;
        
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
                woInvisibleDefault: { 
                    description: "The default value for woInvisible for the wo.if class."
                }
            },
            html: {
                specialTags: { 
                    description: "A list of html tags which cannot be placed inside a div element."
                }
            },
            ko: {
                array: { 
                    description: "Utils for operating on observableArrays",
                    diff: {
                        description: "ko constants for operating on array changes (\"added\", \"deleted\", \"retained\")."
                    }
                },
                virtualElements: { 
                    description: "Utils for operating on knockout virtual elements"
                }
            },
            object: {
                useVirtualCache: { 
                    description: "When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."
                }
            },
            view: {
                //TODO: give this a page
                objectParser: { 
                    description: "Used to parse string values into a given type"
                },
                //TODO: give this a page
                reservedPropertyNames: { 
                    description: "Properties which cannot be set on a wipeout object via the template"
                }
            },
            visual: {
                reservedTags: { 
                    description: "A list of names which cannot be used as wipeout object names. These are mostly html tag names"
                },
                woInvisibleDefault: { 
                    description: "The default value for woInvisible for the wo.visual class."
                }
            }
        },
        wipeout: {
            template: {
                engine: {
                    closeCodeTag: { 
                        description: "Signifies the end of a wipeout code block: \"" + wipeout.template.engine.closeCodeTag + "\"."
                    },
                    instance: { 
                        description: "An instance of a wipeout.template.engine which is used by the render binding."
                    },
                    openCodeTag: { 
                        description: "Signifies the beginning of a wipeout code block: \"" + wipeout.template.engine.openCodeTag + "\"."
                    },
                    scriptCache: { 
                        description: "A placeholder for precompiled scripts."
                    },
                    scriptHasBeenReWritten: { 
                        description: "Regex to determine whether knockout has rewritten a template."
                    }
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
        if (($(this.templateItems.content).filter(":visible").length || !this.model().branches || !this.model().branches.length) && payload) {
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

compiler.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage", "wo.view", function() {
    var functionPage = function() {
        this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage");
        
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
    return function() {
        this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage");
    };
});

compiler.compile(window.Wipeout);
delete compiler;



})();
