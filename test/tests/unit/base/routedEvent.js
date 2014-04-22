module("wipeout.base.routedEvent", {
    setup: function() {
    },
    teardown: function() {
    }
});

var routedEvent = wipeout.base.routedEvent;

testUtils.testWithUtils("trigger", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var eventArgs = {};
    var triggerOnVisual = {
        triggerRoutedEvent: methods.customMethod(function() {
            strictEqual(arguments[0], subject);
            strictEqual(arguments[1].constructor, wipeout.base.routedEventArgs);
            strictEqual(arguments[1].data, eventArgs);
            strictEqual(arguments[1].originator, triggerOnVisual);            
        })
    };
    
    // act
    invoker(triggerOnVisual, eventArgs);
    
    // assert
});

testUtils.testWithUtils("unRegister", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var callback = {}, context = {}, expected = {};
    var triggerOnVisual = {
        unRegisterRoutedEvent: methods.method([subject, callback, context], expected)
    };
    
    // act
    var actual = invoker(callback, triggerOnVisual, context);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("register", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var callback = {}, context = {}, expected = {};
    var triggerOnVisual = {
        registerRoutedEvent: methods.method([subject, callback, context], expected)
    };
    
    // act
    var actual = invoker(callback, triggerOnVisual, context);
    
    // assert
    strictEqual(actual, expected);
});


module("wipeout.base.routedEventArgs", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var data = {}, originator = {};
    
    // act
    invoker(data, originator);
    
    // assert
    strictEqual(subject.data, data);
    strictEqual(subject.originator, originator);
});

var routedEventArgs = wipeout.base.routedEventArgs;

module("wipeout.base.routedEventRegistration", {
    setup: function() {
    },
    teardown: function() {
    }
});

var routedEventRegistration = wipeout.base.routedEventRegistration;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var routedEvent = {};
    
    // act
    invoker(routedEvent);
    
    // assert
    strictEqual(subject.routedEvent, routedEvent);
    strictEqual(subject.event.constructor, wipeout.base.event);
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.event = {
        dispose: methods.method()
    };
    
    // act
    invoker();
    
    // assert
});