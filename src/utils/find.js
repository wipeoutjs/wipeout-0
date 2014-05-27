Class("wipeout.utils.find", function () {
    return wo.object.extend({
        constructor: function(bindingContext) {
            this._super();
            
            this.bindingContext = bindingContext;
        },
        find: function(searchTerm, filters) {
            if(filters != null) {
                // shortcut for having $index as filters
                if(filters.constructor === Number) {
                    filters = {$index: filters};
                // default value of $index
                } else if (!filters.$index) {
                    filters.$index = 0;
                }
            } else {
                // default value of filters
                filters = {$index: 0};
            }
            
            // shortcut for having constructor as search term
            if(searchTerm && searchTerm.constructor === Function) {
                filters.constructor = searchTerm;
                searchTerm = null;
            // shortcut for having filters as search term
            } else if(searchTerm && searchTerm.constructor !== String) {
                for(var i in searchTerm)
                    filters[i] = searchTerm[i];
                
                searchTerm = null;
            } else {
                searchTerm = wipeout.utils.obj.trimToLower(searchTerm);
            }     
            
            return this._find(searchTerm, filters);
        },
        _find: function(searchTerm, filters) {            
            
            var current = this.bindingContext;
            
            for (var index = filters.$index; index >= 0; index--) {
                // continue to loop until we find a binding context which matches the search term and filters
                while(current && current = wipeout.utils.find._find(current, searchTerm) && !wipeout.utils.find.is(current.$data, filters));
            }
            
            return current ? current.$data : null;
        },
        statics: {
            create: function(bindingContext) {
                var f = new wipeout.utils.find(bindingContext);
                
                return {
                    $find: function() {
                        return f.find.apply(f, arguments);
                    }
                }
            },
            regex: {
                ancestors: /^(great)*(grand){0,1}parent$/g,
                great: /great/g,
                grand: /grand/g,
                parent: /parent/g,
                
                instanceOf: /^instanceof\:/g
            },
            _find: function(currentBindingContext, searchTerm) {
                if(!searchTerm) {
                    return currentBindingContext;
                }
                
                if(wipeout.utils.find.regex.ancestors.test(searchTerm)) {                    
                    return wipeout.utils.find.ancestors(currentBindingContext, searchTerm);
                } else if(wipeout.utils.find.regex.instanceOf.test(searchTerm)) {                    
                    return wipeout.utils.find.instanceOf(currentBindingContext, searchTerm);
                } else {
                    return null;
                }
            },
            ancestors: function(currentBindingContext, searchTerm) {
                // invalid search term
                if(searchTerm.indexOf("greatparent") !== -1) return null;

                var goBack = 
                    searchTerm.match(wipeout.utils.find.regex.great) +
                    searchTerm.match(wipeout.utils.find.regex.grand) +
                    searchTerm.match(wipeout.utils.find.regex.parent);

                for (; currentBindingContext && goBack > 0; goBack--)
                    currentBindingContext = currentBindingContext.$parentContext;

                return currentBindingContext;
            },
            instanceOf: function(currentBindingContext, searchTerm) {
                                
                // 11 is "instanceof:".length
                var constructor = wipeout.utils.obj.getObject(wipeout.utils.obj.trim(searchTerm.substr(11)));
                if(!constructor || constructor.constructor !== Function)
                    return null;
                
                while (currentBindingContext) {
                    currentBindingContext = currentBindingContext.$parentContext;
                    if(currentBindingContext && currentBindingContext.$data instanceof constructor)
                        break;
                }
                
                return currentBindingContext;
            },
            is: function(item, filters) {
                for(var i in filters) {
                    if (i === "$index") continue;
                    
                    if (filters[i] !== item[i])
                        return false;
                }
                
                return true;
            }
        }
    }, "find");
});