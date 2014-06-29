Class("wipeout.utils.domData", function () {
    var domDataKey = "__wipeout_domData";
    
    function domData() {
        ///<summary>Append data to dom elemenents</summary>
    }
    
    function store(element) {
        ///<summary>Lazy create and get the dom data store for an element</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<returns type="Object">The data store for this element</returns>
        
        if(!element) throw "Invalid html element";
        return element[domDataKey] = element[domDataKey] || {};
    }
    
    domData.get = function(element, key) {
        ///<summary>Get data from an element</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<param name="key" type="String" optional="true">The data to get</param>
        ///<returns type="Object">The value of this key</returns>
        
        return arguments.length > 1 ? store(element)[key] : store(element);
    };
    
    domData.set = function(element, key, value) {
        ///<summary>Set data on an element</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<param name="key" type="String" optional="false">The key of data to set</param>
        ///<param name="value" type="Any" optional="false">The data to set</param>
        ///<returns type="Any">The value</returns>
        
        return store(element)[key] = value;
    };
    
    domData.clear = function(element, key) {
        ///<summary>Clear an elements data</summary>
        ///<param name="element" type="HTMLNode" optional="false">The element to get a store from</param>
        ///<param name="key" type="String" optional="true">The key of data to clear</param>
        
        if(key) {
            delete store(element)[key];
        } else {
            delete element[domDataKey];
        }
    };
    
    return domData;
});