module("wipeout.base.event", {
    setup: function() {
    },
    teardown: function() {
    }
});

var event = wipeout.base.event;

testUtils.testWithUtils("event", "constructor, trigger, register, unregister", false, function(methods, classes, subject, invoker) {
    // arrange
    var context = {}, eventArgs = {};
    var called1 = 0, called2 = 0;
    var subject = new event();
    function callback1() {
        strictEqual(arguments[0], eventArgs);
        strictEqual(this, context);
        called1++;
    }
    function callback2() {
        strictEqual(arguments[0], eventArgs);
        strictEqual(this, context);
        called2++;
    }
    
    // act
    // assert
    
    // inital
    subject.register(callback1, context);
    var dispose = subject.register(callback2, context);
    
    subject.trigger(eventArgs);    
    strictEqual(called1, 1);
    strictEqual(called2, 1);
    
    // invalid context when un registering
    subject.unRegister(callback1);
    
    subject.trigger(eventArgs);    
    strictEqual(called1, 2);
    strictEqual(called2, 2);
    
    // unregister
    subject.unRegister(callback1, context);
    
    subject.trigger(eventArgs);    
    strictEqual(called1, 2);
    strictEqual(called2, 3);
    
    // returned dispose function
    dispose.dispose();
    
    subject.trigger(eventArgs);    
    strictEqual(called1, 2);
    strictEqual(called2, 3);
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new event();
    function callback() {
        ok(false, "callback should not have been called");
    }
    
    subject.register(callback);
        
    // act
    subject.dispose();
    subject.trigger({});
    
    // assert
    ok(true);
});