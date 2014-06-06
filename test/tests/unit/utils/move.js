module("wipeout.utils.move", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    classes.mock("wipeout.utils.moveAsync", function(input) {
        input(methods.method());
    }, 1);
    
    // act
    invoker(methods.method());
    
    // assert
});