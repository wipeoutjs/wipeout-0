
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};
(function () {
    
    var deafaultTemplateId;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wpfko.base.contentControl.createAnonymousTemplate("<div><!-- ko itemsControl: null --><!-- /ko --></div>");
    }
    
    var itemsControl = wpfko.base.contentControl.extend(function () { 
        staticConstructor();
        this._super(deafaultTemplateId);

        this.itemTemplateId = ko.observable();
        this.itemSource = ko.observableArray([]);
        this.items = ko.observableArray([]);

        //TODO: hack, destroying and re-creating a lot of view models
        this.itemSource.subscribe(this.reDrawItems, this);

        this.itemTemplate = ko.computed({
            read: function () {
                var script = document.getElementById(this.itemTemplateId());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                this.itemTemplateId(wpfko.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: this
        });

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