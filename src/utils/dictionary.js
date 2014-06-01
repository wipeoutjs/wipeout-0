/* Not currently used
Class("wipeout.utils.dictionary", function () {
    var dictionary = function() {
        this._items = {
            keys: [],
            values: []
        };
    };
    
    dictionary.prototype.add = function(key, value) {
        var existing = this._items.keys.indexOf(key);
        
        if (existing === -1) {
            this._items.keys.push(key);
            this._items.values.push(value);
        } else {
            this._items.values[existing] = value;
        }
    };
    
    dictionary.prototype.remove = function(key) {
        var existing = this._items.keys.indexOf(key);
        
        if(existing !== -1) {
            this._items.keys.splice(existing, 1);
            this._items.values.splice(existing, 1);
        }
    };
    
    dictionary.prototype.allKeys = function() {
        return wipeout.utils.obj.copyArray(this._items.keys);
    };
    
    dictionary.prototype.containsKey = function(key) {
        return this._items.keys.indexOf(key) !== -1;
    };
    
    dictionary.prototype.value = function(key) {
        return this._items.values[this._items.keys.indexOf(key)];
    };
    
    return dictionary;
});*/