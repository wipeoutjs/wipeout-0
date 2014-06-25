
Binding("wipeout", true, function () {
    
    var _wipeout = wipeout.bindings.render.extend(function(element, type, allBindingsAccessor, viewModel, bindingContext) {  

        if(!(type instanceof Function))
            throw "Invalid view type";

        this.renderedView = new type();
        if(!(this.renderedView instanceof wipeout.base.view))
            throw "Invalid view type";

        this._super(element, this.renderedView, allBindingsAccessor, bindingContext);

        if (this.renderedView.shareParentScope)
            throw "The root of an application cannot share its parents scope";

        this.renderedView.model(viewModel);                   
        this.render(this.renderedView);
        this.render = function() { throw "Cannont render this binding a second time, use the render binding instead"; };

        this.renderedView.onApplicationInitialized();
    }, "wipeout");
    
    _wipeout.prototype.dispose = function() {
        this._super();
        this.renderedView.dispose();
    };
    
    _wipeout.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary>                
        return new wipeout.bindings.wipeout(element, valueAccessor(), allBindingsAccessor, viewModel, bindingContext).bindingMeta;
    };
    
    _wipeout.utils = {
        wipeoutKey: "__wipeout"
    };
    
    return _wipeout;
});