module("wipeout.utils.obj", {
    setup: function() {
    },
    teardown: function() {
    }
});

var obj = wipeout.utils.obj;

testUtils.testWithUtils("enumerate", "array", true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker([1,2,3,4], function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[0].name, 0);
    strictEqual(subject[0].val, 1);
    strictEqual(subject[1].name, 1);
    strictEqual(subject[1].val, 2);
    strictEqual(subject[2].name, 2);
    strictEqual(subject[2].val, 3);
    strictEqual(subject[3].name, 3);
    strictEqual(subject[3].val, 4);
});


testUtils.testWithUtils("enumerate", "dictionary", true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker({"a":1,"b": 2,"c": 3,"d": 4}, function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[0].name, "a");
    strictEqual(subject[0].val, 1);
    strictEqual(subject[1].name, "b");
    strictEqual(subject[1].val, 2);
    strictEqual(subject[2].name, "c");
    strictEqual(subject[2].val, 3);
    strictEqual(subject[3].name, "d");
    strictEqual(subject[3].val, 4);
});

testUtils.testWithUtils("enumerateDesc", "array", true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker([1,2,3,4], function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[3].name, 0);
    strictEqual(subject[3].val, 1);
    strictEqual(subject[2].name, 1);
    strictEqual(subject[2].val, 2);
    strictEqual(subject[1].name, 2);
    strictEqual(subject[1].val, 3);
    strictEqual(subject[0].name, 3);
    strictEqual(subject[0].val, 4);
});


testUtils.testWithUtils("enumerateDesc", "dictionary", true, function(methods, classes, subject, invoker) {
    // arrange
    var subject = [];
    
    // act    
    invoker({"a":1,"b": 2,"c": 3,"d": 4}, function(i, j){this.push({val:i, name:j});}, subject);
    
    // assert    
    strictEqual(subject.length, 4);
    strictEqual(subject[3].name, "a");
    strictEqual(subject[3].val, 1);
    strictEqual(subject[2].name, "b");
    strictEqual(subject[2].val, 2);
    strictEqual(subject[1].name, "c");
    strictEqual(subject[1].val, 3);
    strictEqual(subject[0].name, "d");
    strictEqual(subject[0].val, 4);
});

testUtils.testWithUtils("trim", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var string = "JKHVJKHVJKHVH";
    
    // act    
    // assert
    strictEqual(invoker("   \n\r\t" + string + "   \n\r\t"), string);
});

testUtils.testWithUtils("trimToLower", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var string = "JKHVJKHVJKHVH";
    
    // act    
    // assert
    strictEqual(invoker("   \n\r\t" + string + "   \n\r\t"), string.toLowerCase());
});

testUtils.testWithUtils("parseBool", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert    
    strictEqual(invoker("sdasd"), true);    
    strictEqual(invoker("true"), true);      
    strictEqual(invoker("0"), false);  
    strictEqual(invoker(0), false);      
    strictEqual(invoker(""), false);    
    strictEqual(invoker("FalSe"), false);    
});

testUtils.testWithUtils("getObject", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var ctxt = {a:{b:{c:{d:{}}}}};
    
    // act    
    // assert    
    strictEqual(invoker("a.b.c.d", ctxt), ctxt.a.b.c.d);
});

testUtils.testWithUtils("createObject", "invalid function", true, function(methods, classes, subject, invoker) {
    // arrange
    var ctxt = {a:{b:{c:{d:{}}}}};
    
    // act 
    // assert    
    throws(function() {
        invoker("a.b.c.d", ctxt);
    });
});

testUtils.testWithUtils("createObject", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var ctxt = {a:{b:{c:{d:function(){}}}}};
    
    // act 
    // assert
    ok(invoker("a.b.c.d", ctxt) instanceof ctxt.a.b.c.d);;
});

testUtils.testWithUtils("copyArray", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var expected = [{}, {}, {}];
    
    // act    
    var actual = invoker(expected);
    
    // assert    
    strictEqual(actual.length, expected.length);
    for(var i = 0, ii = actual.length; i < ii; i++)
        strictEqual(actual[i], expected[i]);        
});

testUtils.testWithUtils("endsWith", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var end = "LKJBKJB";
    
    // act    
    // assert    
    ok(invoker("lsdikgflkjsdbfkjlsdbfkjsdbf" + end, end));
    ok(!invoker("lsdikgflkjsdbfkjlsdbfkjsdbf" + end + " ", end));
});