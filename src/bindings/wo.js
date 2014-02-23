// Render From Script
Binding("wo", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wo binding. The wo binding renders viewmodels. It is mostly used internally by wipeout</summary>
        
        var vals = wpfko.template.engine.scriptCache[valueAccessor()](bindingContext);
        if(vals.id) {
            var current = bindingContext;
            while(current.$data.woInvisible)
                current = current.$parentContext;
            
            current.$data.templateItems[vals.id] = vals.vm;
        }
        
        var init = wpfko.bindings.render.init.call(this, element, function() { return vals.vm; }, allBindingsAccessor, viewModel, bindingContext);
        wpfko.bindings.render.update.call(this, element, function() { return vals.vm; }, allBindingsAccessor, viewModel, bindingContext);
        return init;
    };
    
    return {
        init: init
    };
});