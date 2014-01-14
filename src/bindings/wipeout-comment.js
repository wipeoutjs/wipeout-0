
Binding("wipeout-comment", true, function () {
    
    var wipeoutComment = "wipeout-comment";
    var update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        comment(element, ko.utils.unwrapObservable(valueAccessor()));
    };
    
    var comment = function(element, comment) {  
        if(wpfko.utils.ko.virtualElements.isVirtual(element)) {
            element[wipeoutComment] = element[wipeoutComment] || element.textContent;
            element.textContent = element[wipeoutComment] + wipeoutComment + ": '" + comment.replace("'", "\'") + "' ";
        } else if(element && element.parentElement) {
            if(!element[wipeoutComment])
                element.parentElement.insertBefore(element[wipeoutComment] = document.createComment(""), element);
            
            element[wipeoutComment].textContent = " " + wipeoutComment + ": '" + comment.replace("'", "\'") + "' "
        }            
    };
    
    return {
        update: update,
        comment: comment
    };
});