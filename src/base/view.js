
Class("wpfko.base.view", function () {    

    var modelRoutedEventKey = "wo.view.modelRoutedEvents";
    
    var view = wpfko.base.visual.extend(function (templateId, model /*optional*/) {        
        ///<summary>Extends on the visual class to provide expected MVVM functionality, such as a model and bindings</summary>    

        this._super(templateId);
        
        //The model of view. If not set, it will default to the model of its parent view
        this.model = ko.observable(model || null);
        
        var model = null;
        this.model.subscribe(function(newVal) {
            try {
                this.modelChanged(model, newVal);
            } finally {
                model = newVal;
            }                                          
        }, this);
        
        //Placeholder to store binding disposeal objects
        this._bindings = {};
    }, "view");    
    
    var enumerate = function(items, callback, context) {
        
        for(var i = 0, ii = items.length; i < ii; i++) {
            callback.call(context, items[i], i);
        }        
    };
    
    var setObservable = function(obj, property, value) {
        if(ko.isObservable(obj[property])) {
            obj[property](ko.utils.unwrapObservable(value));
        } else {
            obj[property] = ko.utils.unwrapObservable(value);
        }
    };
    
    // virtual
    view.prototype.onInitialized = function() {
        ///<summary>Called by the template engine after a view is created and all of its properties are set</summary>    
    }
    
    view.prototype.dispose = function() {
        ///<summary>Dispose of view specific items</summary>    
        this._super();
        
        if(this.__woBag[modelRoutedEventKey]) {
            this.__woBag[modelRoutedEventKey].dispose();
            delete this.__woBag[modelRoutedEventKey];
        }
        
        for(var i in this._bindings)
            this.disposeOfBinding(i);
    };
    
    view.prototype.disposeOfBinding = function(propertyName) {
        if(this._bindings[propertyName]) {
            this._bindings[propertyName].dispose();
            delete this._bindings[propertyName];
        }
    };
    
    view.prototype.bind = function(property, valueAccessor, twoWay) {
        ///<summary>Bind the value returned by valueAccessor to this[property]</summary>
        
        if(twoWay && (!ko.isObservable(this[property]) || !ko.isObservable(valueAccessor())))
           throw 'Two way bindings must be between 2 observables';
           
        this.disposeOfBinding(property);
        
        var toBind = ko.dependentObservable({ 
            read: function() { return ko.utils.unwrapObservable(valueAccessor()); },
            write: twoWay ? function() { var va = valueAccessor(); if(va) va(arguments[0]); } : undefined
        });                                 
        
        setObservable(this, property, toBind.peek());
        var subscription1 = toBind.subscribe(function(newVal) {
            setObservable(this, property, newVal);
        }, this);
        
        var subscription2 = twoWay ?
            this[property].subscribe(function(newVal) {
                setObservable({x: toBind}, "x", newVal);
            }, this) :
            null;
        
        this._bindings[property] = {
            dispose: function() {
                if(subscription1) {
                    subscription1.dispose();
                    subscription1 = null;
                }
                
                if(subscription2) {
                    subscription2.dispose();
                    subscription2 = null;
                }
                
                if(toBind) {
                    toBind.dispose();
                    toBind = null;
                }
            }
        };
    };    
    
    view.elementHasModelBinding = function(element) {
        ///<summary>returns whether the view defined in the element was explicitly given a model property</summary>
        
        for(var i = 0, ii = element.attributes.length; i < ii; i++) {
            if(element.attributes[i].nodeName === "model" || element.attributes[i].nodeName === "model-tw")
                return true;
        }
        
        for(var i = 0, ii = element.childNodes.length; i < ii; i++) {
            if(element.childNodes[i].nodeType === 1 && element.childNodes[i].nodeName === "model")
                return true;
        }
        
        return false;
    };
    
    view.reservedPropertyNames = ["constructor", "constructor-tw", "id","id-tw"];
    
    //TODO private
    view.prototype.initialize = function(propertiesXml, parentBindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        if(!propertiesXml)
            return;
        
        var prop = propertiesXml.getAttribute("woInvisible");
        if(prop)
            this.woInvisible = parseBool(prop);
                
        if(!view.elementHasModelBinding(propertiesXml) && wpfko.utils.ko.peek(this.model) == null) {
            this.bind('model', parentBindingContext.$data.model);
        }
        
        var bindingContext = this.woInvisible ? parentBindingContext : parentBindingContext.createChildContext(this);        
        enumerate(propertiesXml.attributes, function(attr) {
            // reserved
            if(view.reservedPropertyNames.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = ",\n\t\t\tfunction(val) {\n\t\t\t\tif(!ko.isObservable(" + attr.value + "))\n\t\t\t\t\tthrow 'Two way bindings must be between 2 observables';\n\t\t\t\t" + attr.value + "(val);\n\t\t\t}";
            }
            
            try {
                bindingContext.__$woCurrent = this;
                wpfko.template.engine.createJavaScriptEvaluatorFunction("(function() {\n\t\t\t__$woCurrent.bind('" + name + "', function() {\n\t\t\t\treturn " + attr.value + ";\n\t\t\t}" + setter + ");\n\n\t\t\treturn '';\n\t\t})()")(bindingContext);
            } finally {
                delete bindingContext.__$woCurrent;
            }
        }, this);
        
        enumerate(propertiesXml.childNodes, function(child, i) {
            
            if(child.nodeType !== 1 || view.reservedPropertyNames.indexOf(child.nodeName) !== -1) return;
            
            // default
            var type = "string";
            for(var j = 0, jj = child.attributes.length; j < jj; j++) {
                if(child.attributes[j].nodeName === "constructor" && child.attributes[j].nodeValue) {
                    type = child.attributes[j].nodeValue;
                    break;
                }
            }
            
            if (view.objectParser[trimToLower(type)]) {
                var innerHTML = [];
                var ser = ser || new XMLSerializer();
                for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                    innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }
            
                var val = view.objectParser[trimToLower(type)](innerHTML.join(""));
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }
            } else {
                var val = wpfko.utils.obj.createObject(type);
                if(val instanceof wpfko.base.view) {
                    val.__createdByWipeout = true;
                    val.initialize(child, bindingContext);
                }
                
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }     
            }
        }, this);
    };
    
    view.objectParser = {
        "json": function (value) {
            //TODO: browser compatability
            return JSON.parse(value);
        },
        "string": function (value) {
            return value;
        },
        "bool": function (value) {
            var tmp = trimToLower(value);
            return tmp ? tmp !== "false" && tmp !== "0" : false;
        },
        "int": function (value) {
            return parseInt(trim(value));
        },
        "float": function (value) {
            return parseFloat(trim(value));
        },
        "regexp": function (value) {
            return new RegExp(trim(value));
        },
        "date": function (value) {
            return new Date(trim(value));
        }
    };
        
    view.prototype.modelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        if(this.__woBag[modelRoutedEventKey]) {
            this.__woBag[modelRoutedEventKey].dispose();
            delete this.__woBag[modelRoutedEventKey];
        }
        
        if(newValue instanceof wpfko.base.routedEventModel) {
            this.__woBag[modelRoutedEventKey] = newValue.__triggerRoutedEventOnVM.register(this.onModelRoutedEvent, this);
        }
    };
    
    view.prototype.onModelRoutedEvent = function (eventArgs) {
        ///<summary>When the model of this class fires a routed event, catch it and continue the traversal upwards</summary>
        if(!(eventArgs.routedEvent instanceof wpfko.base.routedEvent)) throw "Invaid routed event";
        
        this.triggerRoutedEvent(eventArgs.routedEvent, eventArgs.eventArgs);
    }

    return view;
});
