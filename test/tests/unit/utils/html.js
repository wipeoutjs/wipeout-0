module("wipeout.tests.unit.utils.html", {
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
    wo.obj.enumerate(wo.visual.reservedTags, function(tag) {
        if(tag === "html")
            throws(function() { wo.html.createElement("<" + createElement + "></" + createElement + ">"); }, tag);
        else
            strictEqual(wo.html.createElement("<" + tag + "></" + tag + ">").tagName.toLowerCase(), tag, tag);        
    });    
});