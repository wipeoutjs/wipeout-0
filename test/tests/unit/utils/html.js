module("wipeout.tests.unit.utils.html", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("specialTags", function() {
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