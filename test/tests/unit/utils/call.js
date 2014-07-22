module("wipeout.utils.call", {
    setup: function() {
    },
    teardown: function() {
    }
});

var call = wipeout.utils.call;

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    
    // act
    invoker(find);
    
    // assert
});

testUtils.testWithUtils("call", "invalid object", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    // assert
    throws(function() {
        invoker().dot("myFunction");
    });
});

testUtils.testWithUtils("call", "invalid function", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    // assert
    throws(function() {
        invoker({}).dot("myFunction")();
    });
});

testUtils.testWithUtils("call", "call function", false, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {};
    var input = {
        myFunction: methods.method([arg1, arg2])
    };
    
    // act
    // assert
    invoker(input).dot("myFunction")(arg1, arg2);
});

testUtils.testWithUtils("call", "call function with args", false, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {}, arg3 = {}, arg4 = {};
    var input = {
        myFunction: methods.method([arg1, arg2, arg3, arg4])
    };
    
    // act
    // assert
    invoker(input).dot("myFunction").args(arg1, arg2)(arg3, arg4);
});

testUtils.testWithUtils("create", "integration test 1", true, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {}, expected = {};
    var worker = invoker()(methods.method([arg1, arg2], expected)).args(arg1);
    
    // act
    var actual = worker(arg2)
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("create", "integration test 2", true, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {}, expected = {};
    var worker = invoker()({
            p1: {
                p2: {
                    m1: methods.method([arg1, arg2], expected)
                }
            }
        }).dot("p1").dot("p2").dot("m1").args(arg1);
    
    // act
    var actual = worker(arg2)
    
    // assert
    strictEqual(actual, expected);
});