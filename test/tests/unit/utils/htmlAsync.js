module("wipeout.utils.htmlAsync", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("integration test", "", false, function(methods, classes, subject, invoker) {
    
    //ok(false, "This test takes 40 seconds to run");
    //return;
    
    // arrange
    
    // original classes won't do in async test
    classes = new testUtils.classMock();
    var numberOfTimes = 20;
    var time = 200;
    var current = null;
    
    classes.mock(window.MutationObserver ? 
                "wipeout.utils.mutationObserverDomManipulationWorker" :
                "wipeout.utils.bindingDomManipulationWorker", function() {
        ok(!current);
        current = this;        
        this.finish = function() {
            current = null;
        };
    }, numberOfTimes);
    
    stop();
    
    // act
    for(var i = 0; i < numberOfTimes; i++) {
        setTimeout(function() {
            wipeout.utils.htmlAsync(function(callback) {
                setTimeout(function() {
                    callback();
                }, Math.floor(Math.random() * time)); // task takes up to 2 seconds to complete
            });                
        }, Math.floor(Math.random() * time)); // wait up to 2 seconds before adding task
    }
    
    // assert
    setTimeout(function() {
        classes.reset();
        start();
    }, (time * numberOfTimes) + time);
});