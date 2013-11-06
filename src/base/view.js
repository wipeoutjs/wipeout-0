
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
        this._bindingQueue = {};        
        this.parentView = null;
    });
    
    var setObservable = function(obj, property, value) {
        if(ko.isObservable(obj[property])) {
            obj[property](ko.utils.unwrapObservable(value));
        } else {
            obj[property] = ko.utils.unwrapObservable(value);
        }
    };
    
    //TODO: this is a very basic implementation and it is never used. Extend and implement
    view.prototype.dispose = function() {
        for(var i in this._bindings)
            this._bindings[i].dispose();
    };
    
    view.prototype.bind = function(property, bindTo) {
        if(this._bindings[property]) {
            this._bindings[property].dispose();
            delete this._bindings[property];
        }
        
        setObservable(this, property, bindTo);
        
        if(ko.isObservable(bindTo)) {
            this._bindings[property] = bindTo.subscribe(function(newVal) {
                setObservable(this, property, newVal);
            }, this);
        }                                
    };
    
    view.prototype.applyQueuedBindings = function() {
        if(this.parentView && this.parentView.applyQueuedBindings) this.parentView.applyQueuedBindings();
        
        var priorities = ["model"];
        for(var i = 0, ii = priorities.length; i < ii; i++) {
            if(this._bindingQueue[priorities[i]]) {
                this.bind(priorities[i], this._bindingQueue[priorities[i]]());
                delete this._bindingQueue[priorities[i]];
            }
        }
        
        for(i in this._bindingQueue) {
            this.bind(i, this._bindingQueue[i]());
            delete this._bindingQueue[i];
        }
    };
    
    view.prototype.rootHtmlChanged = function (oldValue, newValue) {
        wpfko.base.visual.prototype.rootHtmlChanged.apply(this, arguments);
        
        this.applyQueuedBindings();
    };
    
    view.prototype.initialize = function(propertiesXml, parentView) {
        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        this.parentView = parentView;
        
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
                val.initialize(child, this);             
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
    
    if(window.jQuery) {
        var $ = jQuery;
        view.objectParser.jquery = function (value) {
            return $(value);
        };
    }

    // virtual
    view.prototype.modelChanged = function (oldValue, newValue) {
    };

    wpfko.base.view = view;
})();
