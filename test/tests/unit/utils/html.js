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
    wo.utils.obj.enumerate(wo.visual.reservedTags, function(tag) {
        if(tag === "html")
            throws(function() { wo.utils.html.outerHTML(document.createElement(tag)); });
        else
            ok(wo.utils.html.outerHTML(document.createElement(tag)), tag);        
    });    
});