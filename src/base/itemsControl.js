var Quest = Quest || {};
Quest.KnockoutExtensions = Quest.KnockoutExtensions || {};

$.extend(Quest.KnockoutExtensions, (function () {
    var ItemsControl = Quest.KnockoutExtensions.ViewModel.extend(function () {
        this._super("Quest.KnockoutExtensions.ItemsControl");

        this.itemTemplateSetter = ko.observable();
        this.itemTemplateId = ko.observable();
        this.itemSource = ko.observableArray([]);
        this.items = ko.observableArray([]);

        //TODO: hack, destroying and re-creating a lot of view models
        this.itemSource.subscribe(function () {
            this.reDrawItems();
        }, this);

        // flag to stop progress of recursive code
        var itemTemplateSetter = {};

        // bind template and template id together
        this.itemTemplateSetter.subscribe(function (newValue) {
            if (newValue === itemTemplateSetter) return;
            this.itemTemplateId(Quest.KnockoutExtensions.ViewModel.createAnonymousTemplate(newValue));

            // clear value. there is no reason to have large strings like this in memory
            this.itemTemplateSetter(itemTemplateSetter);
        }, this);

        var itemTemplateId = this.itemTemplateId();
        this.itemTemplateId.subscribe(function (newValue) {
            if (itemTemplateId !== newValue) {
                try {
                    this.reDrawItems();
                } finally {
                    itemTemplateId = newValue;
                }
            }
        }, this);
    });

    ItemsControl.prototype.reDrawItems = function () {
        var models = this.itemSource();
        var values = this.items();
        values.length = models.length;
        for (var i = 0, ii = models.length; i < ii; i++) {
            values[i] = this.createFromTemplate(models[i]);
        }

        this.items.valueHasMutated();
    };

    ItemsControl.getBindings = function (element, bindingContext) {
        var bindingString;
        switch (element.nodeType) {
            case 1:
                bindingString = $(element).attr("data-bind");
                break;
            case 8:
                bindingString = element.nodeValue.replace(/^\s+|\s+$/g, '');
                if (bindingString.indexOf("ko ") !== 0)
                    throw "Invalid binding";

                bindingString = bindingString.substring(3).replace(/^\s+|\s+$/g, '');
                break;
            default:
                throw "Only elements and virtual elements (comments) are supported";
        }

        return bindingString ? ko.bindingProvider.instance.parseBindingsString(bindingString, bindingContext, element) : {};
    };

    ItemsControl.prototype.createFromTemplate = function (model) {
        var template = $($("#" + this.itemTemplateId()).html())[0];
        var viewModelBinding = Quest.KnockoutExtensions.ItemsControl.getBindings(template, this._bindingContext).ViewModel;

        // if there is no view object specified in the template, use the default instance
        if (!viewModelBinding) {
            viewModelBinding = {
                type: Quest.KnockoutExtensions.ViewModel,
                properties: {
                    templateId: this.itemTemplateId()
                }
            };
        }

        viewModelBinding.properties = viewModelBinding.properties || {};
        viewModelBinding.properties.model = viewModelBinding.properties.model || model;
        return Quest.KnockoutExtensions.Bindings.ViewModel.createViewModel(template, viewModelBinding, new ko.bindingContext(this, this._bindingContext));
    };

    return { ItemsControl: ItemsControl };
})());