Class("wipeout.utils.find", function () {
    
    var find = wipeout.base.object.extend(function(bindingContext) {
        ///<summary>Find an ancestor from the binding context</summary>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The ancestor chain</param>
        this._super();

        this.bindingContext = bindingContext;
    }, "find");
    
    find.prototype.find = function(searchTermOrFilters, filters) {
        ///<summary>Find an ancestor item based on the search term and filters</summary>
        ///<param name="searchTermOrFilters" type="Any" optional="false">If an object, will be used as extra filters. If a function, will be used as an $instanceof filter. If a String will be used as an &ancestory filter</param>
        ///<param name="filters" type="Object" optional="false">Items to filter the output by</param>
        ///<returns type="Any">The search result</returns>
        
        var temp = {};

        if(filters) {
            for(var i in filters)
                temp[i] = filters[i];
        }

        // destroy object ref
        filters = temp;            
        if(!filters.$number) {
            filters.$number = 0;
        }

        // shortcut for having constructor as search term
        if(searchTermOrFilters && searchTermOrFilters.constructor === Function) {
            filters.$instanceOf = searchTermOrFilters;
        // shortcut for having filters as search term
        } else if(searchTermOrFilters && searchTermOrFilters.constructor !== String) {
            for(var i in searchTermOrFilters)
                filters[i] = searchTermOrFilters[i];
        } else {
            filters.$ancestry = wipeout.utils.obj.trim(searchTermOrFilters);
        }     

        if(!filters.$number && filters.$n) {
            filters.$number = filters.$n;
        }     

        if(!filters.$instanceOf && filters.$i) {
            filters.$instanceOf = filters.$i;
        }    

        if(!filters.$instanceOf && filters.$instanceof) {
            filters.$instanceOf = filters.$instanceof;
        }

        if(!filters.$ancestry && filters.$a) {
            filters.$ancestry = filters.$a;
        }

        if(!filters.$type && filters.$t) {
            filters.$type = filters.$t;
        }
        
        var getModel = filters.$m || filters.$model;

        delete filters.$m;
        delete filters.$model;
        delete filters.$n;
        delete filters.$instanceof;
        delete filters.$i;
        delete filters.$a;
        delete filters.$t;

        return this._find(filters, getModel);
    };
    
    find.prototype._find = function(filters, getModel) {  
        ///<summary>Find an ancestor item based on the filters and whether view models or models are to be returned</summary>
        ///<param name="filters" type="Object" optional="false">Items to filter the output by</param>
        ///<param name="getModel" type="Boolean" optional="true">Specify that models are to be searched</param>
        ///<returns type="Any">The search result</returns>
            
        if(!this.bindingContext ||!this.bindingContext.$parentContext)
            return null;
        
        var getItem = getModel ? 
            function(item) {
                return item && item.$data instanceof wo.view ? item.$data.model() : null;
            } : 
            function(item) { 
                return item ? item.$data : null;
            };

        var currentItem, currentContext = this.bindingContext;
        for (var index = filters.$number; index >= 0 && currentContext; index--) {
            var i = 0;

            currentContext = currentContext.$parentContext;

            // continue to loop until we find a binding context which matches the search term and filters
            while(!wipeout.utils.find.is(currentItem = getItem(currentContext), filters, i) && currentContext) {
                currentContext = currentContext.$parentContext;
                i++;
            }
        }

        return currentItem;
    };
    
    find.create = function(bindingContext) {
        ///<summary>Get a function wich points directly to (new wo.find(..)).find(...)</summary>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The find functionality</param>
        ///<returns type="Function">The find function</returns>
        
        var f = new wipeout.utils.find(bindingContext);

        return function(searchTerm, filters) {
            return f.find(searchTerm, filters);
        };
    };
    
    // regular expressions used by the find class
    find.regex = {
        ancestors: /^(great)*(grand){0,1}parent$/,
        great: /great/g,
        grand: /grand/g
    };
    
    find.$type = function(currentItem, searchTerm, index) {
        ///<summary>Find an item based on exact type matching</summary>
        ///<param name="currentItem" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="searchTerm" type="Function" optional="false">The value of $type in the search filter</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
        
        return currentItem && currentItem.constructor === searchTerm;
    };
    
    find.$ancestry = function(currentItem, searchTerm, index) {
        ///<summary>Find an item based on its ancestory. (Parent, grandparent, etc...)</summary>
        ///<param name="currentItem" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="searchTerm" type="String" optional="false">The value of $ancestry in the search filter</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
                
        searchTerm = (searchTerm || "").toLowerCase();

        // invalid search term which passes regex
        if(searchTerm.indexOf("greatparent") !== -1) return false;

        var total = 0;
        var g = searchTerm.match(wipeout.utils.find.regex.great);
        if(g)
            total += g.length;
        g = searchTerm.match(wipeout.utils.find.regex.grand);
        if(g)
            total += g.length;

        return total === index;
    };
    
    find.$instanceOf = function(currentItem, searchTerm, index) {
        ///<summary>Find an item based on instanceof type matching</summary>
        ///<param name="currentItem" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="searchTerm" type="Function" optional="false">The value of $instanceof in the search filter</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
        
        if(!currentItem || !searchTerm || searchTerm.constructor !== Function)
            return false;

        return currentItem instanceof searchTerm;
    };
    
    find.is = function(item, filters, index) {
        ///<summary>Find an item based on the given filters</summary>
        ///<param name="item" type="Any" optional="false">The item to decide whether it is a match or not</param>
        ///<param name="filters" type="Object" optional="false">The filters</param>
        ///<param name="index" type="Number" optional="false">The current search index. This is incremented by 1 each time the ancestoral tree is traversed</param>
        ///<returns type="Boolean">Whether the current item is a match or not</returns>
        
        if (!item)
            return false;
        
        for (var i in filters) {
            if (i === "$number") continue;

            if (i[0] === "$") {
                if(!wipeout.utils.find[i](item, filters[i], index))
                    return false;
            } else if (filters[i] !== item[i]) {
                return false;
            }
        }

        return true;
    };
    
    return find;
});