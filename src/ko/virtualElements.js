
(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.ko = wpfko.ko || {};
    
    var allChildren = function (element) {
        var items = [];
        var first = ko.virtualElements.firstChild(element);
        while (first) {
            items.push(first);
            first = ko.virtualElements.nextSibling(first);
        }

        return items;
    };    
    

    append = function (containerElem, nodeToAppend) {
        var current = ko.virtualElements.firstChild(containerElem);
        if (!current) {
            ko.virtualElements.prepend(containerElem, nodeToAppend);
            return;
        }

        var tmp;
        while (tmp = ko.virtualElements.nextSibling(current)) {
            current = tmp;
        }

        ko.virtualElements.insertAfter(containerElem, nodeToAppend, current);
    }
    
    wpfko.ko.virtualElements = {
        allChildren: allChildren,
        append: append,
        utils: {}
    };
    
    for(var i in wpfko.ko.virtualElements) {
        if(i !== "utils") {
            wpfko.ko.virtualElements[i] = ko.virtualElements.allChildren[i];
        }
    }
})());