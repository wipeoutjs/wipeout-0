
    var wpfko = wpfko || {};
    wpfko.util = wpfko.util || {};

(function () {
    
    var _ko = {};
    
    _ko.version = function() {
        
        if(!ko || !ko.version)
            return null;
        
        var version = ko.version.split(".");
        for(var i = 0, ii = version.length; i < ii; i++)
            version[i] = parseInt(version[i]);
        
        return version;
    };    
    
    wpfko.util.ko = _ko;
})();