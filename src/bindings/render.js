
Binding("render", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary>
        return ko.bindingHandlers.template.init.call(this, element, wipeout.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, viewModel, bindingContext);
    };

    var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Update the render binding</summary>
        
        var child = wipeout.utils.ko.peek(wipeout.utils.ko.peek(valueAccessor()));
        if ((viewModel && !(viewModel instanceof wipeout.base.visual)) || (child && !(child instanceof wipeout.base.visual)))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";
        
        if(child && viewModel && child === viewModel)
            throw "A wo.visual cannot be a child of itself.";
        
        if (child && child.__woBag.rootHtmlElement)
            throw "This visual has already been rendered. Call its unRender() function before rendering again.";
        
        var _this = this;
        var templateChanged = function(newVal) {
            function reRender() {
                ko.bindingHandlers.template.update.call(_this, element, wipeout.bindings.render.utils.createValueAccessor(valueAccessor), allBindingsAccessor, child, bindingContext);

                var bindings = allBindingsAccessor();
                if(bindings["wipeout-type"])
                    wipeout.bindings["wipeout-type"].utils.comment(element, bindings["wipeout-type"]);
            }
            
            if(child)
                child.unTemplate();                
            
            if(wipeout.base.contentControl.templateExists(newVal) || !newVal) {
                reRender();
            } else {
                // 
                ko.virtualElements.prepend(element, wipeout.utils.html.createElement("<div>" + wipeout.template.engine.templateLoadingPlaceholder + "</div>"))
                wipeout.template.asyncLoader.instance.load(newVal, reRender);
            }            
        };
        
        // if the root html element is already bound to another view model, kill it
        var previous = ko.utils.domData.get(element, wipeout.bindings.wipeout.utils.wipeoutKey); 
        if(previous instanceof wipeout.base.visual) {
            if(previous.__woBag.createdByWipeout)    
                previous.dispose();
            else    
                previous.unRender();
        }
        
        var templateId = null;
        if (child) {            
            ko.utils.domData.set(element, wipeout.bindings.wipeout.utils.wipeoutKey, child);
            child.__woBag.rootHtmlElement = element;
            if (viewModel)
                viewModel.__woBag.renderedChildren.push(child);
            
            child.templateId.subscribe(templateChanged);
            templateId = child.templateId.peek();
        }
        
        templateChanged(templateId);
    };
    
    var createValueAccessor = function(oldValueAccessor) {
        ///<summary>Create a value accessor for the knockout template binding.</summary>
        
        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            var child = oldValueAccessor();
            var _child = ko.utils.unwrapObservable(child);
            
            var output = {
                templateEngine: wipeout.template.engine.instance,
                name: _child ? _child.templateId.peek() : "",                
                afterRender: _child ? function(nodes, context) { 
                    
                    var old = _child.nodes || [];
                    _child.nodes = nodes;
                    _child.onRendered(old, nodes);
                } : undefined
            };
            
            if(child && !child.woInvisible)
                output.data = child || {};
                
            return output;
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