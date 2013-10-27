
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};
(function () {
    
    var itemsControl = wpfko.base.view.extend(function () {   
        this._super("wpfko.base.itemsControl");

        this.itemTemplateSetter = ko.observable();
        this.itemTemplateId = ko.observable();
        this.itemSource = ko.observableArray([]);
        this.items = ko.observableArray([]);

        //TODO: hack, destroying and re-creating a lot of view models
        this.itemSource.subscribe(this.reDrawItems, this);

        // flag to stop progress of recursive code
        var itemTemplateSetter = {};

        // bind template and template id together
        this.itemTemplateSetter.subscribe(function (newValue) {
            if (newValue === itemTemplateSetter) return;
            this.itemTemplateId(wpfko.base.contentControl.createAnonymousTemplate(newValue));

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

    itemsControl.prototype.reDrawItems = function () {
        var models = this.itemSource() || [];
        var values = this.items();
        values.length = models.length;
        for (var i = 0, ii = models.length; i < ii; i++) {
            values[i] = new wpfko.base.view(this.itemTemplateId(), models[i]);
        }

        this.items.valueHasMutated();
    };

    wpfko.base.itemsControl = itemsControl;
})();