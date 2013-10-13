

(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.base = wpfko.base || {};

    var view = wpfko.base.visual.extend(function (templateId) {

        this._super(templateId);
        
        this.model = ko.observable();
        this.model.deepSubscribe(this.modelChanged, this);
    });
    
    view.prototype.initialize = function(bindingContext, propertiesXml) {

        if(this._initialized) throw "Cannot call initialize function twice";
        this._initialized = true;
        
        //TODO: what to do with this (it has a dispose function)
        new wpfko.util.oneWayBinding(bindingContext, this, "bindingContext");
        
        if(!propertiesXml)
            return;
        
        for (var i = 0, ii = propertiesXml.attributes.length; i < ii; i++) {

            if(propertiesXml.attributes[i].nodeName === "constructor") {
                // reserved
                continue;
            }
            
            // create function which will return bound value
            var accessor = ko.isObservable(bindingContext) ?                
                new Function("with(arguments[0]()) { with((arguments[0]() || {}).$data) { return " + propertiesXml.attributes[i].value + "; } }") :
                new Function("with(arguments[0]) { with((arguments[0] || {}).$data) { return " + propertiesXml.attributes[i].value + "; } }");

            // wrap each bound value in a dependent observable, which will detect changes in chained dependent properties
            var bindable = (function (bindingContext, accessor) {
                return ko.isObservable(accessor(bindingContext)) ?
                            ko.dependentObservable(function () {
                                return accessor(bindingContext)();
                            }) :
                            ko.dependentObservable(function () {
                                return accessor(bindingContext);
                            });
            })(this.bindingContext, accessor);
            
            //TODO: what to do with this (it has a dispose function)
            new wpfko.util.oneWayBinding(bindable, this, propertiesXml.attributes[i].nodeName);
        }
        
        for (var i = 0, ii = propertiesXml.children.length; i < ii; i++) {
            var child = propertiesXml.children[i];
            var type =  child.attributes["constructor"] && child.attributes["constructor"].value ? child.attributes["constructor"].value : "string";
            if (view.objectParser[type]) {
                var innerHTML = [];
                var ser = new XMLSerializer();
                for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                    innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }
            
                //TODO: what to do with this (it has a dispose function)
                var val = view.objectParser[type](innerHTML.join(""));
                new wpfko.util.oneWayBinding(val, this, child.nodeName);
            } else {            
                //TODO: what to do with this (it has a dispose function)
                var val = wpfko.util.obj.createObject(type);
                val.initialize(child, this.childBindingContext);
                new wpfko.util.oneWayBinding(val, this, child.nodeName);
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
