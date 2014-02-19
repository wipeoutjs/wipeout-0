
Class("wpfko.base.itemsControl", function () {
    
    var deafaultTemplateId;
    var itemsTemplate;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wpfko.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>");        
        var tmp = "<!-- ko ic-render: $data";
        if(DEBUG) 
            tmp += ", wipeout-type: 'items[' + wpfko.util.ko.peek($index) + ']'";

        tmp += " --><!-- /ko -->";
        
        itemsTemplate = tmp;
    };
    
    var itemsControl = wpfko.base.contentControl.extend(function (templateId, itemTemplateId) {
        ///<summary>Bind a list of models (itemSource) to a list of view models (items) and render accordingly</summary>
        
        staticConstructor();
        this._super(templateId || deafaultTemplateId);

        //The id of the template to render for each item
        this.itemTemplateId = ko.observable(itemTemplateId);

        //The template which corresponds to the itemTemplateId for this object
        this.itemTemplate = wpfko.base.contentControl.createTemplatePropertyFor(this.itemTemplateId, this);
        
        //An array of models to render
        this.itemSource = ko.observableArray([]);
        
        //An array of viewmodels, each corresponding to a mode in the itemSource property
        this.items = ko.observableArray([]);

        if(wpfko.utils.ko.version()[0] < 3) {
            itemsControl.subscribeV2.call(this);
        } else {
            itemsControl.subscribeV3.call(this);
        }
        
        //Each itemsSource requires a unique anonymous template of type: <!-- ko ic-render: $data" -->
        this.__itemsTemplate = wpfko.base.contentControl.createAnonymousTemplate(itemsTemplate, true);
        
        this.items.subscribe(this.syncModelsAndViewModels, this);

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
    }, "itemsControl");
    
    //TODO: private
    itemsControl.subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl</summary>
        var initial = this.itemSource.peek();
        this.itemSource.subscribe(function() {
            try {
                if(this.modelsAndViewModelsAreSynched())
                    return;
                this.itemsChanged(ko.utils.compareArrays(initial, arguments[0] || []));
            } finally {
                initial = wpfko.utils.obj.copyArray(arguments[0] || []);
            }
        }, this);
        
    };
    
    //TODO: private
    itemsControl.subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        this.itemSource.subscribe(this.itemsChanged, this, "arrayChange");
        
    };
    
    //TODO: private
    itemsControl.prototype.syncModelsAndViewModels = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        var changed = false, modelNull = false;
        var models = this.itemSource();
        if(models ==  null) {
            modelNull = true;
            models = [];
        }
        
        var viewModels = this.items();
        
        if(models.length !== viewModels.length) {
            changed = true;
            models.length = viewModels.length;
        }
        
        for(var i = 0, ii = viewModels.length; i < ii; i++) {
            if(viewModels[i].model() !== models[i]) {
                models[i] = viewModels[i].model();
                changed = true;
            }
        }
        
        if(changed) {
            if(modelNull)
                this.itemSource(models);
            else
                this.itemSource.valueHasMutated();
        }
    };
    
    itemsControl.prototype.dispose = function() {
        ///<summary>Dispose of this itemsControl</summary>
        this._super();
        
        wpfko.base.contentControl.deleteAnonymousTemplate(this.__itemsTemplate);
    };

    //TODO: private
    itemsControl.prototype.modelsAndViewModelsAreSynched = function() {
        ///<summary>Returns whether all models have a corresponding view model at the correct index</summary>
        var model = this.itemSource() || [];
        var viewModel = this.items() || [];
        
        if(model.length !== viewModel.length)
            return false;
        
        for(var i = 0, ii = model.length; i < ii; i++) {
            if(model[i] !== viewModel[i].model())
                return false;
        }
        
        return true;
    };

    itemsControl.prototype.itemsChanged = function (changes) { 
        ///<summary>Adds, removes and moves view models depending on changes to the models array</summary>
        var items = this.items();
        var del = [], add = [], move = {}, delPadIndex = 0;
        for(var i = 0, ii = changes.length; i < ii; i++) {
            if(changes[i].status === wpfko.utils.ko.array.diff.retained) continue;            
            else if(changes[i].status === wpfko.utils.ko.array.diff.deleted) {
                del.push((function(change) {
                    return function() {
                        var removed = items.splice(change.index + delPadIndex, 1)[0];
                        if(change.moved != null)
                            move[change.moved + "." + change.index] = removed;
                        else
                            this.itemDeleted(removed);
                        
                        delPadIndex--;
                    };
                })(changes[i]));
            } else if(changes[i].status === wpfko.utils.ko.array.diff.added) {
                add.push((function(change) {
                    return function() {
                        var added = change.moved != null ? move[change.index + "." + change.moved] : this._createItem(change.value);
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
    
    //virtual
    itemsControl.prototype.itemRendered = function (item) {
        ///<summary>Called after a new item items control is rendered</summary>
    };
    
    //virtual
    itemsControl.prototype.itemDeleted = function (item) {
        ///<summary>Disposes of deleted items</summary>        
        var renderedChild = this.renderedChildren.indexOf(item);
        if(renderedChild !== -1)
            this.renderedChildren.splice(renderedChild, 1);
        
        item.dispose();
    };

    // virtual
    itemsControl.prototype._createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        var item = this.createItem(model);
        item.__createdByWipeout = true;
        return item;
    };

    // virtual
    itemsControl.prototype.createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        return new wpfko.base.view(this.itemTemplateId(), model);        
    };

    itemsControl.prototype.reDrawItems = function () {
        ///<summary>Destroys and re-draws all view models</summary>
        var models = this.itemSource() || [];
        var values = this.items();
        values.length = models.length;
        for (var i = 0, ii = models.length; i < ii; i++) {
            values[i] = this._createItem(models[i]);
        }

        this.items.valueHasMutated();
    };

    return itemsControl;
});