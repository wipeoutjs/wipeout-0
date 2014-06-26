
Class("wipeout.base.view", function () {    

    var modelRoutedEventKey = "wipeout.base.view.modelRoutedEvents";
    
    var view = wipeout.base.visual.extend(function (templateId, model /*optional*/) {        
        ///<summary>Extends on the visual class to provide expected MVVM functionality, such as a model and bindings</summary>  
        ///<param name="templateId" type="String" optional="true">An initial template id</param>
        ///<param name="model" type="Any" optional="true">An initial model</param>

        this._super(templateId);
        
        if(model === undefined)
            model = null;
        
        //The model of view. If not set, it will default to the model of its parent view
        this.model = ko.observable(model);
        
        var d1 = this.model.subscribe(function(newVal) {
            try {
                this._onModelChanged(model, newVal);
            } finally {
                model = newVal;
            }                                          
        }, this);
        this.registerDisposable(d1);
                                
        //Placeholder to store binding disposeal objects
        this.__woBag.bindings = {};
    }, "view"); 
    
    view.setObservable = function(obj, property, value) {
        if(ko.isObservable(obj[property])) {
            obj[property](ko.utils.unwrapObservable(value));
        } else {
            obj[property] = ko.utils.unwrapObservable(value);
        }
    };
    
    view.prototype.disposeOfBinding = function(propertyName) {
        ///<summary>Un-bind this property.</summary>
        ///<param name="propertyName" type="String" optional="false">The name of the property to un-bind</param>
        
        if(this.__woBag.bindings[propertyName]) {
            this.__woBag.bindings[propertyName].dispose();
        }
    };
    
    view.prototype.dispose = function() {
        ///<summary>Dispose of view specific items</summary>    
        this._super();
        
        if(this.__woBag[modelRoutedEventKey]) {
            this.disposeOf(this.__woBag[modelRoutedEventKey]);
            delete this.__woBag[modelRoutedEventKey];
        }
        
        for(var i in this.__woBag.bindings)
            this.disposeOfBinding(i);
    };

    
    // virtual
    view.prototype.onInitialized = function() {
        ///<summary>Called by the template engine after a view is created and all of its properties are set</summary>    
    };
    
    view.prototype.bind = function(property, valueAccessor, twoWay) {
        ///<summary>Bind the value returned by valueAccessor to this[property]</summary>
        ///<param name="property" type="String" optional="false">The name of the property to bind</param>
        ///<param name="valueAccessor" type="Function" optional="false">A function which returns an observable or object to bind to</param>
        ///<param name="twoWay" type="Boolean" optional="true">Specifies whether to bind the destination to the source as well</param>
        ///<returns type="wo.disposable">A item to dispose of the binding</returns>
        
        if(twoWay && (!ko.isObservable(this[property]) || !ko.isObservable(valueAccessor())))
           throw 'Two way bindings must be between 2 observables';
           
        this.disposeOfBinding(property);
        
        var toBind = ko.dependentObservable({ 
            read: function() { return ko.utils.unwrapObservable(valueAccessor()); },
            write: twoWay ? function() { var va = valueAccessor(); if(va) va(arguments[0]); } : undefined
        });                                 
        
        var unsubscribe1 = false;
        var unsubscribe2 = false;
        view.setObservable(this, property, toBind.peek());
        var subscription1 = toBind.subscribe(function(newVal) {
            if(!unsubscribe1) {
                try {
                    unsubscribe2 = true;
                    view.setObservable(this, property, newVal);
                } finally {
                    unsubscribe2 = false;
                }
            }
        }, this);
        
        var subscription2 = twoWay ?
            this[property].subscribe(function(newVal) {
                if(!unsubscribe2) {
                    try {
                        unsubscribe1 = true;
                        view.setObservable({x: toBind}, "x", newVal);
                    } finally {
                        unsubscribe1 = false;
                    }
                }
            }, this) :
            null;
        
        var _this = this;
        return this.__woBag.bindings[property] = new wipeout.base.disposable(function() {
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
            
            delete _this.__woBag.bindings[property];
        });
    };    
    
    view._elementHasModelBinding = function(element) {
        ///<summary>returns whether the view defined in the element was explicitly given a model property</summary>
        ///<param name="element" type="Element" optional="false">The element to check for a model setter property</param>
        ///<returns type="Boolean"></returns>
        
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
    view.prototype._initialize = function(propertiesXml, parentBindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        ///<param name="propertiesXml" type="Element" optional="false">An XML element containing property setters for the view</param>
        ///<param name="parentBindingContext" type="ko.bindingContext" optional="false">The binding context of the wipeout node just above this one</param>
        if(this.__woBag.initialized) throw "Cannot call initialize item twice";
        this.__woBag.initialized = true;
        
        if(!propertiesXml)
            return;
        
        this.__woBag.type = propertiesXml.nodeName;
        
        var prop = propertiesXml.getAttribute("id");
        if(prop)
            this.id = prop;
        
        prop = propertiesXml.getAttribute("shareParentScope");
        if(prop)
            this.shareParentScope = parseBool(prop);
                
        if(!view._elementHasModelBinding(propertiesXml) && wipeout.utils.ko.peek(this.model) == null) {
            this.bind('model', parentBindingContext.$data.model);
        }
        
        var bindingContext = this.shareParentScope ? parentBindingContext : parentBindingContext.createChildContext(this);        
        enumerate(propertiesXml.attributes, function(attr) {
            // reserved
            if(view.reservedPropertyNames.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(attr.nodeName.length > 3 && name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = 
",\
            function(val) {\
                if(!ko.isObservable(" + attr.value + "))\
                    throw 'Two way bindings must be between 2 observables';\
                " + attr.value + "(val);\
            }";
            }
            
            try {
                //TODO: can I get the view from somewhere else?
                bindingContext.__$woCurrent = this;
                wipeout.template.engine.createJavaScriptEvaluatorFunction(
        "(function() {\
            __$woCurrent.bind('" + name + "', function() {\
                return " + attr.value + ";\
            }" + setter + ");\
\
            return '';\
        })()"
                )(bindingContext);
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
                    if(child.childNodes[j].nodeType == 3)
                        innerHTML.push(child.childNodes[j].nodeValue);
                    else
                        innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }
            
                var val = view.objectParser[trimToLower(type)](innerHTML.join(""));
                view.setObservable(this, child.nodeName, val);
            } else {
                var val = wipeout.utils.obj.createObject(type);
                if(val instanceof wipeout.base.view) {
                    val.__woBag.createdByWipeout = true;
                    val._initialize(child, bindingContext);
                }
                
                view.setObservable(this, child.nodeName, val);
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
        
    view.prototype._onModelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="oldValue" type="Any" optional="false">The old model</param>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>
        
        if(oldValue !== newValue) {
            this.disposeOf(this.__woBag[modelRoutedEventKey]);
            delete this.__woBag[modelRoutedEventKey];
            
            if(newValue instanceof wipeout.base.routedEventModel) {
                var d1 = newValue.__triggerRoutedEventOnVM.register(this.onModelRoutedEvent, this);
                this.__woBag[modelRoutedEventKey] = this.registerDisposable(d1);
            }
        }
        
        this.onModelChanged(oldValue, newValue);
    };
        
    // virtual
    view.prototype.onModelChanged = function (oldValue, newValue) {
        ///<summary>Called when the model has changed</summary>
        ///<param name="oldValue" type="Any" optional="false">The old model</param>
        ///<param name="newValue" type="Any" optional="false">The new mode</param>        
    };
    
    view.prototype.onModelRoutedEvent = function (eventArgs) {
        ///<summary>When the model of this class fires a routed event, catch it and continue the traversal upwards</summary>
        ///<param name="eventArgs" type="wo.routedEventArgs" optional="false">The routed event args</param>
        
        if(!(eventArgs.routedEvent instanceof wipeout.base.routedEvent)) throw "Invaid routed event";
        
        this.triggerRoutedEvent(eventArgs.routedEvent, eventArgs.eventArgs);
    };

    return view;
});
