module("wipeout.utils.bindingDomManipulationWorker", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    
    // act
    invoker();
    
    // assert
});

testUtils.testWithUtils("finish", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var binding1 = "KJBKJBKJBBKJB", binding2 = "asdsgtasds", binding3 = "sdfsdfsdfsdf";
    subject._super = methods.method();
    
    classes.mock("wipeout.bindings.bindingBase.registered", {});
    
    wipeout.bindings.bindingBase.registered[binding1] = {
        checkHasMoved: function(){return true;},
        element: {}
    };    
    wipeout.bindings.bindingBase.registered[binding2] = {
        checkHasMoved: function(){return true;},
        element: {}
    };    
    wipeout.bindings.bindingBase.registered[binding3] = {
        checkHasMoved: function(){return false;},
        element: {}
    };
    
    subject._mutations = [wipeout.bindings.bindingBase.registered[binding2].element];
    
    // act
    invoker();
    
    // assert
    strictEqual(wipeout.bindings.bindingBase.registered[binding2].element, subject._mutations[0]);
    strictEqual(wipeout.bindings.bindingBase.registered[binding1].element, subject._mutations[1]);
});