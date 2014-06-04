module("wipeout.utils.domData", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("get, set, clear", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var element = {};
    var key = "JKHBKJHBKJHB";
    var value = {};
    
    // act 1
    var val1 = wipeout.utils.domData.set(element, key, value);
    strictEqual(element["__wipeout_domData"][key], value);
    strictEqual(val1, value);
    
    // act 2
    var val2 = wipeout.utils.domData.get(element, key);
    strictEqual(val2, value);
    
    // act 3
    var val3 = wipeout.utils.domData.get(element);
    strictEqual(val3[key], value);
    
    // act 4
    wipeout.utils.domData.clear(element, key);
    strictEqual(element["__wipeout_domData"][key], undefined);
    
    // act 5
    wipeout.utils.domData.clear(element);
    strictEqual(element["__wipeout_domData"], undefined);
    
    // act 6
    throws(function() {
        wipeout.utils.domData.get(null);
    });
});