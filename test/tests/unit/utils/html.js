module("wipeout.utils.html", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("outerHTML", function() {
    // arrange    
    // act    
    //assert
    wo.obj.enumerate(wo.visual.reservedTags, function(tag) {
        if(tag === "html")
            throws(function() { wo.html.outerHTML(document.createElement(tag)); }, tag);
        else
            ok(wo.html.outerHTML(document.createElement(tag)), tag);        
    });    
});

test("createElement", function() {
    // arrange    
    // act    
    //assert
    wo.obj.enumerate(wo.visual.reservedTags, function(val, tag) {
        if(wo.html.cannotCreateTags[tag])
            throws(function() { wo.html.createElement("<" + createElement + "></" + createElement + ">"); }, tag);
        else {
            var element = wo.html.createElement("<" + tag + "></" + tag + ">");
            ok(element instanceof HTMLElement, tag + " instance");
            
            // firefox creates select elements instead of keygens
            if(tag !==  "keygen")
                strictEqual(element.tagName.toLowerCase(), tag, tag + " created");
        }
    });    
});

testUtils.testWithUtils("getTagName", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert    
    throws(function() { invoker("SAHDAHSVD"); });
    strictEqual(invoker("<asuhdvjauhsvdjhv "), "asuhdvjauhsvdjhv");
    strictEqual(invoker("    <asuhdvjauhsvdjhv "), "asuhdvjauhsvdjhv");
});

testUtils.testWithUtils("getFirstTagName", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    // assert     
    strictEqual(invoker("SAHDAHSVD"), null);
    strictEqual(invoker("<asuhdvjauhsvdjhv "), "asuhdvjauhsvdjhv");
    strictEqual(invoker("    <asuhdvjauhsvdjhv "), "asuhdvjauhsvdjhv");
    strictEqual(invoker(" sadsad   <asuhdvjauhsvdjhv "), "asuhdvjauhsvdjhv");
});

testUtils.testWithUtils("createElements", "", true, function(methods, classes, subject, invoker) {
    // arrange
    
    // act
    var elements = invoker("<div></div><span></span><input></input>");
    
    // assert    
    strictEqual(elements.length, 3);
    strictEqual(elements[0].constructor, HTMLDivElement);
    strictEqual(elements[1].constructor, HTMLSpanElement);
    strictEqual(elements[2].constructor, HTMLInputElement);
});

testUtils.testWithUtils("createElements", "special tags", true, function(methods, classes, subject, invoker) {
    // arrange
    
    // act
    var elements = invoker("<tbody></tbody>");
    
    // assert    
    strictEqual(elements.length, 1);
    strictEqual(elements[0].constructor, HTMLTableSectionElement);
});

testUtils.testWithUtils("getAllChildren", "virtual", true, function(methods, classes, subject, invoker) {
    // arrange
    var html = $("<div><!-- ko --><span></span><!-- /ko --><input /></div>");
    
    // act
    var result = invoker(html[0].childNodes[0]);
    
    // assert 
    strictEqual(result.length, 1);
    strictEqual(result[0].constructor, HTMLSpanElement);
});

testUtils.testWithUtils("getAllChildren", "non virtual", true, function(methods, classes, subject, invoker) {
    // arrange
    var html = $("<div><!-- ko --><span></span><!-- /ko --><input /></div>");
    
    // act
    var result = invoker(html[0]);
    
    // assert 
    strictEqual(result.length, 2);
    strictEqual(result[0].constructor, Comment);
    strictEqual(result[1].constructor, HTMLInputElement);
});

testUtils.testWithUtils("getViewModel", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var viewModel = {};
    var id1 = "JKBJKBJK", id2 = "JKBsaddsad";
    $("#qunit-fixture").html('<div id="' + id1 + '"><div id="' + id2 + '"></div></div>');
    id1 = $("#" + id1)[0];
    id2 = $("#" + id2)[0];
    
    ko.utils.domData.set(id1, wipeout.bindings.wipeout.utils.wipeoutKey, viewModel);
    
    // act
    // assert    
    strictEqual(invoker(id1), viewModel);
    strictEqual(invoker(id2), viewModel);
});