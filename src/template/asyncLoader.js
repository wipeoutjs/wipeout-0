Class("wipeout.template.asyncLoader", function () {
    
    var asyncLoader = function() {
        this.pending = {};
    };
    
    asyncLoader.prototype.load = function(templateId, success) {
        if (!this.pending[templateId])
            this.pending[templateId] = new loader(templateId);
            
        this.pending[templateId].add(success);
    };
    
    var loader = function(templateName) {
        this._callbacks = [];        
        this._success = null;
        
        var _this = this;
        ajax({
            type: "GET",
            url: templateName,
            success: function(result) {
                _this.success = true;
                var callbacks = _this._callbacks;
                delete _this._callbacks;
                for(var i = 0, ii = callbacks.length; i < ii; i++) {
                    callbacks[i]();
                }
            },
            error: function() {
                delete _this._callbacks;
                _this.success = false;
                throw "Could not locate template \"" + templateName + "\"";
            }
        })
    }
    
    loader.prototype.add = function(success) {
        if(this.callbacks)
            this.callbacks.push(success);
        else if(this.success)
            success();
        else
            throw "Could not locate template \"" + templateName + "\"";
    }
    
    asyncLoader.instance = new asyncLoader();
    
    return asyncLoader;
});