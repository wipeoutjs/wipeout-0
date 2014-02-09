
Binding("render", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary>
        return ko.bindingHandlers.template.init.call(this, element, wpfko.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };

    var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the render binding</summary>
        
        var child = wpfko.utils.ko.peek(wpfko.utils.ko.peek(valueAccessor()));
        if ((viewModel && !(viewModel instanceof wpfko.base.visual)) || (child && !(child instanceof wpfko.base.visual)))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";
        
        if(child && viewModel && child === viewModel)
            throw "A wo.visual cannot be a child of itself.";
        
        if (child && child._rootHtmlElement)
            throw "This visual has already been rendered. Call its unRender() function before rendering again.";
        
        var _this = this;
        var templateChanged = function() {
            ko.bindingHandlers.template.update.call(_this, element, wpfko.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, child, bindingContext);
            
            var bindings = allBindingsAccessor();
            if(bindings["wipeout-type"])
                wpfko.bindings["wipeout-type"].utils.comment(element, bindings["wipeout-type"]);
        };
        
        var previous = ko.utils.domData.get(element, wpfko.bindings.wpfko.utils.wpfkoKey); 
        if(previous instanceof wpfko.base.visual) {
            if(previous.__createdByWipeout)    
                previous.dispose();
            else    
                previous.unRender();
        }
        
        if (child) {            
            ko.utils.domData.set(element, wpfko.bindings.wpfko.utils.wpfkoKey, child);
            child._rootHtmlElement = element;
            if (viewModel)
                viewModel.renderedChildren.push(child);
            
            child.templateId.subscribe(templateChanged);
        }
        
        templateChanged();
    };
    
    var createValueAccessor = function(oldValueAccessor) {
        ///<summary>Create a value accessor for the knockout template binding.</summary>
        
        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            var child = oldValueAccessor();
            var _child = ko.utils.unwrapObservable(child);
            return {
                templateEngine: wpfko.template.engine.instance,
                name: _child ? _child.templateId.peek() : "",
                data: child || {},
                afterRender: _child ? function(nodes, context) { 
                    
                    var old = _child.nodes || [];
                    _child.nodes = nodes;
                    _child.rootHtmlChanged(old, nodes);
                } : undefined
            };
        };
    };
    
    return {
        init: init,
        update: update,
        utils: {
            createValueAccessor: createValueAccessor
        }
    };
});