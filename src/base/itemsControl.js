
Class("wpfko.base.itemsControl", function () {
    
    var deafaultTemplateId;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wpfko.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>");  
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
        
        this.registerDisposable(this.items.subscribe(this.syncModelsAndViewModels, this).dispose);

        var itemTemplateId = this.itemTemplateId.peek();
        this.registerDisposable(this.itemTemplateId.subscribe(function (newValue) {
            if (itemTemplateId !== newValue) {
                try {
                    this.reDrawItems();
                } finally {
                    itemTemplateId = newValue;
                }
            }
        }, this).dispose);
    }, "itemsControl");
    
    //TODO: private
    itemsControl.subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl</summary>
        var initialItemSource = this.itemSource.peek();
        this.registerDisposable(this.itemSource.subscribe(function() {
            try {
                if(this.modelsAndViewModelsAreSynched())
                    return;
                this.itemSourceChanged(ko.utils.compareArrays(initialItemSource, arguments[0] || []));
            } finally {
                initialItemSource = wpfko.utils.obj.copyArray(arguments[0] || []);
            }
        }, this).dispose);
        
        var initialItems = this.items.peek();
        this.registerDisposable(this.items.subscribe(function() {
            try {
                this.itemsChanged(ko.utils.compareArrays(initialItems, arguments[0] || []));
            } finally {
                initialItems = wpfko.utils.obj.copyArray(arguments[0] || []);
            }
        }, this).dispose);        
    };
    
    //TODO: private
    itemsControl.subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        this.registerDisposable(this.itemSource.subscribe(this.itemSourceChanged, this, "arrayChange").dispose);
        this.registerDisposable(this.items.subscribe(this.itemsChanged, this, "arrayChange").dispose);
        
    };
    
    //TODO: private
    itemsControl.prototype.syncModelsAndViewModels = function() {
        ///<summary>Ensures that the itemsSource array and items array are in sync</summary>
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
        ///<summary>Disposes of deleted items</summary>
        enumerate(changes, function(change) {
            if(change.status === wpfko.utils.ko.array.diff.deleted && change.moved == null)
                this.itemDeleted(change.value);
            else if(change.status === wpfko.utils.ko.array.diff.added && change.moved == null)
                this.itemRendered(change.value);
        }, this);
    };

    itemsControl.prototype.itemSourceChanged = function (changes) { 
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
        var renderedChild = this.__woBag.renderedChildren.indexOf(item);
        if(renderedChild !== -1)
            this.__woBag.renderedChildren.splice(renderedChild, 1);
        
        item.dispose();
    };

    // virtual
    itemsControl.prototype._createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        var item = this.createItem(model);
        item.__woBag.createdByWipeout = true;
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