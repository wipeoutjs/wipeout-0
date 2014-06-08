module("wipeout.utils.mutationObserverDomManipulationWorker", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    var mutations = {};
    classes.mock("MutationObserver", function() {
        this.callback = arguments[0];
        this.observe = methods.customMethod(function() {
            strictEqual(arguments[0], document.body);
            ok(arguments[1].childList);
            ok(arguments[1].subtree);
        });        
    }, 1);
    
    subject.appendRemovedNodes = methods.method([mutations]);
    
    // act
    invoker();
    
    // assert
    ok(subject._observer instanceof MutationObserver);
    
    subject._observer.callback(mutations);
});

testUtils.testWithUtils("appendRemovedNodes", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var m1 = {}, m2 = {}, m3 = {}, m4 = {};
    subject._mutations = [];
    
    // act
    invoker([{removedNodes:[m1, m2]}, {removedNodes:[m3, m4]}]);
    
    // assert
    strictEqual(m1, subject._mutations[0]);
    strictEqual(m2, subject._mutations[1]);
    strictEqual(m3, subject._mutations[2]);
    strictEqual(m4, subject._mutations[3]);
});

testUtils.testWithUtils("finish", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._observer = {
        disconnect: methods.method()
    };
    subject._super = methods.method();
    
    // act
    invoker();
    
    // assert
});