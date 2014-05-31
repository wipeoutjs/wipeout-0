Class("wipeout.settings", function() {
    function settings (settings) {
        enumerate(wipeout.settings, function(a,i) {
            delete wipeout.settings[i];
        });
        
        enumerate(settings, function(setting, i) {
            wipeout.settings[i] = setting;
        });        
    }
    
    settings.orphanMovedNodesOnTemplate = false;
    settings.suppressWarnings = false;
    
    return settings;
});