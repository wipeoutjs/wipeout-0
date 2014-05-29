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
                filters.$index = filters.$i || 0;
            }
            
            delete filters.$i;
            
            // shortcut for having constructor as search term
            if(searchTerm && searchTerm.constructor === Function) {
                filters.constructor = searchTerm;
            // shortcut for having filters as search term
            } else if(searchTerm && searchTerm.constructor !== String) {
                for(var i in searchTerm)
                    filters[i] = searchTerm[i];
            } else {
                filters.$searchTerm = wipeout.utils.obj.trim(searchTerm);
            }     
            
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
                while(current && (!wipeout.utils.find._find(current.$data, filters.$searchTerm, i) || !wipeout.utils.find.is(current.$data, filters))) {
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
                grand: /grand/g,
                
                instanceOf: new RegExp("^instance[oO]f:\s*.+", "g")
            },
            _find: function(currentItem, searchTerm, index) {
                if(!searchTerm || !currentItem) {
                    return currentItem;
                }
                
                if(wipeout.utils.find.regex.ancestors.test(searchTerm.toLowerCase())) {
                    return wipeout.utils.find.ancestors(currentItem, searchTerm.toLowerCase(), index);
                } else if(wipeout.utils.find.regex.instanceOf.test(searchTerm)) {                    
                    return wipeout.utils.find.instanceOf(currentItem, searchTerm, index);
                } else {
                    debugger;
                    return false;
                }
            },
            ancestors: function(currentItem, searchTerm, index) {
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
            instanceOf: function(currentItem, searchTerm, index) {
                // 11 is "instanceof:".length
                var constructor = wipeout.utils.obj.getObject(wipeout.utils.obj.trim(searchTerm.substr(11)));
                if(!currentItem || !constructor || constructor.constructor !== Function)
                    return false;
                
                return currentItem instanceof constructor;
            },
            is: function(item, filters) {
                for(var i in filters) {
                    if (i[0] === "$") continue;
                    
                    if (filters[i] !== item[i])
                        return false;
                }
                
                return true;
            }
        }
    }, "find");
});