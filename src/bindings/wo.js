// Render From Script
Binding("wo", true, function () {
        
    var init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the wo binding. The wo binding renders viewmodels. It is mostly used internally by wipeout</summary>
        
        var vals = wipeout.template.engine.scriptCache[valueAccessor()](bindingContext);
        if(vals.id) {
            var current = bindingContext;
            while(current.$data.woInvisible)
                current = current.$parentContext;
            
            current.$data.templateItems[vals.id] = vals.vm;
        }
        
        return wipeout.bindings.render.init.call(this, element, function() { return vals.vm; }, allBindingsAccessor, null, bindingContext);
    };
    
    return {
        init: init
    };
});