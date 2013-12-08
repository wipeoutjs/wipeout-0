
(function () {
    
    var i= ko.bindingHandlers.template.init;
    var u= ko.bindingHandlers.template.update;
    
    initializeView = wpfko.base.contentControl.extend(function() {
        this._super();
        
        this.template("<div id='theDiv'>If this text is still here something went wrong</div>");
    });
    
    initializeView.prototype.onInitialized = function() {
        this._super();
        this.templateItems.theDiv.innerHTML = this.item1 + " " + this.item2;
        
    };
    
    childView = wpfko.base.contentControl.extend(function() {
        this._super();
        this.value = ko.observable("initial");
    });
    
    rootView = wpfko.base.view.extend(function() {
        this._super("rootView");
        
        this.justDone = ko.observable("");
    });
    
    rootView.prototype.next = function() {
        this.current = this.current || 0;
        
        if(actions.length - 1 < this.current) {
            this.justDone("FINISHED");
            return;
        }
        
        this.justDone(actions[this.current++](this));
    };
        
    model = {
        rootTitle: ko.observable("People"),
        items: ko.observableArray([{itemId: ko.observable(22), itemName: ko.observable("John")}, {itemId: ko.observable(25), itemName: ko.observable("Barry")}]),
        deepItem: ko.observable({
            item: ko.observable({
                value: ko.observable("the value")
            })
        })
    };
    
    model.totalOfIds = ko.computed(function() { 
        var allIds = model.items();
        var total = 0;
        for(var i = 0, ii = allIds.length; i < ii; i++) {
            total += ko.utils.unwrapObservable(allIds[i].itemId);
        }
        
        return total;
    });
    
    ko.applyBindings(model);
})();

var actions = [
    function(view) {
        view.templateItems.NestedDiv.innerHTML = "this is the nested div";
        return "Added text to nested div";
    }, function(view) {
        view.model().rootTitle("Persons");
        return "Changed title";
    }, function(view) {
        view.model().items.push({itemId: ko.observable(66), itemName: ko.observable("Paddy")});
        return "Added person";
    }, function(view) {
        //TODO: doesn't work. itemsControl binding re-templates when things are moved
        view.templateItems.listTest.templateItems.theInnerItemsControl.items()[0].templateItems.stampMe.innerHTML = "stamped template";
        return "Stamp a person view template.";
    }, function(view) {
        view.model().items.reverse()
        return "Reordered people";
    }, function(view) {
        view.model().items.splice(1, 1);
        return "Removed person";
    }, function(view) {
        view.model().items()[0].itemId(55);
        return "Changed first person id, total ids should also be updated";
    }, function(view) {
        view.model().items()[0] = {itemId: ko.observable(99), itemName: ko.observable("LJBLKJB")};
        view.model().items.valueHasMutated();
        return "Changed first person.";
    }, function(view) {
        view.model().items()[0].itemId(55);
        return "Changed first person id, total ids should also be updated";
    }, function(view) {
        view.model().items()[0] = {itemId: 99, itemName: "someone else"};
        view.model().items.valueHasMutated();
        return "Changed first person, destroyed observables";
    }, function(view) {
        view.model().deepItem().item().value("value 1");
        return "Changed value 1";
    }, function(view) {
        view.model().deepItem().item({ value: "value 2" });
        return "Changed value 2";
    }, function(view) {
        view.model().deepItem({item: ko.observable({ value: ko.observable("value 3") })});
        return "Changed value 3";
    }, function(view) {
        view.model().deepItem().item().value("value 4");
        return "Changed value 4";
    }, function(view) {
        view.model({deepItem:{item:{value:"newModel"}}});
        return "Swapped out root model";
    }
];