Class("wipeout.profile.utils", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    return {
        generateColour: function() {
            var red = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);
            var green = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);
            var blue = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);

            return red.toString(16) + green.toString(16) + blue.toString(16);
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
        }
    };
});