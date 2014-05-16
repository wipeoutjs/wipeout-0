Class("wipeout.template.asyncLoader", function () {
    
    var asyncLoader = function() {
        ///<summary>Loads remote templates and runs callbacks when the template is added to the DOM</summary>
        
        this.pending = {};
    };
    
    asyncLoader.prototype.load = function(templateId, success) {
        ///<summary>Load a template</summary>
        ///<param name="templateId" type="string" optional="false">The url for the template to load. This will also be the id when the template is loaded</param>
        ///<param name="success" type="Function" optional="true">Run when the template exists in the DOM</param>
        if (!this.pending[templateId])
            this.pending[templateId] = new loader(templateId);
            
        this.pending[templateId].add(success || function() {});
    };
    
    var loader = function(templateName) {
        this._callbacks = [];        
        this._success = null;
        
        var _this = this;
        ajax({
            type: "GET",
            url: templateName,
            success: function(result) {                
                wipeout.base.contentControl.createTemplate(templateName, result.responseText);                
                
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
        else // success is null or false
            throw "Could not locate template \"" + templateName + "\"";
    }
    
    asyncLoader.instance = new asyncLoader();
    
    return asyncLoader;
});