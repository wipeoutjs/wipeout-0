
var Quest = Quest || {};
Quest.KnockoutExtensions = Quest.KnockoutExtensions || {};
Quest.KnockoutExtensions.VirtualElements = Quest.KnockoutExtensions.VirtualElements || {};


$.extend(Quest.KnockoutExtensions.VirtualElements, (function () {
    var allChildren = function (element) {
        var items = [];
        var first = ko.virtualElements.firstChild(element);
        while (first) {
            items.push(first);
            first = ko.virtualElements.nextSibling(first);
        }

        return items;
    };

    ko.virtualElements.allChildren = allChildren;

    return {
        AllChildren: allChildren
    };
})());