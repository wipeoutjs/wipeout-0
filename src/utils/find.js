Class("wipeout.utils.find", function () {
    return wipeout.base.object.extend({
        constructor: function(bindingContext) {
            this._super();
            
            this.bindingContext = bindingContext;
        },
        find: function(searchTerm, filters) {
            var temp = {};
            
            if(filters) {
                for(var i in filters)
                    temp[i] = filters[i];
            }
            
            // destroy object ref
            filters = temp;            
            if(!filters.$index) {
                filters.$index = 0;
            }
            
            // shortcut for having constructor as search term
            if(searchTerm && searchTerm.constructor === Function) {
                filters.$type = searchTerm;
            // shortcut for having filters as search term
            } else if(searchTerm && searchTerm.constructor !== String) {
                for(var i in searchTerm)
                    filters[i] = searchTerm[i];
            } else {
                filters.$ancestry = wipeout.utils.obj.trim(searchTerm);
            }     
                      
            if(!filters.$instanceOf && filters.$i) {
                filters.$instanceOf = filters.$i;
            }
                      
            if(!filters.$ancestry && filters.$a) {
                filters.$ancestry = filters.$a;
            }
                      
            if(!filters.$type && filters.$t) {
                filters.$type = filters.$t;
            }
            
            delete filters.$i;
            delete filters.$a;
            delete filters.$t;
            
            return this._find(filters);
        },
        _find: function(filters) {  
            
            if(!this.bindingContext ||!this.bindingContext.$parentContext)
                return null;
            
            var current = this.bindingContext;            
            for (var index = filters.$index; index >= 0 && current; index--) {
                var i = 0;
                
                current = current.$parentContext;

                // continue to loop until we find a binding context which matches the search term and filters
                while(current && !wipeout.utils.find.is(current.$data, filters, i)) {
                    current = current.$parentContext;
                    i++;
                }
            }
            
            return current ? current.$data : null;
        },
        statics: {
            create: function(bindingContext) {
                var f = new wipeout.utils.find(bindingContext);
                
                return function(searchTerm, filters) {
                    return f.find(searchTerm, filters);
                };
            },
            regex: {
                ancestors: /^(great)*(grand){0,1}parent$/,
                great: /great/g,
                grand: /grand/g
            },
            $type: function(currentItem, searchTerm, index) {
                return currentItem && currentItem.constructor === searchTerm;
            },
            $ancestry: function(currentItem, searchTerm, index) {
                
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
            },
            $instanceOf: function(currentItem, searchTerm, index) {
                if(!currentItem || !searchTerm || searchTerm.constructor !== Function)
                    return false;
                
                return currentItem instanceof searchTerm;
            },
            is: function(item, filters, index) {
                for(var i in filters) {
                    if (i === "$index") continue;
                    
                    if (i[0] === "$") {
                        if(!wipeout.utils.find[i](item, filters[i], index))
                            return false;
                    } else if (filters[i] !== item[i])
                        return false;
                }
                
                return true;
            }
        }
    }, "find");
});