module("wipeout.base.disposable", {
    setup: function() {
    },
    teardown: function() {
    }
});

var disposable = wipeout.base.disposable;

testUtils.testWithUtils("constructor", "and all functionality", false, function(methods, classes, subject, invoker) {
    // arrange
    var called = 0;
    var subject = new disposable(function(){ called++; });
    
    // act
    subject.dispose();
    subject.dispose();
    
    // assert
    ok(!subject.disposeFunction);
    strictEqual(called, 1);
});