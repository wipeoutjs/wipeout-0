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