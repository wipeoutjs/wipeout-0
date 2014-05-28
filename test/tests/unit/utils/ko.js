module("wipeout.utils.ko", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("virtualElements.closingTag", function() {
    // arrange    
    var id1 = "LKJBLKJBLKJB", id2 = "sadsadasdsadsa";
    $("#qunit-fixture").html('\
    <!-- ko -->\
        <div id="' + id1 + '"></div>\
        <div></div>\
        <!-- ko -->\
            <div></div>\
            <div></div>\
        <!-- /ko -->\
        <div id="' + id2 + '"></div>\
    <!-- /ko -->');
    //debugger;
    var item1 = $("#" + id1)[0].previousSibling.previousSibling;
    var item2 = $("#" + id2)[0].nextSibling.nextSibling;
    ok(item1);
    ok(item2);
    strictEqual(item1.nodeType, 8);
    strictEqual(item2.nodeType, 8);
    
    // act
    var actual = wipeout.utils.ko.virtualElements.closingTag(item1);
    
    //assert
    strictEqual(actual, item2);
});








