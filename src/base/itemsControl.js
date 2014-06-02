
Class("wipeout.base.itemsControl", function () {
    
    var deafaultTemplateId;
    var staticConstructor = function() {
        if(deafaultTemplateId) return;
        
        deafaultTemplateId = wipeout.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>");  
    };
    
    var itemsControl = wipeout.base.contentControl.extend(function (templateId, itemTemplateId, model) {
        ///<summary>Bind a list of models (itemSource) to a list of view models (items) and render accordingly</summary>
        ///<param name="templateId" type="String" optional="true">The template id. If not set, defaults to a div to render items</param>
        ///<param name="itemTemplateId" type="String" optional="true">The initial template id for each item</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        
        staticConstructor();
        this._super(templateId || deafaultTemplateId, model);

        //The id of the template to render for each item
        this.itemTemplateId = ko.observable(itemTemplateId);

        //The template which corresponds to the itemTemplateId for this object
        this.itemTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.itemTemplateId, this);
        
        //An array of models to render
        this.itemSource = ko.observableArray([]);
        
        //An array of viewmodels, each corresponding to a mode in the itemSource property
        this.items = ko.observableArray([]);

        if(wipeout.utils.ko.version()[0] < 3) {
            itemsControl.subscribeV2.call(this);
        } else {
            itemsControl.subscribeV3.call(this);
        }
        
        var d1 = this.items.subscribe(this.syncModelsAndViewModels, this);
        this.registerDisposable(function() { d1.dispose(); });

        itemTemplateId = this.itemTemplateId.peek();
        var d2 = this.itemTemplateId.subscribe(function (newValue) {
            if (itemTemplateId !== newValue) {
                try {
                    this.reDrawItems();
                } finally {
                    itemTemplateId = newValue;
                }
            }
        }, this);
        this.registerDisposable(function() { d2.dispose(); });
    }, "itemsControl");
    
    //TODO: private
    itemsControl.subscribeV2 = function() {
        ///<summary>Bind items to itemSource for knockout v2. Context must be an itemsControl</summary>
        var initialItemSource = this.itemSource.peek();
        
        var d1 = this.itemSource.subscribe(function() {
            try {
                if(this.modelsAndViewModelsAreSynched())
                    return;
                this._itemSourceChanged(ko.utils.compareArrays(initialItemSource, arguments[0] || []));
            } finally {
                initialItemSource = wipeout.utils.obj.copyArray(arguments[0] || []);
            }
        }, this);
        this.registerDisposable(function() { d1.dispose(); });
        
        var initialItems = this.items.peek();
        var d2 = this.items.subscribe(function() {
            try {
                this._itemsChanged(ko.utils.compareArrays(initialItems, arguments[0] || []));
            } finally {
                initialItems = wipeout.utils.obj.copyArray(arguments[0] || []);
            }
        }, this);
        this.registerDisposable(function() { d2.dispose() });
    };
    
    //TODO: private
    itemsControl.subscribeV3 = function() {
        ///<summary>Bind items to itemSource for knockout v3. Context must be an itemsControl</summary>
        var d1 = this.itemSource.subscribe(this._itemSourceChanged, this, "arrayChange");
        this.registerDisposable(function() { d1.dispose(); });
        
        var d2 = this.items.subscribe(this._itemsChanged, this, "arrayChange");
        this.registerDisposable(function() { d2.dispose(); });
        
    };
    
    itemsControl.prototype.initialize = function(propertiesXml, parentBindingContext) {
        ///<summary>Takes an xml fragment and binding context and sets its properties accordingly</summary>
        ///<param name="propertiesXml" type="Element" optional="false">An XML element containing property setters for the view</param>
        ///<param name="parentBindingContext" type="ko.bindingContext" optional="false">The binding context of the wipeout node just above this one</param>
    
        if(propertiesXml) {        
            var prop = propertiesXml.getAttribute("shareParentScope");
            if(prop && parseBool(prop))
                throw "A wo.itemsControl cannot share it's parents scope.";
        }
        
        this._super(propertiesXml, parentBindingContext);
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
        ///<returns type="Boolean"></summary>
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

    itemsControl.prototype._itemsChanged = function (changes) { 
        ///<summary>Runs onItemDeleted and onItemRendered on deleted and created items respectively</summary>
        ///<param name="changes" type="Array" generic0="wo.view" optional="false">A knockout diff of changes to the items</param>
        
        enumerate(changes, function(change) {
            if(change.status === wipeout.utils.ko.array.diff.deleted && change.moved == null)
                this.onItemDeleted(change.value);
            else if(change.status === wipeout.utils.ko.array.diff.added && change.moved == null)
                this.onItemRendered(change.value);
        }, this);
    };

    itemsControl.prototype._itemSourceChanged = function (changes) { 
        ///<summary>Adds, removes and moves view models depending on changes to the models array</summary>
        ///<param name="changes" type="Array" optional="false">A knockout diff of changes to the itemSource</param>
        var items = this.items();
        var del = [], add = [], move = {}, delPadIndex = 0;
        for(var i = 0, ii = changes.length; i < ii; i++) {
            if(changes[i].status === wipeout.utils.ko.array.diff.retained) continue;            
            else if(changes[i].status === wipeout.utils.ko.array.diff.deleted) {
                del.push((function(change) {
                    return function() {
                        var removed = items.splice(change.index + delPadIndex, 1)[0];
                        if(change.moved != null)
                            move[change.moved + "." + change.index] = removed;
                        
                        delPadIndex--;
                    };
                })(changes[i]));
            } else if(changes[i].status === wipeout.utils.ko.array.diff.added) {
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
    itemsControl.prototype.onItemRendered = function (item) {
        ///<summary>Called after a new item items control is rendered</summary>
        ///<param name="item" type="wo.view" optional="false">The item rendered</param>
    };
    
    itemsControl.prototype.dispose = function () {
        ///<summary>Dispose of the items control and its items</summary>
        enumerate(this.items(), function(i) {
            i.dispose();
        });
        
        this._super();
    };    
    
    //virtual
    itemsControl.prototype.onItemDeleted = function (item) {
        ///<summary>Disposes of deleted items</summary> 
        ///<param name="item" type="wo.view" optional="false">The item deleted</param>  
        
        item.dispose();
    };

    // virtual
    itemsControl.prototype._createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        ///<param name="model" type="Any" optional="false">The model for the view to create</param>
        ///<returns type="wo.view">The newly created item</returns>
        
        var item = this.createItem(model);
        item.__woBag.createdByWipeout = true;
        return item;
    };

    // virtual
    itemsControl.prototype.createItem = function (model) {
        ///<summary>Defines how a view model should be created given a model. The default is to create a view and give it the itemTemplateId</summary>
        ///<param name="model" type="Any" optional="false">The model for the view to create</param>
        ///<returns type="wo.view">The newly created item</returns>
        return new wipeout.base.view(this.itemTemplateId(), model);        
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