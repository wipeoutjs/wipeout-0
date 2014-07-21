
Binding("wipeout", true, function () {
    
    var _wipeout = wipeout.bindings.render.extend(function wipeoutBinding(element, type, allBindingsAccessor, viewModel, bindingContext) {  
        ///<summary>Initialize the render binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="type" type="Function" optional="false">The type of the view model to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>

        if(!(type instanceof Function))
            throw "Invalid view type";

        ///<Summary type="wo.view">The view to render</Summary>
        this.renderedView = new type();
        if(!(this.renderedView instanceof wipeout.base.view))
            throw "Invalid view type";

        this._super(element, this.renderedView, allBindingsAccessor, bindingContext);

        if (this.renderedView.shareParentScope)
            throw "The root of an application cannot share its parents scope";

        this.renderedView.model(viewModel);                   
        this.render(this.renderedView);
        
        ///<Summary type="Function">The render method is overridden to prevent re-rendering</Summary>
        this.render = function() { throw "Cannont render this binding a second time, use the render binding instead"; };

        this.renderedView.onApplicationInitialized();
    });
    
    _wipeout.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary> 
        
        this._super();
        this.renderedView.dispose();
    };
    
    _wipeout.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wipeout binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="valueAccessor" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        return new wipeout.bindings.wipeout(element, valueAccessor(), allBindingsAccessor, viewModel, bindingContext).bindingMeta;
    };
    
    _wipeout.utils = {
        wipeoutKey: "__wipeout"
    };
    
    return _wipeout;
});