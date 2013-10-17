
    var wpfko = wpfko || {};
    wpfko.base = wpfko.base || {};

(function () {    

    var view = wpfko.base.visual.extend(function (templateId) {

        this._super(templateId);
        
        this.model = ko.observable();
        this.model.deepSubscribe(this.modelChanged, this);
    });
    
    view.prototype.initialize = function(propertiesXml) {

        if(this._initialized) throw "Cannot call initialize item twice";
        this._initialized = true;
        
        if(!propertiesXml)
            return;
        
        var _this = this;
        var properties = {};
        
        var bindInline = function(propertName, propertyValue) {
            return function() {
            // do nothing, a binding will be added to the template to handle this
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
                if(ko.isObservable(_this[child.nodeName])) {
                    _this[child.nodeName](val);       
                } else {
                    _this[child.nodeName] = val;       
                }
            };
        };
        
        var bindComplex = function(child, type) { 
            var val = wpfko.util.obj.createObject(type);
            val.initialize(child);            
            return function() {                
                if(ko.isObservable(_this[child.nodeName])) {
                    _this[child.nodeName](val);       
                } else {
                    _this[child.nodeName] = val;       
                }
            };
        };
        
        for (var i = 0, ii = propertiesXml.attributes.length; i < ii; i++) {

            if(propertiesXml.attributes[i].nodeName === "constructor") {
                // reserved
                continue;
            }
            
            if(properties[propertiesXml.attributes[i].nodeName])
                throw "Attempting to set property \"" + propertiesXml.attributes[i].key + "\" more than once";
            
            properties[propertiesXml.attributes[i].nodeName] = bindInline(propertiesXml.attributes[i].nodeName, propertiesXml.attributes[i].value);
        }
        
        for (var i = 0, ii = propertiesXml.children.length; i < ii; i++) {
            
            var child = propertiesXml.children[i];            
            if(properties[child.nodeName])
                throw "Attempting to set property \"" + child.nodeName + "\" more than once";
            
            // default
            var type = "string";
            for(var j = 0, jj = child.attributes.length; j < jj; j++) {
                if(child.attributes[i].nodeName === "constructor" && child.attributes[i].nodeValue) {
                    type = child.attributes[i].nodeValue;
                    break;
                }
            }
            
            if (view.objectParser[type]) {
                properties[child.nodeName] = bindSimple(child, type);
            } else {                            
                properties[child.nodeName] = bindComplex(child, type);
            }
        }
        
        // default to model of perent
        if(!properties["model"])
            //TODO: $parent.model may not be valid for items set in a template
            properties["model"] = bindInline("model", "$parent.model");
        
        // set priority properties
        var priorities = ["model"];
        for(var i = 0, ii = priorities.length; i < ii; i++) {
            if(properties[priorities[i]]) {
                properties[priorities[i]]();
                delete properties[priorities[i]];   
            }
        }
        
        // set all properties
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
