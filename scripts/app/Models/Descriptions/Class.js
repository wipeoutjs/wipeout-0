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