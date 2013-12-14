
    var wpfko = wpfko || {};
    wpfko.base = wpfko.base || {};

(function () {    

    var view = wpfko.base.visual.extend(function (templateId, model /*optional*/) {

        this._super(templateId);
        
        this.model = ko.observable(model);
        
        var model = null;
        this.model.subscribe(function(newVal) {
            try {
                this.modelChanged(model, newVal);
            } finally {
                model = newVal;
            }                                          
        }, this);
        
        this._bindings = {};
    });    
    
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
    }
    
    view.prototype.dispose = function() {
        this._super();
        
        for(var i in this._bindings)
            this._bindings[i].dispose();
    };
    
    view.prototype.bind = function(property, valueAccessor, valueSetter /*optional*/) {
        
        if(valueSetter && !ko.isObservable(this[property]))
           throw 'Two way bindings must be between 2 observables';
           
        if(this._bindings[property]) {
            this._bindings[property].dispose();
            delete this._bindings[property];
        }
        
        var toBind = ko.dependentObservable({ read: valueAccessor, write: valueSetter});
        
        setObservable(this, property, toBind.peek());
        var subscription1 = toBind.subscribe(function(newVal) {
            setObservable(this, property, newVal);
        }, this);
        
        var subscription2 = valueSetter && ko.isObservable(this[property]) ?
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
    
    view.reservedPropertyNames = ["constructor", "constructor-tw", "id","id-tw"];
    
    view.prototype.initialize = function(propertiesXml, bindingContext) {
        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        if(!propertiesXml)
            return;
                
        if(!wpfko.template.htmlBuilder.elementHasModelBinding(propertiesXml) && wpfko.util.ko.peek(this.model) == null) {
            this.bind('model', function() { return ko.utils.unwrapObservable(bindingContext.$parent.model); });
        }
        
        enumerate(propertiesXml.attributes, function(attr) {
            // reserved
            if(view.reservedPropertyNames.indexOf(attr.nodeName) !== -1) return;
            
            var name = attr.nodeName, setter = "";
            if(name.indexOf("-tw") === attr.nodeName.length - 3) {
                name = name.substr(0, name.length - 3);
                setter = ",\n\t\t\tfunction(val) {\n\t\t\t\tif(!ko.isObservable(" + attr.value + "))\n\t\t\t\t\tthrow 'Two way bindings must be between 2 observables';\n\t\t\t\t" + attr.value + "(val);\n\t\t\t}"
            }
            
            wpfko.template.engine.createJavaScriptEvaluatorFunction("(function() {\n\t\t\t$data.bind('" + name + "', function() {\n\t\t\t\treturn ko.utils.unwrapObservable(" + attr.value + ");\n\t\t\t}" + setter + ");\n\n\t\t\treturn '';\n\t\t})()")(bindingContext);
        });
        
        enumerate(propertiesXml.childNodes, function(child, i) {
            
            if(child.nodeType !== 1) return;
            
            // default
            var type = "string";
            for(var j = 0, jj = child.attributes.length; j < jj; j++) {
                if(child.attributes[j].nodeName === "constructor" && child.attributes[j].nodeValue) {
                    type = child.attributes[j].nodeValue;
                    break;
                }
            }
            
            if (view.objectParser[type]) {
                var innerHTML = [];
                var ser = ser || new XMLSerializer();
                for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                    innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }
            
                var val = view.objectParser[type](innerHTML.join(""));
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }
            } else {
                var val = wpfko.util.obj.createObject(type);
                val.initialize(child, bindingContext.createChildContext(val));
                
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }     
            }
        }, this);
    };
    
    view.objectParser = {
        "string": function (value) {
            return value;
        },
        "bool": function (value) {
            var tmp = value.replace(/^\s+|\s+$/g, '').toLowerCase();
            return tmp ? tmp !== "false" && tmp !== "0" : false;
        },
        "int": function (value) {
            return parseInt(value.replace(/^\s+|\s+$/g, ''));
        },
        "float": function (value) {
            return parseFloat(value.replace(/^\s+|\s+$/g, ''));
        },
        "regexp": function (value) {
            return new RegExp(value.replace(/^\s+|\s+$/g, ''));
        },
        "date": function (value) {
            return new Date(value.replace(/^\s+|\s+$/g, ''));
        }
    };
    
    // virtual
    view.prototype.modelChanged = function (oldValue, newValue) {
    };

    wpfko.base.view = view;
})();
