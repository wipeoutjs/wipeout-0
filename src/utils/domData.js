Class("wipeout.utils.domData", function () {
    var domDataKey = "__wipeout_domData";
    
    function domData() {
    }
    
    function store(element) {
        if(!element) throw "Invalid html element";
        return element[domDataKey] = element[domDataKey] || {};
    }
    
    domData.get = function(element, key) {
        return arguments.length > 1 ? store(element)[key] : store(element);
    };
    
    domData.set = function(element, key, value) {
        return store(element)[key] = value;
    };
    
    domData.clear = function(element, key) {
        if(key) {
            delete store(element)[key];
        } else {
            delete element[domDataKey];
        }
    };
    
    return domData;
});