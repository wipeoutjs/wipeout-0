
window.wipeout = wipeout;
var DEBUG = wo.DEBUG = true;

(function() {
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    wo.debug = {
        renderedItems: function(renderedItemType /*optional*/) {
            
            var values = [], vm;
            var recursive = function(node) {
                if(node) {
                    switch(node.nodeType) {
                        case 1:
                            enumerate(node.childNodes, recursive);
                        case 8:
                            if((vm = wipeout.utils.html.getViewModel(node)) &&
                              (!renderedItemType || vm.constructor === renderedItemType)) {
                                values.push(vm);
                            }
                    }
                }
            };
            
            recursive(document.getElementsByTagName("body")[0]);
            return values;
        }
    };
})();