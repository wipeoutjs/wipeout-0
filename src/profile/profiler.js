Class("wipeout.profile.profiler", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    return {
        profile: function(rootViewModel) {
            jQ();
            var $ = window.jQuery;
            var profilerKey = "wipeoutprofiler";
            try {
                var vms = wipeout.debug.renderedItems(rootViewModel.__woBag.rootHtmlElement);
                for(var i = 0, ii = vms.length; i < ii; i++)
                    $(vms[i]).data(profilerKey, {id: i});

                var styles = [];

                enumerate(vms, function(vm) {
                    var cssClass = "wipeout-profiler-" + $(vm).data("wipeoutprofiler").id;
                    $(wipeout.utils.ko.virtualElements.childNodes(vm.__woBag.rootHtmlElement)).addClass(cssClass);

                    $("." + cssClass).on("click", function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        wipeout.profile.utils.popup(wipeout.profile.utils.generateInfo(vm));
                    });

                    styles.push("." + cssClass + " {background-color:#" + wipeout.profile.utils.generateColour() + " !important;}");
                });         

                var style = $("<style>" + styles.join("\n") + "</style>");

                $("body").append(style[0]);
            } finally {                
                // cleanup
                enumerate(vms, function(vm) {
                    $.removeData(vm, profilerKey);
                });
            }
        }
    };    
});