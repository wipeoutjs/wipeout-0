
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};
(function () {
    
    var deafaultTemplateId;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wpfko.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>");
    }
    
    var itemsControl = wpfko.base.contentControl.extend(function () { 
        staticConstructor();
        this._super(deafaultTemplateId);

        this.itemTemplateId = ko.observable();
        this.itemSource = ko.observableArray([]);
        this.items = ko.observableArray([]);

        if(wpfko.util.ko.version()[0] < 3) {
            itemsControl.subscribeV2.call(this);
        } else {
            itemsControl.subscribeV3.call(this);
        }

        this.itemTemplate = ko.dependentObservable({
            read: function () {
                var script = document.getElementById(this.itemTemplateId());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                this.itemTemplateId(wpfko.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: this
        });

        var itemTemplateId = this.itemTemplateId.peek();
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
    
    itemsControl.subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl<summary>
        var initial = this.itemSource.peek();
        this.itemSource.subscribe(function() {
            try {
                this.itemsChanged(ko.utils.compareArrays(initial, arguments[0] || []));
            } finally {
                initial = wpfko.util.obj.copyArray(arguments[0] || []);
            }
        }, this);
        
    };
    
    itemsControl.subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl<summary>
        this.itemSource.subscribe(this.itemsChanged, this, "arrayChange");
        
    };

    itemsControl.prototype.itemsChanged = function (changes) { 
        var items = this.items();
        var del = [], add = [], move = {}, delPadIndex = 0;
        for(var i = 0, ii = changes.length; i < ii; i++) {
            if(changes[i].status === wpfko.util.ko.array.diff.retained) continue;            
            else if(changes[i].status === wpfko.util.ko.array.diff.deleted) {
                del.push((function(change) {
                    return function() {
                        var removed = items.splice(change.index + delPadIndex, 1)[0];
                        if(change.moved != null)
                            move[change.moved + "." + change.index] = removed;
                        
                        delPadIndex--;
                    };
                })(changes[i]));
            } else if(changes[i].status === wpfko.util.ko.array.diff.added) {
                add.push((function(change) {
                    return function() {
                        var added = change.moved != null ? move[change.index + "." + change.moved] : this.createItem(change.value);
                        items.splice(change.index, 0, added);
                    };
                })(changes[i]));
            } else {
                throw "Unsupported status";
            }
        }
        
        for(i = 0, ii = del.length; i < ii; i++) {
            del[i].call(this);
        }
        
        for(i = 0, ii = add.length; i < ii; i++) {
            add[i].call(this);
        }
        
        this.items.valueHasMutated();
    };

    // virtual
    itemsControl.prototype.createItem = function (model) {
        return new wpfko.base.view(this.itemTemplateId(), model);        
    }

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