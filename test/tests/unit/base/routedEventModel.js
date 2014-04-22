module("wipeout.base.routedEventModel", {
    setup: function() {
    },
    teardown: function() {
    }
});

var routedEventModel = wipeout.base.routedEventModel;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    invoker();
    
    // assert
    strictEqual(subject.__triggerRoutedEventOnVM.constructor, wo.event);
});

testUtils.testWithUtils("triggerRoutedEvent", null, false, function(methods, classes, subject, invoker) {
    // arrange    
    var routedEvent = {}, eventArgs = {};
    subject.__triggerRoutedEventOnVM = {
        trigger: methods.customMethod(function() {
            strictEqual(arguments[0].routedEvent, routedEvent);
            strictEqual(arguments[0].eventArgs, eventArgs);
        })
    };
    
    // act
    invoker(routedEvent, eventArgs);
    
    // assert
});