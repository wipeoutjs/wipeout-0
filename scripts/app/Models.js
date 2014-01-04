
$.extend(NS("Wipeout.Docs.Models"), (function() {
    
    var enumerate = function(enumerate, callback, context) {
        context = context || window;
        
        if(enumerate)
            for(var i = 0, ii = enumerate.length; i < ii; i++)
                callback.call(context, enumerate[i], i);
    };
    
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function getParamNames(func) {
      var fnStr = func.toString().replace(STRIP_COMMENTS, '')
      var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
      if(result === null)
         result = []
      return result
    }
    
    var application = wo.object.extend(function() {
        
        this.content = ko.observable(new landingPage());
        
        var objectBranch = new classTreeViewBranch("wo.object");
        var visualBranch = new classTreeViewBranch("wo.visual");
        var viewBranch = new classTreeViewBranch("wo.view");
        var contentControlBranch = new classTreeViewBranch("wo.contentControl");
        var itemsControlBranch = new classTreeViewBranch("wo.itemsControl");
        var eventBranch = new classTreeViewBranch("wo.event");
        var routedEventBranch = new classTreeViewBranch("wo.routedEvent");
        var routedEventArgsBranch = new classTreeViewBranch("wo.routedEventArgs");
        var routedEventRegistrationBranch = new classTreeViewBranch("wo.routedEventRegistration");
        
        this.menu =
            new pageTreeViewBranch("API", null, [
                new pageTreeViewBranch("wo", null, [
                    contentControlBranch,
                    eventBranch,
                    itemsControlBranch,
                    objectBranch,
                    routedEventBranch,
                    routedEventArgsBranch,
                    routedEventRegistrationBranch,
                    viewBranch,
                    visualBranch
                ])
        ]);        
    });
        
    //####################################################
    //## Base
    //####################################################   
            
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
        
    var page = wo.object.extend(function(title) {
        this.title = title;
    });
        
    //####################################################
    //## Class
    //####################################################
            
    var classTreeViewBranch = pageTreeViewBranch.extend(function(fullName) {
        this._super(classTreeViewBranch.getClassName(fullName), new classPage(fullName), classTreeViewBranch.getBranches(fullName));
            
        enumerate(this.branches, function(branch) {
            if (branch instanceof eventBranch) {
                this.page.addEvent(branch.name, branch.summary, branch.page);
            } else if (branch instanceof propertyBranch) {
                this.page.addProperty(branch.name, branch.summary, branch.isStatic, branch.page);
            } else if (branch instanceof functionBranch) {
                this.page.addFunction(branch.name, branch.summary, branch.isStatic, branch.page);
            } else {
                throw "Invalid branch type";
            }
        }, this);
            
        this.branches.sort(function() { return arguments[0].name.localeCompare(arguments[1].name); });
        this.page.order();
    });

    classTreeViewBranch.getClassName = function(fullName) {
        fullName = fullName.split(".");
        return fullName[fullName.length - 1];
    };

    classTreeViewBranch.getBranches = function(fullName) {
        var splitFullName = fullName.split(".");
        var current = window;
        for(var i = 0, ii = splitFullName.length; i < ii; i++) {
            current = current[splitFullName[i]];
        }        
        
        // compile prototype tree into array
        var inheritanceTree = [];
        current = current.prototype;
        while(current) {
            inheritanceTree.push(current.constructor);
            current = Object.getPrototypeOf(current);
        }
        
        var instance = {};
        var prototype = {};
        var statics = {};
        var output = [];
            
        enumerate(inheritanceTree, function(current) {
            for(var i in current) {
                if(current.hasOwnProperty(i) && !statics[i]) {
                    statics[i] = true;
                    if(current[i] instanceof wo.event) {
                        output.push(new eventBranch(i, fullName));
                    } else if(current[i] instanceof Function) {
                        output.push(new functionBranch(i, fullName, true, current[i]));
                    } else {
                        output.push(new propertyBranch(i, fullName, true));
                    }
                }
            }
            
            for(var i in current.prototype) {
                if(current.prototype.hasOwnProperty(i)) {
                    if(prototype[i]) {
                        output.splice(output.indexOf(prototype[i]), 1);
                    }
                    
                    if(current.prototype[i] instanceof Function) { 
                        //TODO: if override
                        prototype[i] = new functionBranch(i, fullName, false, current.prototype[i]);
                    } else {
                        prototype[i] = new propertyBranch(i, fullName, false);
                    }
                    
                    output.push(prototype[i]);
                }
            }
            
            var anInstance = new current();        
            for(var i in anInstance) {
                if(anInstance.hasOwnProperty(i) && !instance[i]) {
                    instance[i] = true;
                    if(anInstance[i] instanceof Function && !ko.isObservable(anInstance[i])) {
                        output.push(new functionBranch(i, fullName, false, anInstance[i]));
                    } else {
                        output.push(new propertyBranch(i, fullName, false));
                    }
                }
            }
        });
        
        return output;
    };

    var classPage = page.extend(function(name) {
        this._super(name);
        
        this.events = [];
        this.properties = [];
        this.staticProperties = [];
        this.functions = [];
        this.staticFunctions = [];
        
        name = name.split(".");
        var current = window;
        for(var i = 0, ii = name.length; i < ii; i++) {
            current = current[name[i]];
        }
        
        this.classContructor = new classPageItem(this.title, functionBranch.getFunctionSummary(current));
    });
        
    classPage.prototype.order = function() {
        
        var sort = function() { return arguments[0].name.localeCompare(arguments[1].name); };
        this.events.sort(sort);
        this.properties.sort(sort);
        this.staticProperties.sort(sort);
        this.functions.sort(sort);
        this.staticFunctions.sort(sort);
    };
        
    classPage.prototype.addEvent = function(name, summary, page) {
        this.events.push(new classPageItem(name, summary, page));
    };
        
    classPage.prototype.addProperty = function(name, summary, isStatic, page) {
        if(isStatic)
            this.staticProperties.push(new classPageItem(name, summary, page));
        else
            this.properties.push(new classPageItem(name, summary, page));
    };
        
    classPage.prototype.addFunction = function(name, summary, isStatic, page) {
        if(isStatic)
            this.staticFunctions.push(new classPageItem(name, summary, page));
        else
            this.functions.push(new classPageItem(name, summary, page));
    };
    
    var classPageItem = function(name, summary, page) {
        this.name = name;
        this.summary = summary;
        this.page = page;
    };
        
    //####################################################
    //## Event
    //####################################################

    var eventBranch = pageTreeViewBranch.extend(function(name, classFullName){
        this._super(name, new eventBranch(name, classFullName));        
    });
        
    var eventPage = page.extend(function(name, classFullName) {
        this._super(name); 
        
        this.classFullName = classFullName;
        this.summaryTemplate = "Event_Summary_" + classFullName + "." + name;
    });
        
    //####################################################
    //## Property
    //####################################################
        
    var propertyBranch = pageTreeViewBranch.extend(function(name, classFullName, isStatic){
        this._super(name, new propertyPage(name, classFullName, isStatic));
        
        this.isStatic = isStatic;
    });
        
    var propertyPage = page.extend(function(name, classFullName, isStatic) {
        this._super(name); 
        
        this.classFullName = classFullName;
        this.isStatic = isStatic;
        this.summaryTemplate = "Property_Summary_" + classFullName + "." + name;
    });
        
    //####################################################
    //## Function
    //####################################################   

    var functionBranch = pageTreeViewBranch.extend(function(name, classFullName, isStatic, theFunction){
        this._super(name, new functionPage(name, classFullName, isStatic, functionBranch.getArgs(theFunction)));
        this.isStatic = isStatic;
        
        this.summary = functionBranch.getFunctionSummary(theFunction);
    });
        
    functionBranch.getFunctionSummary = function(theFunction) {
        var ttt = theFunction;
        thisFunction = theFunction.toString();
        
        var isInlineComment = false;
        var isBlockComment = false;
        
        var removeFunctionDefinition = function() {
            var firstInline = thisFunction.indexOf("//");
            var firstBlock = thisFunction.indexOf("/*");
            var openFunction = thisFunction.indexOf("{");
            
            if(firstInline === -1) firstInline = Number.MAX_VALUE;
            if(firstBlock === -1) firstBlock = Number.MAX_VALUE;
                    
            if(openFunction < firstInline && openFunction < firstBlock) {
                thisFunction = thisFunction.substr(openFunction + 1).replace(/^\s+|\s+$/g, '');
            } else { 
                if(firstInline < firstBlock) {
                    thisFunction = thisFunction.substr(thisFunction.indexOf("\n")).replace(/^\s+|\s+$/g, '');
                } else {
                    thisFunction = thisFunction.substr(thisFunction.indexOf("*/")).replace(/^\s+|\s+$/g, '');
                }
                
                removeFunctionDefinition();
            }
        };
        
        removeFunctionDefinition();
        
        if (thisFunction.indexOf("///<summary>" === 0)) {
            return thisFunction.substring(12, thisFunction.indexOf("</summary>"));
        }
        
        return "";   
    };

    functionBranch.getArgs = function(theFunction) {
        var output = [];
        
        enumerate(getParamNames(theFunction), function(arg) {
            output.push({ name: arg, type: "unknown" });
        }, this);
        
        return output;
    };
        
    var functionPage = page.extend(function(name, classFullName, isStatic, args) {
        this._super(name); 
        
        this.classFullName = classFullName;
        this.isStatic = isStatic;
        this.summaryTemplate = "Function_Summary_" + classFullName + "." + name;
        this.arguments = [];
        
        enumerate(args, function(arg) { 
            this.arguments.push({
                name: arg.name,
                type: arg.type,
                template: "Function_Argument_" + classFullName + "." + name + "_" + arg.name
            });
        }, this);
    });
        
    //####################################################
    //## END Function
    //####################################################   
    
    var landingPage =  page.extend(function(title) {
       this._super(title); 
    });
    
    var components = {
        TreeViewBranch: treeViewBranch,
        PageTreeViewBranch: pageTreeViewBranch,
        ClassTreeViewBranch: classTreeViewBranch
    };
    
    var pages = {
        LandingPage: landingPage,
        ClassPage: classPage,
        EventPage: eventPage,
        PropertyPage: propertyPage,
        FunctionPage: functionPage
    };
    
    return {
        Application: application,
        Components: components,
        Pages: pages
    };
})());