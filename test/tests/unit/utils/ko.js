module("wipeout.utils.ko", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("enumerateOverChildren", "virtual", true, function(methods, classes, subject, invoker) {
    // arrange
    var html = testUtils.html('\
    <!-- ko -->\
        <div id="el1"></div>\
        <div id="el2"></div>\
        <!-- ko -->\
            <div id="el3"></div>\
            <div id="el4"></div>\
        <!-- /ko -->\
        <div  id="el5"></div>\
    <!-- /ko -->');
    
    var elements = [];
    
    // act
    wo.ko.enumerateOverChildren(html["el1"].previousSibling.previousSibling, function() {
        elements.push(arguments[0]);
    });
    
    //assert
    strictEqual(elements.length, 9);
    strictEqual(elements[0].nodeType, 3);
    strictEqual(elements[1], html["el1"]);
    strictEqual(elements[2].nodeType, 3);
    strictEqual(elements[3], html["el2"]);
    strictEqual(elements[4].nodeType, 3);
    strictEqual(elements[5], html["el2"].nextSibling.nextSibling);
    ok(wipeout.utils.ko.isVirtual(elements[5]));
    strictEqual(elements[6].nodeType, 3);
    strictEqual(elements[7], html["el5"]);
    strictEqual(elements[8].nodeType, 3);
});

testUtils.testWithUtils("enumerateOverChildren", "non virtual", true, function(methods, classes, subject, invoker) {
    // arrange
    var html = testUtils.html('\
    <div id="root">\
        <div id="el1"></div>\
        <div id="el2"></div>\
        <!-- ko -->\
            <div id="el3"></div>\
            <div id="el4"></div>\
        <!-- /ko -->\
        <div  id="el5"></div>\
    </div>');
    
    var elements = [];
    
    // act
    wo.ko.enumerateOverChildren(html["root"], function() {
        elements.push(arguments[0]);
    });
    
    //assert
    strictEqual(elements.length, 9);
    strictEqual(elements[0].nodeType, 3);
    strictEqual(elements[1], html["el1"]);
    strictEqual(elements[2].nodeType, 3);
    strictEqual(elements[3], html["el2"]);
    strictEqual(elements[4].nodeType, 3);
    strictEqual(elements[5], html["el2"].nextSibling.nextSibling);
    ok(wipeout.utils.ko.isVirtual(elements[5]));
    strictEqual(elements[6].nodeType, 3);
    strictEqual(elements[7], html["el5"]);
    strictEqual(elements[8].nodeType, 3);
});








