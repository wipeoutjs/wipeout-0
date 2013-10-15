
var wpfko = wpfko || {};
    wpfko.ko = wpfko.ko || {};

(function () {
        
    var allChildren = function (element) {
        var items = [];
        var first = ko.virtualElements.firstChild(element);
        while (first) {
            items.push(first);
            first = ko.virtualElements.nextSibling(first);
        }

        return items;
    };    
    

    var append = function (containerElem, nodeToAppend) {
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
            ko.virtualElements[i] = wpfko.ko.virtualElements[i];
        }
    }
})();