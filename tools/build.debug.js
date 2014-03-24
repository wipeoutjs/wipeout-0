
window.wipeout = wipeout;
var DEBUG = wo.DEBUG = true;

(function() {
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    wo.debug = {
        renderedItems: function(rootNode /*optional*/, renderedItemType /*optional*/) {
            
            var values = [], vm;
            var recursive = function(node) {
                if(node) {
                    switch(node.nodeType) {
                        case 1:
                            enumerate(node.childNodes, recursive);
                        case 8:
                            if((vm = wipeout.utils.html.getViewModel(node)) &&
                               values.indexOf(vm) === -1 &&
                              (!renderedItemType || vm.constructor === renderedItemType)) {
                                values.push(vm);
                            }
                    }
                }
            };
            
            recursive(rootNode || document.getElementsByTagName("body")[0]);
            return values;
        },
        profiler: {
            
            generateColour: function() {
                var red = Math.floor((wo.debug.profiler.random(255) + 255) / 2);
                var green = Math.floor((wo.debug.profiler.random(255) + 255) / 2);
                var blue = Math.floor((wo.debug.profiler.random(255) + 255) / 2);

                return red.toString(16)+ green.toString(16) + blue.toString(16);
            },
            generateInfo: function(vm) {
                return vm.__woBag.rootHtmlElement.textContent;
            },
            popup: function(htmlString) {
                var $content = $('<div style="z-index: 100000; position: fixed; top: 10%; left: 10%; background-color: white; height: 80%; width: 80%">\
                    <div>' + htmlString + '</div>\
                    <button id="wipeoutProfileCloseButton">Close</button>\
                </div>');
                
                $content.find("#wipeoutProfileCloseButton").on("click", function() {
                    $(this).parent().remove();
                });
                
                $("body").append($content[0]);
            },
            profile: function(rootViewModel) {
                jQ();
                var $ = window.jQuery;
                var profilerKey = "wipeoutprofiler";
                try {
                    var vms = wo.debug.renderedItems(rootViewModel.__woBag.rootHtmlElement);
                    for(var i = 0, ii = vms.length; i < ii; i++)
                        $(vms[i]).data(profilerKey, {id: i});
                    
                    var styles = [];
                    
                    enumerate(vms, function(vm) {
                        var cssClass = "wipeout-profiler-" + $(vm).data("wipeoutprofiler").id;
                        $(wipeout.utils.ko.virtualElements.childNodes(vm.__woBag.rootHtmlElement)).addClass(cssClass);
                        
                        $("." + cssClass).on("click", function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            wo.debug.profiler.popup(wo.debug.profiler.generateInfo(vm));
                        });
                        
                        styles.push("." + cssClass + " {background-color:#" + wo.debug.profiler.generateColour() + " !important;}");
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
        }
    };
})();