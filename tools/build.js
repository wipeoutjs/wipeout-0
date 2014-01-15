window.wo = {};
enumerate(wpfko.base, function(item, i) {
    window.wo[i] = item;
});

window.wo.utils = wpfko.utils;

window.wo.setTemplateEngine = function() {
    ko.setTemplateEngine(new wpfko.template.engine());
};

var load = true;
var matches = [
    /wipeout\-0\.2\.js$/,
    /wipeout\-0\.2\.js?/,
    /wipeout\-0\.2\.debug\.js$/,
    /wipeout\-0\.2\.debug\.js?/    
];


// find a wipeout script. If it has no data-wo-template="false" attribute, use the wipeout template engine
var wipeoutDebug = /wipeout-0.2.debug.js$/;
enumerate(document.getElementsByTagName("script"), function(script) {
    if(load) {
        enumerate(matches, function(regex) {
            if(script.src && load && regex.test(script.src)) {
                if (script.attributes["data-wo-template"] &&
                    (script.attributes["data-wo-template"].value === false ||
                    script.attributes["data-wo-template"].value === "false"))
                    load = false;
            }
        });
    }
});

if(load)
    window.wo.setTemplateEngine();