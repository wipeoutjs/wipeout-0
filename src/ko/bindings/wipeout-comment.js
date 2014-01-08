
Binding("wipeout-comment", true, function () {
    
    var wipeoutComment = "wipeout-comment";
    var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        comment(element, ko.utils.unwrapObservable(valueAccessor()));
    };
    
    var comment = function(element, comment) {  
        //TODO: more than 1 update
        if(wpfko.utils.ko.virtualElements.isVirtual(element)) {
            element.textContent += wipeoutComment + ": '" + comment.replace("'", "\'") + "'";
        } else if(element && element.nodeType === 1) {
            //TODO: test
            var att = document.createAttribute("data-" + wipeoutComment);
            att.value = comment;
            element.setAttributeNode(att);
        }            
    }
    
    return {
        update: update,
        comment: comment
    };
});