// Render From Script
Binding("wo", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        
        var vals = wpfko.template.engine.scriptCache[valueAccessor()](bindingContext);
        
        if(vals.id)
            viewModel.templateItems[vals.id] = vals.vm;
        
        var init = wpfko.bindings.render.init.call(this, element, function() { return vals.vm; }, allBindingsAccessor, viewModel, bindingContext);
        wpfko.bindings.render.update.call(this, element, function() { return vals.vm; }, allBindingsAccessor, viewModel, bindingContext);
        return init;
    };
    
    return {
        init: init
    };
});