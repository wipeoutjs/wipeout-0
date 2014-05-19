module("wipeout.template.asyncLoader", {
    setup: function() {
    },
    teardown: function() {
    }
});

var asyncLoader = wipeout.template.asyncLoader;

asyncTest("constructor, hammering the async loader, this is more of an integration test", function() {
        
    var methods = new testUtils.methodMock();
    var classes = new testUtils.classMock();
         
    var loader = new asyncLoader();

    var count = 0;
    var assert = function(templateId) {
        return methods.dynamicMethod(function() {
            ok(wo.contentControl.templateExists(templateId));

            count++;
            if(count === templates.length) {
                classes.reset();
                start();
            }
        });
    };
    
    var distinctTemplates = 50;
    var repeatEachOne = 5;
    var addedAlready = 5;

    // there are 50 templates each used 5 times
    var templates = [];
    for (var i = 0; i < distinctTemplates; i++) {
        for(var j = 0; j < repeatEachOne; j++) {
            // insert a new request at a random place
            var index = wipeout.utils.obj.random(templates.length);
            templates.splice(index, 0, {name: "t" + i, callback: assert("t" + i)});
        }
    }
    
    var templatesAddedAlready = [];
    for(var i = 0; i < addedAlready; i++) {
        // some of the templates have been added already
        templatesAddedAlready.push('<script id="t' + i + '" type="text/xml">Hello</script>');
    }
    
    $("#qunit-fixture").html(templatesAddedAlready.join("\n"));

    expect(templates.length + 1 /* +1 is the classes.reset() */);

    classes.mock("wipeout.utils.obj.ajax", function (input) {
        setTimeout(function() {
            input.success({});
        // ajax request takes up to 2 sconds
        }, wipeout.utils.obj.random(2000));
    }, distinctTemplates - addedAlready);

    for(var i = 0, ii = templates.length; i < ii; i++) {
        (function(i) {
            setTimeout(function() {
                loader.load(templates[i].name, templates[i].callback);
            // up to a 5 second delay on template load signalled
            }, wipeout.utils.obj.random(5000));
        })(i);
    }
});