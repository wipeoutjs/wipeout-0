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
    var find = {};
    
    // act
    invoker(find);
    
    // assert    
    strictEqual(find, subject.find);
});

testUtils.testWithUtils("call", "invalid object", false, function(methods, classes, subject, invoker) {
    // arrange
    var searchTerm = {}, filters = {};
    subject.find = methods.customMethod(function() {
        
        strictEqual(arguments[0], searchTerm);
        strictEqual(arguments[1], filters);
        
        return null;
    });
    
    // act
    // assert
    throws(function() {
        invoker(searchTerm, filters).dot("myFunction");
    });
});

testUtils.testWithUtils("call", "invalid function", false, function(methods, classes, subject, invoker) {
    // arrange
    var searchTerm = {}, filters = {};
    subject.find = methods.customMethod(function() {
        
        strictEqual(arguments[0], searchTerm);
        strictEqual(arguments[1], filters);
        
        return {};
    });
    
    // act
    // assert
    throws(function() {
        invoker(searchTerm, filters).dot("myFunction")();
    });
});

testUtils.testWithUtils("call", "call function", false, function(methods, classes, subject, invoker) {
    // arrange
    var searchTerm = {}, filters = {}, arg1 = {}, arg2 = {};
    subject.find = methods.customMethod(function() {
        
        strictEqual(arguments[0], searchTerm);
        strictEqual(arguments[1], filters);
        
        return {
            myFunction: methods.method([arg1, arg2])
        };
    });
    
    // act
    // assert
    invoker(searchTerm, filters).dot("myFunction")(arg1, arg2);
});

testUtils.testWithUtils("call", "call function with args", false, function(methods, classes, subject, invoker) {
    // arrange
    var searchTerm = {}, filters = {}, arg1 = {}, arg2 = {}, arg3 = {}, arg4 = {};
    subject.find = methods.customMethod(function() {
        
        strictEqual(arguments[0], searchTerm);
        strictEqual(arguments[1], filters);
        
        return {
            myFunction: methods.method([arg1, arg2, arg3, arg4])
        };
    });
    
    // act
    // assert
    invoker(searchTerm, filters).dot("myFunction").args(arg1, arg2)(arg3, arg4);
});

testUtils.testWithUtils("create", "integration test 1", true, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {}, expected = {};
    var worker = invoker(function() {
        return methods.method([arg1, arg2], expected);
    })({}).args(arg1);
    
    // act
    var actual = worker(arg2)
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("create", "integration test 2", true, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {}, expected = {};
    var worker = invoker(function() {
        return {
            p1: {
                p2: {
                    m1: methods.method([arg1, arg2], expected)
                }
            }
        };
    })({}).dot("p1").dot("p2").dot("m1").args(arg1);
    
    // act
    var actual = worker(arg2)
    
    // assert
    strictEqual(actual, expected);
});