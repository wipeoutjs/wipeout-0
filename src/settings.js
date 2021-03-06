Class("wipeout.settings", function() {
    function settings (settings) {
        enumerate(wipeout.settings, function(a,i) {
            delete wipeout.settings[i];
        });
        
        enumerate(settings, function(setting, i) {
            wipeout.settings[i] = setting;
        });        
    }

    settings.suppressWarnings = false;
    settings.asynchronousTemplates = true;
    settings.htmlAsyncTimeout = 10000;
    
    return settings;
});