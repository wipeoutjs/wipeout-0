Class("wipeout.utils.domData", function () {
    var domDataKey = "__wipeout_domData";
    
    function domData() {
    }
    
    function store(element) {
        return element[domDataKey] = element[domDataKey] || {};
    }
    
    domData.get = function(element, key) {
        return store(element)[key];
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