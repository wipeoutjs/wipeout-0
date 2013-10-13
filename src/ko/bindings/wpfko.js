

var KoWpf = KoWpf || {};
KoWpf.Bindings = KoWpf.Bindings || {};
KoWpf.Bindings.ViewModel = KoWpf.Bindings.ViewModel || {};

ko.virtualElements.append = function (containerElem, nodeToAppend) {
    var current = ko.virtualElements.firstChild(containerElem);
    if (!current) {
        ko.virtualElements.prepend(containerElem, nodeToAppend);
        return;
    }

    var tmp;
    while (tmp = ko.virtualElements.nextSibling(current)) {
        current = tmp;
    }

    ko.virtualElements.insertAfter(containerElem, nodeToAppend, current);
}


$.extend(KoWpf.Bindings.ViewModel, (function () {
    
    var initX = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var view = new valueAccessor()();
        view.model(viewModel);

        var template = document.getElementById(value);
        if (!template) {
            throw "Could not find template: \"" + value + "\"";
        }

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString("<root>" + template.innerHTML + "</root>", "text/xml").documentElement;

        var ser = new XMLSerializer();
        for (var i = 0, ii = xmlDoc.childNodes.length; i < ii; i++) {

            if (xmlDoc.childNodes[i].nodeType == 1) {
                var item = Quest.KnockoutExtensions.ViewModel.fromXmlElement(xmlDoc.childNodes[i], bindingContext);
                var nodes = item.render();
                for (var j = 0, jj = nodes.length; i < jj; j++) {
                    ko.virtualElements.append(element, nodes[j]);
                }
            } else {
                var tmp = document.createElement("div");
                tmp.innerHTML = ser.serializeToString(xmlDoc.childNodes[i]);
                //TODO: will this fail if elelent is child of 2 nodes?
                ko.virtualElements.append(element, tmp.firstChild);
            }
        }
    };

    ko.virtualElements.allowedBindings.kowpf = true
    ko.bindingHandlers.kowpf = {
        init: initX
    };




    

    //TODO: more node types









    var setObservable = function (object, observable, value) {
        value = ko.utils.unwrapObservable(value);
        if (ko.isObservable(object[observable])) {
            object[observable](value);
        } else {
            object[observable] = value;
        }
    };

    var bind = function (bindFrom, bindToObject, bindToPropertyName) {
        var binding2;
        var binding1 = bindFrom.subscribe(function (bindFromVal) {
            var bindToVal = ko.utils.unwrapObservable(bindToObject[bindToPropertyName]);
            if (bindFromVal !== bindToVal) {
                KoWpf.Bindings.ViewModel.setObservable(bindToObject, bindToPropertyName, bindFromVal);
            }
        });

        // if it is an observable array we need to inform the bindTo property when the contents of the array change
        // the equality statement in the previous binding will stop this from happening automatically
        if (bindFrom.deepSubscribe && bindFrom.deepSubscribe === ko.observableArray.fn.deepSubscribe && ko.isObservable(bindToObject[bindToPropertyName])) {
            binding2 = bindFrom.deepSubscribe(function (removedVaues, addedValues) {
                if ((removedVaues && removedVaues.length) || (addedValues && addedValues.length)) {
                    bindToObject[bindToPropertyName].valueHasMutated();
                }
            });
        }

        if (binding1 || binding2)
            return {
                dispose: function () {
                    if (binding1) {
                        binding1.dispose();
                        binding1 = null;
                    }

                    if (binding2) {
                        binding2.dispose();
                        binding2 = null;
                    }
                }
            };
    };

    var bindObservables = function (viewModel, viewModelProperty, model, modelProperty) {
        // currently only 1 way supported
        KoWpf.Bindings.ViewModel.setObservable(viewModel, viewModelProperty, model[modelProperty]);

        var binding;

        // bind model to viewModel
        if (ko.isObservable(model[modelProperty])) {
            binding = KoWpf.Bindings.ViewModel.bind(model[modelProperty], viewModel, viewModelProperty);
        }

        // return dispose function
        if (binding)
            return {
                dispose: function () {
                    if (binding) {
                        binding.dispose();
                        binding = null;
                    }
                }
            };
    };

    var objectParser = {
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

    function seperateBindingString(string) {

        if (!string) return [];

        var open = 0;
        var result = [];
        for (var i = 0; i < string.length; i++) {
            if (string[i] === "," && !open) {
                result.push(string.substring(0, i));
                string = string.substring(i + 1);
                i = 0;
            } else if (string[i] === "{") {
                open++;
            } else if (string[i] === "}") {
                open--;
            }
        }

        result.push(string);
        return result;
    }

    function seperateKeyValuePair(string) {
        var i = string.indexOf(":");

        return {
            key: string.substring(0, i).replace(/^\s+|\s+$/g, ''),
            value: string.substring(i + 1).replace(/^\s+|\s+$/g, '')
        };
    }

    var createPropertyFromElement = function (xmlElement, bindingContext) {
        var $xmlElement = $(xmlElement);

        var type = $xmlElement.attr("data-propertytype");

        if (KoWpf.Bindings.ViewModel.objectParser[type.toLowerCase()]) {
            return KoWpf.Bindings.ViewModel.objectParser[type.toLowerCase()]($xmlElement.html());
        } else {
            var createObject = {
                type: new Function("with(arguments[1]) { with(arguments[0]) { return " + type + "; } }")(bindingContext.$data, bindingContext),
                properties: {}
            };

            if ($xmlElement.attr("data-propertyvalues")) {

                var props = KoWpf.Bindings.ViewModel.seperateBindingString($xmlElement.attr("data-propertyvalues") || "");
                for (var i = 0, ii = props.length; i < ii; i++) {
                    var kvp = KoWpf.Bindings.ViewModel.seperateKeyValuePair(props[i]);

                    // create function which will retun bound value
                    var accessor = new Function("with(arguments[1]) { with(arguments[0]) { return " + kvp.value + "; } }");

                    // wrap each bound value in a dependent observable, which will detect changes in chained dependent properties
                    createObject.properties[kvp.key] = (function (context1, context2, accessor) {
                        // NOTE: properties are currently read only (Bind one way)
                        return ko.isObservable(accessor(context1, context2)) ?
                                    ko.dependentObservable(function () {
                                        return accessor(context1, context2)();
                                    }) :
                                    ko.dependentObservable(function () {
                                        return accessor(context1, context2);
                                    });
                    })(bindingContext.$data, bindingContext, accessor);
                }
            }

            if (!createObject.type || !(createObject.type instanceof Function)) {
                throw "Invalid propertytype: \"" + type + "\".";
            }

            return KoWpf.Bindings.ViewModel.createViewModel(xmlElement, createObject, bindingContext);
        }
    };

    //TODO: possibly ignore knockout's parsing of binding and do it manally
    var createViewModel = function (element, viewModelBinding, bindingContext) {

        viewModelBinding = ko.utils.unwrapObservable(viewModelBinding);

        if (!viewModelBinding.type) {
            throw "Must specify a \"type\" for the view model.";
        }

        var view = new viewModelBinding.type();

        //TODO: what to do with these?
        var disposeFunctions = function (disposeOf) {
            if (disposeFunctions[disposeOf]) {
                disposeFunctions[disposeOf].dispose();
                delete disposeFunctions[disposeOf];
            }
        };

        // initial values set on each new view
        var setProperties = {
            _parent: function () {
                view._parent = bindingContext.$data;
            },
            _bindingContext: function () {
                view._bindingContext = bindingContext;
            },
            _disposeFunctions: function () {
                view._disposeFunctions = disposeFunctions;
            }
        };

        // inline properties
        if (viewModelBinding.properties) {
            for (var setter in viewModelBinding.properties) {

                if (setProperties[setter])
                    throw "Error: Attempting to set property \"" + setter + "\" more than once";

                setProperties[setter] = (function (view, setter, properties) {
                    return function () {
                        return KoWpf.Bindings.ViewModel.bindObservables(view, setter, properties, setter);
                    };
                })(view, setter, viewModelBinding.properties);
            }
        }

        // child element properties

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(element.innerText, "application/xml");


        debugger;
        var ctxt = bindingContext.createChildContext(view);
        $(ko.virtualElements.allChildren(element))
                .filter("[data-propertysetter][data-propertytype]")
                .each(function () {
                    var setter = $(this).attr("data-propertysetter");
                    if (setProperties[setter])
                        throw "Error: Attempting to set property \"" + setter + "\" more than once";

                    var _this = this;
                    setProperties[setter] = function () {
                        var property = KoWpf.Bindings.ViewModel.createPropertyFromElement(_this, ctxt);
                        KoWpf.Bindings.ViewModel.setObservable(view, setter, property);
                    };
                });

        // fallback to model of parent
        if (!setProperties["model"] && bindingContext.$data) {
            setProperties["model"] = function () {
                return KoWpf.Bindings.ViewModel.bindObservables(view, "model", bindingContext.$data, "model");
            };
        }

        // other properties will depend on these
        var priorities = ["templateId", "_parent", "_bindingContext", "_disposeFunctions", "model", "itemTemplate"];

        for (var i = 0, ii = priorities.length; i < ii; i++) {
            if (setProperties[priorities[i]]) {
                var tmp = setProperties[priorities[i]]();
                if (tmp)
                    disposeFunctions[priorities[i]] = tmp;
            }
        }

        for (var i in setProperties) {

            // already set
            if (priorities.indexOf(i) !== -1)
                continue;

            //TODO: property order?
            var tmp = setProperties[i]();
            if (tmp)
                disposeFunctions[i] = tmp;
        }

        return view;
    };

    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var view = KoWpf.Bindings.ViewModel.createViewModel(element, valueAccessor(), bindingContext);

        element._view = view;
        return ko.bindingHandlers.template.init.call(
            this,
            element,
            KoWpf.Bindings.ViewModel.newValueAccessor(view),
            allBindingsAccessor,
            viewModel,
            bindingContext);
    };

    var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        return ko.bindingHandlers.template.update.call(
            this,
            element,
            KoWpf.Bindings.ViewModel.newValueAccessor(element._view),
            allBindingsAccessor,
            viewModel,
            bindingContext);
    };

    var newValueAccessor = function (view) {
        var val = {
            name: ko.utils.unwrapObservable(view).templateId,
            data: view,
            afterRender: function () {
                return view.templateChanged(arguments[0]);
            }
        };
        return function () {
            return val;
        };
    };

    ko.virtualElements.allowedBindings.ViewModel = true;
    ko.bindingHandlers.ViewModel = {
        init: init,
        update: update
    };

    return {
        setObservable: setObservable,
        bind: bind,
        bindObservables: bindObservables,
        objectParser: objectParser,
        seperateBindingString: seperateBindingString,
        seperateKeyValuePair: seperateKeyValuePair,
        newValueAccessor: newValueAccessor,
        createViewModel: createViewModel,
        createPropertyFromElement: createPropertyFromElement,
        init: init,
        update: update
    };

})());