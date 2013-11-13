
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
    
    var setObservable = function(obj, property, value) {
        if(ko.isObservable(obj[property])) {
            obj[property](ko.utils.unwrapObservable(value));
        } else {
            obj[property] = ko.utils.unwrapObservable(value);
        }
    };
    
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
        
        var toBind = ko.computed({ read: valueAccessor, write: valueSetter});
        
        setObservable(this, property, toBind.peek());
        var subscription1 = toBind.subscribe(function(newVal) {
            setObservable(this, property, newVal);
        }, this);
        debugger;
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
    
    view.prototype.initialize = function(propertiesXml) {
        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        if(!propertiesXml)
            return;
        
        for (var i = 0, ii = propertiesXml.children.length; i < ii; i++) {
            
            var child = propertiesXml.children[i];  
            
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
                val.initialize(child);
                
                if(ko.isObservable(this[child.nodeName])) {
                    this[child.nodeName](val);       
                } else {
                    this[child.nodeName] = val;       
                }     
            }
        }
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
