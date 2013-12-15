
window.NS = function(namespace) {
    
    namespace = namespace.split(".");
    var current = window;
    for(var i = 0, ii = namespace.length; i < ii; i++) {
        current = current[namespace[i]] || (current[namespace[i]] = {});
    }
    
    return current;
};

window.vmChooser = function(model) {
    model = ko.unwrap(model);
    
    if(model == null) return null;
    
    throw "Unknown model type";
};