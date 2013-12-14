
window.NS = function(namespace) {
    
    namespace = namespace.split(".");
    var current = window;
    for(var i = 0, ii = namespace.length; i < ii; i++) {
        current = current[namespace[i]] || (current[namespace[i]] = {});
    }
    
    return current;
};