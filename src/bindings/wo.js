// Render From Script
Binding("wo", true, function () {
    
    var wo = wipeout.bindings.render.extend(function(element, value, allBindingsAccessor, bindingContext) {
        ///<summary>Initialize the wo binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="value" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        var view = new value.type();
        this._super(element, view, allBindingsAccessor, bindingContext);
        view.__woBag.createdByWipeout = true;
        view._initialize(wipeout.template.engine.xmlCache[value.initXml], bindingContext);

        if(value.id) {
            var current = bindingContext;
            while(current.$data.shareParentScope)
                current = current.$parentContext;

            current.$data.templateItems[value.id] = view;
        }

        this.render(view);
        
        // override render binding method
        this.render = function() { throw "Cannot render this binding a second time, use the render binding instead"; };
    }, "wo");
    
    wo.prototype.dispose = function() {
        ///<summary>Diospose of this binding</summary> 
        
        this.removeFromParentTemplateItems();
        var value = this.value;
        this._super();
        value.dispose();
    };
    
    wo.prototype.removeFromParentTemplateItems = function() {
        ///<summary>Remove the rendered view from the template items of its parent</summary>
        
        if (this.parentElement && this.value.id) {
            wipeout.bindings.wo.removeFromParentTemplateItems(this.parentElement, this.value.id);
        }
    };
    
    wo.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wo binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="valueAccessor" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        return new wipeout.bindings.wo(element, valueAccessor(), allBindingsAccessor, bindingContext).bindingMeta;
    };
    
    wo.removeFromParentTemplateItems = function(parentElement, id) {
        ///<summary>Remove an item with the specified id from the template items of the closest wo.view to the parentElement which does not have shared parent scope</summary> 
        ///<param name="parentElement" type="HTMLElement" optional="false">The element to begin the search for the correct wo.view from</param>
        ///<param name="id" type="String" optional="false">The id of the element to delete</param>
        ///<returns type="Boolean">Whether a delete was performed</returns>
        
        var parent = wipeout.utils.html.getViewModel(parentElement);
        while (parent && parent.shareParentScope) {
            parent = parent.getParent();
        }

        if(parent)
            return delete parent.templateItems[id];
        
        return false;
    };
    
    return wo;
});