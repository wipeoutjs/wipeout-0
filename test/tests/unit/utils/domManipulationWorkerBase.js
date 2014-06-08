module("wipeout.utils.domManipulationWorkerBase", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    
    // act
    invoker();
    
    // assert
    ok(subject._mutations);
});

testUtils.testWithUtils("finish", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var m2 = document.createElement("div"), binding = {hasMoved:methods.method()};
    var html = testUtils.html('<div id="iidd"></div>')
    subject._mutations = [html["iidd"], m2];
    
    classes.mock("wipeout.utils.html.cleanNode", function() {
        strictEqual(arguments[0], m2);
    }, 1);
    
    classes.mock("wipeout.bindings.bindingBase.getBindings", function() {
        strictEqual(arguments[0], html["iidd"]);
        strictEqual(arguments[1], wipeout.bindings.render);
        
        return [binding];
    }, 1);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject._mutations.length, 0);
});