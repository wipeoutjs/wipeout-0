Class("wipeout.utils.findAndCall", function () {
    
    var findAndCall = wipeout.utils.call.extend(function call(find) {
        ///<summary>Extends find functionality to call functions with the correct context and custom arguments</summary>
        ///<param name="find" type="wo.find" optional="false">The find functionality</param>
        this._super();
        
        ///<Summary type="wo.find">The find helper</Summary>
        this.find = find;
    });
    
    findAndCall.prototype.call = function(searchTermOrFilters, filters) {
        ///<summary>Find an item given a search term and filters. Call a method with it's dot(...) method and pass in custom argument with it's arg(...) method</summary>
        ///<param name="searchTermOrFilters" type="Any" optional="false">Search term or filters to be passed to find</param>
        ///<param name="filters" type="Object" optional="true">Filters to be passed to find</param>
        ///<returns type="Object">An item to create a function with the correct context and custom arguments</returns>
        
        return this._super(this.find(searchTermOrFilters, filters));
    };
    
    findAndCall.create = function(find) {
        ///<summary>Get a function wich points directly to (new wo.call(..)).call(...)</summary>
        ///<param name="find" type="wo.find" optional="false">The find functionality</param>
        ///<returns type="Function">The call function</returns>
                
        var f = new wipeout.utils.findAndCall(find);

        return function(searchTermOrFilters, filters) {
            return f.call(searchTermOrFilters, filters);
        };
    };
    
    return findAndCall;
});