var Quest = Quest || {};
Quest.KnockoutExtensions = Quest.KnockoutExtensions || {};

$.extend(Quest.KnockoutExtensions, (function () {

    var ViewModel = Quest.KnockoutExtensions.Object.extend(function (templateId) {

        this._super();

        this.templateId = ko.observable(templateId || ViewModel.getDefaultTemplateId());

        // setter only, getting value will always return a meaningless object
        // will create a template and assign it's id to templateId
        this.setTemplate = ko.observable();
        this.model = ko.observable();
        this._rootHtml = ko.observable();

        var model = null;
        this.model.subscribe(function (newValue) {
            try {
                this.modelChanged(model, newValue);
            } finally {
                model = newValue;
            }
        }, this);

        var _rootHtml = null;
        this._rootHtml.subscribe(function (newValue) {
            try {
                this.rootHtmlChanged(_rootHtml, newValue);
            } finally {
                _rootHtml = newValue;
            }
        }, this);

        // flag to stop progress of recursive code
        var setTemplate = {};

        // bind template and template id together
        this.setTemplate.subscribe(function (newValue) {
            if (newValue === setTemplate) return;

            this.templateId(Quest.KnockoutExtensions.ViewModel.createAnonymousTemplate(newValue));

            // clear value. there is no reason to have large strings like this in memory
            this.setTemplate(setTemplate);
        }, this);
    });

    ViewModel.getDefaultTemplateId = (function () {
        var templateId = null;
        return function () {
            if (!templateId) {
                templateId = ViewModel.createAnonymousTemplate("<span>No template has been specified</span>");
            }

            return templateId;
        };
    })();
    
    //############ IMPORTANT: This method is sealed, overriding it will cause ViewModel binding and template binding to behave erratically
    //############ override rootHtmlChanged(...) instead
    ViewModel.prototype.templateChanged = function (newElements) {
        ///<summary>Notify the view model of html change</summary>
        if (newElements[0]) {
            // if ko virtual element
            if (newElements[0].previousSibling && newElements[0].previousSibling.nodeType === 8
        && newElements[0].previousSibling.data.replace(/^\s+|\s+$/g, '').indexOf("ko ") === 0)
                this._rootHtml(newElements[0].previousSibling);
            else
                this._rootHtml(newElements[0].parentElement);
        } else {
            this._rootHtml(null);
        }
    };

    ViewModel.prototype.$ = function (jquerySelector) {
        var children = ko.virtualElements.allChildren(this._rootHtml());
        if (!children.length) {
            return $();
        }

        // select from the root of the template and filter out results which
        // are not part of this element
        return $(jquerySelector, children[0].parentElement).filter(function () {
            var ancestorTree = $(this).add($(this).parents());
            for (var i = 0, ii = ancestorTree.length; i < ii; i++) {
                if (children.indexOf(ancestorTree[i]) !== -1)
                    return true;
            }

            return false;
        });
    };

    ViewModel.createAnonymousTemplate = (function () {
        var $templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);

        return function (templateString) {

            // lazy create div to place anonymous templates
            if (!$templateArea) {
                $templateArea = $("<div style='display: none'></div>");
                $("body").append($templateArea[0]);
            }

            templateString = templateString.replace(/^\s+|\s+$/g, '');
            var hash = Quest.KnockoutExtensions.ViewModel.hashCode(templateString).toString();

            var children = $templateArea.children();

            // if we can, reuse an existing anonymous template
            for (var j = 0, jj = children.length; j < jj; j++) {
                if (children[j].nodeName === "SCRIPT" &&
                children[j].id &&
                // first use a hash to avoid computationally expensive string compare if possible
                children[j].attributes["data-templatehash"] &&
                children[j].attributes["data-templatehash"].nodeValue === hash &&
                children[j].innerHTML === templateString) {
                    return children[j].id;
                }
            }

            var id = "AnonymousTemplate" + (++i);
            $templateArea.append('<script type="text/html" id="' + id + '" data-templatehash="' + hash + '">' + templateString + '</script>');
            return id;
        };
    })();

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    ViewModel.hashCode = function (str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0, ii = str.length; i < ii; i++) {
            char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    // virtual
    ViewModel.prototype.rootHtmlChanged = function (oldValue, newValue) {
    };

    // virtual
    ViewModel.prototype.modelChanged = function (oldValue, newValue) {
    };























    var htmlTags = ["a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio", "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset", "head", "header", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", "noframes", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"];
    //TODO: need to look at more documentation here
    if (!XMLSerializer) {
        XMLSerializer = function () { }
        XMLSerializer.prototype.serializeToString = function (xmlNode) { return xmlNode.xml; }
    }

    ViewModel.prototype.render = function () { };

    var ser = new XMLSerializer();
    ViewModel.fromXmlElement = function (xmlElement, bindingContext) {
        if (htmlTags.indexOf(xmlElement.nodeName.toLowerCase()) !== -1) {
            return {
                render: function () {
                    return $(ser.serializeToString(xmlElement))[0];
                }
            };
        }

        var itemType = xmlElement.nodeName.split(".");

        var current = window;
        for (var i = 0, ii = itemType.length; i < ii; i++) {
            current = current[itemType[i]];
            if (!current)
                throw "Can not find constructor for \"" + xmlElement.nodeName + "\"";
        }

        if (!(current instanceof Function))
            throw xmlElement.nodeName + " is not a constructor.";

        var view = new current();

        if (view.render !== ViewModel.prototype.render)
            throw xmlElement.nodeName + " does not have a valid render method. The valid method is ViewModel.prototype.render";

        bindingContext = bindingContext.createChildContext(view);

        var properties = {};
        for (var i = 0, ii = xmlElement.attributes.length; i < ii; i++) {

            // create function which will retun bound value
            var accessor = new Function("with(arguments[1]) { with(arguments[0]) { return " + xmlElement.attributes[i].value + "; } }");

            // wrap each bound value in a dependent observable, which will detect changes in chained dependent properties
            properties[xmlElement.attributes[i].nodeName] = (function (context1, context2, accessor) {
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

        debugger;
        for (var i = 0, ii = xmlElement.children.length; i < ii; i++) {
            var child = xmlElement.children[i];
            var type = ((child.attributes["type"] || { value: "string" }).value || "").toLowerCase();
            if (objectParser[type]) {
                var innerHTML = [];
                var ser = new XMLSerializer();
                for (var j = 0, jj = child.childNodes.length; j < jj; j++) {
                    innerHTML.push(ser.serializeToString(child.childNodes[j]));
                }

                properties[child.nodeName] = objectParser[type](innerHTML.join(""));
            } else {
                // create new element where tag name is type attribute
                // copy all attributes and childNodes
                debugger;
                var newElement = new Element(type);

                properties[child.nodeName] = createFromElement(newElement, bindingContext);
            }
        }
        return view;
    };

    var create = function (xmlElement, bindingContext) {

        switch (xmlElement.nodeType) {
            case 1:
                if (htmlTags.indexOf(xmlElement.nodeName.toLowerCase()) !== -1) {
                    return $(xmlElement.innerHTML)[0];
                }

                return createFromElement(xmlElement, bindingContext);
            case 3:
                return xmlElement.innerHTML;
        }
    }

























    return {
        ViewModel: ViewModel
    };
} ()));
