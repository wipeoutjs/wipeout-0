

(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.base = wpfko.base || {};

    var view = wpfko.base.visual.extend(function (templateId) {

        this._super(templateId);
        
        this.model = ko.observable();
        this.model.deepSubscribe(this.modelChanged, this);
    });
    
    view.prototype.initialize = function(bindingContext, propertiesXml) {

        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        //TODO: what to do with this (it has a dispose function)
        new wpfko.util.oneWayBinding(bindingContext, this, "bindingContext");
        
        if(!propertiesXml)
            return;
        
        var _this = this;
        var bindInline = function(key, value){
            debugger;
            // create function which will return bound value
            var accessor = ko.isObservable(bindingContext) ?                
                new Function("with(arguments[0]()) { with((arguments[0]() || {}).$data) { return " + value + "; } }") :
                new Function("with(arguments[0]) { with((arguments[0] || {}).$data) { return " + value + "; } }");
            
            return function () {

                // wrap each bound value in a dependent observable, which will detect changes in chained dependent properties
                var bindable = ko.isObservable(accessor(_this.bindingContext)) ?
                            ko.dependentObservable(function () {
                                return accessor(_this.bindingContext)();
                            }) :
                            ko.dependentObservable(function () {
                                return accessor(_this.bindingContext);
                            });
                
                //TODO: what to do with this (it has a dispose function)
                new wpfko.util.oneWayBinding(bindable, _this, key);
            };
        };
        
        var bindSimple = function(child, type){            
            var innerHTML = [];
            var ser = new XMLSerializer();
            for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                innerHTML.push(ser.serializeToString(child.childNodes[j]));
            }
        
            var val = view.objectParser[type](innerHTML.join(""));
            return function() {
                //TODO: what to do with this (it has a dispose function)
                new wpfko.util.oneWayBinding(val, _this, child.nodeName);            
            };
        };
        
        var bindComplex = function(child, type){                   
            var val = wpfko.util.obj.createObject(type);
            val.initialize(this.createSubscribableChildBindingContext(val), child);
            return function() {
                //TODO: what to do with this (it has a dispose function)
                new wpfko.util.oneWayBinding(val, _this, child.nodeName);
            };
        };
        
        var properties = {};
        for (var i = 0, ii = propertiesXml.attributes.length; i < ii; i++) {

            if(propertiesXml.attributes[i].nodeName === "constructor") {
                // reserved
                continue;
            }
            
            if(properties[propertiesXml.attributes[i].nodeName]) throw "Attempting to set property \"" + propertiesXml.attributes[i].key + "\" more than once";
            properties[propertiesXml.attributes[i].nodeName] = bindInline(propertiesXml.attributes[i].nodeName, propertiesXml.attributes[i].value);
        }
        
        for (var i = 0, ii = propertiesXml.children.length; i < ii; i++) {
            
            var child = propertiesXml.children[i];
            
            if(properties[child.nodeName]) throw "Attempting to set property \"" + child.nodeName + "\" more than once";
                                    
            var type =  child.attributes["constructor"] && child.attributes["constructor"].value ? child.attributes["constructor"].value : "string";
            if (view.objectParser[type]) {
                properties[child.nodeName] = bindSimple(child, type);
            } else {                            
                properties[child.nodeName] = bindComplex(child, type);
            }
        }
        
        var priorities = ["model"];
        if(!properties["model"])
            properties["model"] = bindInline("model", "$parent.model");
        
        for(var i = 0, ii = priorities.length; i < ii; i++) {
            if(properties[priorities[i]]) {
                properties[priorities[i]]();
                delete properties[priorities[i]];   
            }
        }
        
        for(var i in properties) {
            properties[i]();
            delete properties[i];
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
        },
        "jquery": function (value) {
            return $(value);
        }
    };

    // virtual
    view.prototype.modelChanged = function (oldValue, newValue) {
    };

    wpfko.base.view = view;
})();
