
$.extend(NS("Wipeout.Docs.Models"), (function() {
    
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
    
    var api = wo.object.extend(function(rootNamespace) {
        this._super();
        
        this.classes = [];
    });
    
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
        
        var desc = new classDescription(className, this);
        this.classes.push({
            classDescription: desc,
            classConstructor: classConstructor
        });
        
        return desc;
    };
    
    var application = wo.object.extend(function() {
        
        this.content = ko.observable(new landingPage());
        
        var currentApi = new api();
                
        //wo
        var _wo = (function() {
            var objectBranch = new classTreeViewBranch("object", currentApi.forClass("wo.object"));
            var routedEventModelBranch = new classTreeViewBranch("routedEventModel", currentApi.forClass("wo.routedEventModel"));
            var visualBranch = new classTreeViewBranch("visual", currentApi.forClass("wo.visual"));
            var viewBranch = new classTreeViewBranch("view", currentApi.forClass("wo.view"));
            var contentControlBranch = new classTreeViewBranch("contentControl", currentApi.forClass("wo.contentControl"));
            var ifBranch = new classTreeViewBranch("if", currentApi.forClass("wo.if"));
            var itemsControlBranch = new classTreeViewBranch("itemsControl", currentApi.forClass("wo.itemsControl"));
            var eventBranch = new classTreeViewBranch("event", currentApi.forClass("wo.event"));
            var routedEventBranch = new classTreeViewBranch("routedEvent", currentApi.forClass("wo.routedEvent"));
            var routedEventArgsBranch = new classTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs"));
            var routedEventRegistrationBranch = new classTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration"));
            
            var htmlBranch = new classTreeViewBranch("html", currentApi.forClass("wo.html"));
            var koVirtualElementsBranch = new classTreeViewBranch("virtualElements", currentApi.forClass("wo.ko.virtualElements"));
            var koBranch = new classTreeViewBranch("ko", currentApi.forClass("wo.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch}});
            var objBranch = new classTreeViewBranch("obj", currentApi.forClass("wo.obj"));
            
            return new treeViewBranch("wo", [
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
            
            var itemsControl = new classTreeViewBranch("itemsControl", currentApi.forClass("wpfko.bindings.itemsControl"));
            var render = new classTreeViewBranch("render", currentApi.forClass("wpfko.bindings.render"));
            var wipeout_type = new classTreeViewBranch("wipeout-type", currentApi.forClass("wpfko.bindings.wipeout-type"));
            var _wo = new classTreeViewBranch("wo", currentApi.forClass("wpfko.bindings.wo"));
            var _wpfko = new classTreeViewBranch("wpfko", currentApi.forClass("wpfko.bindings.wpfko"));
            var _icRender = new classTreeViewBranch("ic-render", currentApi.forClass("wpfko.bindings.ic-render"));
            
            return new treeViewBranch("bindings", [
                _icRender,
                itemsControl,
                render,
                wipeout_type,
                _wo,
                _wpfko
            ]);
        })();
                                     
        //wpfko
        var _wpfko = (function() {
            
            var _base = (function() {
                var objectBranch = new classTreeViewBranch("object", currentApi.forClass("wo.object"));
                var routedEventModelBranch = new classTreeViewBranch("routedEventModel", currentApi.forClass("wo.routedEventModel"));
                var visualBranch = new classTreeViewBranch("visual", currentApi.forClass("wo.visual"));
                var viewBranch = new classTreeViewBranch("view", currentApi.forClass("wo.view"));
                var contentControlBranch = new classTreeViewBranch("contentControl", currentApi.forClass("wo.contentControl"));
                var ifBranch = new classTreeViewBranch("if", currentApi.forClass("wo.if"));
                var itemsControlBranch = new classTreeViewBranch("itemsControl", currentApi.forClass("wo.itemsControl"));
                var eventBranch = new classTreeViewBranch("event", currentApi.forClass("wo.event"));
                var routedEventBranch = new classTreeViewBranch("routedEvent", currentApi.forClass("wo.routedEvent"));
                var routedEventArgsBranch = new classTreeViewBranch("routedEventArgs", currentApi.forClass("wo.routedEventArgs"));
                var routedEventRegistrationBranch = new classTreeViewBranch("routedEventRegistration", currentApi.forClass("wo.routedEventRegistration"));
                
                return new treeViewBranch("base", [
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
                
                var itemsControl = new classTreeViewBranch("itemsControl", currentApi.forClass("wpfko.bindings.itemsControl"));
                var render = new classTreeViewBranch("render", currentApi.forClass("wpfko.bindings.render"));
                var wipeout_type = new classTreeViewBranch("wipeout-type", currentApi.forClass("wpfko.bindings.wipeout-type"));
                var _wo = new classTreeViewBranch("wo", currentApi.forClass("wpfko.bindings.wo"));
                var _wpfko = new classTreeViewBranch("wpfko", currentApi.forClass("wpfko.bindings.wpfko"));
                var _icRender = new classTreeViewBranch("ic-render", currentApi.forClass("wpfko.bindings.ic-render"));
                
                return new treeViewBranch("bindings", [
                    _icRender,
                    itemsControl,
                    render,
                    wipeout_type,
                    _wo,
                    _wpfko
                ]);
            })();
            
            var _template = (function() {
                currentApi.forClass("ko.templateEngine");
                var engine = new classTreeViewBranch("engine", currentApi.forClass("wpfko.template.engine"));
                var htmlBuilder = new classTreeViewBranch("htmlBuilder", currentApi.forClass("wpfko.template.htmlBuilder"));
                
                return new treeViewBranch("template", [
                    engine,
                    htmlBuilder
                ]);
            })();
            
            var _utils = (function() {
                
                var htmlBranch = new classTreeViewBranch("html", currentApi.forClass("wpfko.utils.html"));
                var koVirtualElementsBranch = new classTreeViewBranch("virtualElements", currentApi.forClass("wpfko.utils.ko.virtualElements"));
                var koBranch = new classTreeViewBranch("ko", currentApi.forClass("wpfko.utils.ko"), {staticProperties: {"virtualElements": koVirtualElementsBranch}});
                var objBranch = new classTreeViewBranch("obj", currentApi.forClass("wpfko.utils.obj"));
                
                return new treeViewBranch("utils", [
                    htmlBranch,
                    koBranch,
                    objBranch
                ]);
            })();
            
            return new treeViewBranch("wpfko (debug mode only)", [
                _base,
                _bindings,
                _template,
                _utils
            ]);
        })();
        
        this.menu =
            new treeViewBranch("wipeout", [
                new treeViewBranch("API", [
                    _wo,
                    _bindings,
                    _wpfko
                ])
        ]);        
    });
    
    //#######################################################
    //## Base
    //#######################################################
    
    var displayItem = wo.object.extend(function(name) {
        this._super();
        
        this.title = name;
    });
    
    var landingPage =  displayItem.extend(function(title) {
       this._super(title); 
    }); 
            
    var treeViewBranch =  wo.object.extend(function(name, branches) {
        this._super();
            
        this.name = name;
        this.branches = branches;
    }); 
            
    treeViewBranch.prototype.payload = function() {
        return null;
    };
            
    var pageTreeViewBranch = treeViewBranch.extend(function(name, page, branches) {
        this._super(name, branches);
            
        this.page = page;
    });
            
    pageTreeViewBranch.prototype.payload = function() {
        return this.page;
    };
        
    var classDescriptionItem = wo.object.extend(function(itemName, itemSummary) {
        this._super();
        
        this.name = itemName;
        this.summary = itemSummary;
    });
    
    //#######################################################
    //## END: Base
    //#######################################################
    
    //#######################################################
    //## Class
    //#######################################################
        
    var classDescription = wo.object.extend(function(classFullName, api) {
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
    });
    
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
                    this.staticEvents.push(new eventDescription(this.constructorFunction, i, this.classFullName));
                } else if(this.constructorFunction[i] instanceof Function && !ko.isObservable(this.constructorFunction[i])) {
                    this.staticFunctions.push(new functionDescription(this.constructorFunction[i], i, this.classFullName));
                } else {
                    this.staticProperties.push(new propertyDescription(this.constructorFunction, i, this.classFullName));
                }
            }
        }
        
        for(var i in this.constructorFunction.prototype) {
            if(this.constructorFunction.prototype.hasOwnProperty(i)) {                    
                if(this.constructorFunction.prototype[i] instanceof wo.event) { 
                    this.events.push(new eventDescription(this.constructorFunction, i, this.classFullName));
                } else if(this.constructorFunction.prototype[i] instanceof Function && !ko.isObservable(this.constructorFunction.prototype[i])) {
                    this.functions.push(new functionDescription(this.constructorFunction.prototype[i], i, this.classFullName));
                } else {
                    this.properties.push(new propertyDescription(this.constructorFunction, i, this.classFullName));
                }
            }
        }
        
        if(this.constructorFunction.constructor === Function) {
            var anInstance = new this.constructorFunction();        
            for(var i in anInstance) {
                if(anInstance.hasOwnProperty(i)) {                    
                    if(anInstance[i] instanceof wo.event) { 
                        this.events.push(new eventDescription(this.constructorFunction, i, this.classFullName));
                    } else if(anInstance[i] instanceof Function && !ko.isObservable(anInstance[i])) { 
                        this.functions.push(new functionDescription(anInstance[i], i, this.classFullName));
                    } else {
                        this.properties.push(new propertyDescription(this.constructorFunction, i, this.classFullName));
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
            this.classConstructor = new functionDescription(this.constructorFunction, this.className, this.classFullName);
        
        var sort = function() { return arguments[0].name.localeCompare(arguments[1].name); };
        
        this.events.sort(sort);
        this.staticEvents.sort(sort);
        this.properties.sort(sort);
        this.staticProperties.sort(sort);
        this.functions.sort(sort);
        this.staticFunctions.sort(sort);
    };
    
    classDescription.getClassName = function(classFullName) {
        classFullName = classFullName.split(".");
        return classFullName[classFullName.length - 1];
    };
    
    var classTreeViewBranch = pageTreeViewBranch.extend(function(name, classDescription, customBranches) {
        this._super(name, classDescription, classTreeViewBranch.compileBranches(classDescription, customBranches));
    });
    
    classTreeViewBranch.compileBranches = function(classDescription, customBranches /*optional*/) {
        var output = [];
        
        customBranches = customBranches || {};
        customBranches.staticEvents = customBranches.staticEvents || {};
        customBranches.staticProperties = customBranches.staticProperties || {};
        customBranches.staticFunctions = customBranches.staticFunctions || {};
        customBranches.events = customBranches.events || {};
        customBranches.properties = customBranches.properties || {};
        customBranches.functions = customBranches.functions || {};
        
        output.push(new pageTreeViewBranch("constructor"));    
        
        enumerate(classDescription.staticEvents, function(event) {
            if(customBranches.staticEvents[event.eventName])
                output.push(customBranches.staticEvents[event.eventName]);
            else
                output.push(new pageTreeViewBranch(event.eventName, null));            
        });
        
        enumerate(classDescription.staticProperties, function(property) {
            if(customBranches.staticProperties[property.propertyName])
                output.push(customBranches.staticProperties[property.propertyName]);
            else
                output.push(new pageTreeViewBranch(property.propertyName, null));
        });
        
        enumerate(classDescription.staticFunctions, function(_function) {
            if(customBranches.staticFunctions[_function.functionName])
                output.push(customBranches.staticFunctions[_function.functionName]);
            else
                output.push(new pageTreeViewBranch(_function.functionName, null));            
        });
        
        enumerate(classDescription.events, function(event) {
            if(customBranches.events[event.eventName])
                output.push(customBranches.events[event.eventName]);
            else
                output.push(new pageTreeViewBranch(event.eventName, null));            
        });
        
        enumerate(classDescription.properties, function(property) {
            if(customBranches.staticProperties[property.propertyName])
                output.push(customBranches.staticProperties[property.propertyName]);
            else
                output.push(new pageTreeViewBranch(property.propertyName, null));            
        });
        
        enumerate(classDescription.functions, function(_function) {
            if(customBranches.functions[_function.functionName])
                output.push(customBranches.functions[_function.functionName]);
            else
                output.push(new pageTreeViewBranch(_function.functionName, null));            
        });
        
        output.sort(function() { return arguments[0].name === "constructor" ? -1 : arguments[0].name.localeCompare(arguments[1].name); });
        return output;
    };
    
    //#######################################################
    //## END: Class
    //#######################################################
    
    //#######################################################
    //## Function
    //#######################################################
    
    var functionDescription = classDescriptionItem.extend(function(theFunction, functionName, classFullName) {
        this._super(functionName, functionDescription.getFunctionSummary(theFunction));
        
        this.function = theFunction;
        this.functionName = functionName;
        this.classFullName = classFullName;
        
        this.overrides = null;
    });
        
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
    
    //#######################################################
    //## END: Function
    //#######################################################
    
    //#######################################################
    //## Property
    //#######################################################
    
    var propertyDescription = classDescriptionItem.extend(function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, propertyDescription.getPropertySummary(constructorFunction, propertyName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
    });
    
    var inlineCommentOnly = /^\/\//;
    propertyDescription.getPropertySummary = function(constructorFunction, propertyName) {
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
        
        var result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName + "\"\\s*\\]\\s*="));        
    };
    
    //#######################################################
    //## END: Property
    //#######################################################  
    
    //#######################################################
    //## Event
    //#######################################################
    
    var eventDescription = classDescriptionItem.extend(function(constructorFunction, eventName, classFullName) {
        this._super(eventName, propertyDescription.getPropertySummary(constructorFunction, eventName));
        
        this.eventName = eventName;
        this.classFullName = classFullName;
    });
    
    //#######################################################
    //## END: Event
    //#######################################################  
    
    //#######################################################
    //## Export
    //#######################################################
    
    var components = {
        TreeViewBranch: treeViewBranch,
        PageTreeViewBranch: pageTreeViewBranch/*,
        ClassTreeViewBranch: classTreeViewBranch*/
    };
    
    var pages = {
        LandingPage: landingPage
    };
    
    var descriptions = {
        LandingPage: landingPage,
        Class: classDescription,
        //EventPage: eventPage,
        //PropertyPage: propertyPage,
        //FunctionPage: functionPage
    };
    
    return {
        Application: application,
        Components: components,
        Pages: pages,
        Descriptions: descriptions
    };
})());