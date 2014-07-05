
Class("wipeout.base.disposable", function () {
    
    var disposable = wipeout.base.object.extend(function (disposeFunction) {
        ///<summary>An object which will dispose of something</summary>   
        ///<param name="disposeFunction" type="Function" optional="false">A dispose function</param>
        this._super();
        
        ///<summary type="Function">The function to call when disposing</summary>
        this.disposeFunction = disposeFunction || function() {};
    }, "disposable");
    
    disposable.prototype.dispose = function() {
        ///<summary>Dispose</summary>           
        
        if(this.disposeFunction)
            this.disposeFunction();
        
        delete this.disposeFunction;
    };
                                      
    return disposable;
});