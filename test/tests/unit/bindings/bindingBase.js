module("wipeout.bindings.bindingBase", {
    setup: function() {
    },
    teardown: function() {
    }
});

var bindingBase = wipeout.bindings.bindingBase;

testUtils.testWithUtils("constructor", "2 control flow bindings", false, function(methods, classes, subject, invoker) {
    // arrange
    var element = {};
    wipeout.utils.domData.set(element, wipeout.bindings.bindingBase.dataKey, [{bindingMeta: {controlsDescendantBindings: true}}]);
    subject._super = function() {};    
    
    // act
    // assert
    throws(function() {
        invoker(element);
    });
});

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var parentElement = {}, element = {};
    subject._super = methods.method();
    subject.getParentElement = function() { return parentElement; };
    subject.moved = methods.method([null, parentElement]);
    
    // act
    invoker(element);
    
    // assert
    strictEqual(subject.element, element);
    ok(subject.bindingMeta, element);
    ok(wipeout.utils.domData.get(element, wipeout.bindings.bindingBase.dataKey).indexOf(subject) !== -1);
});

testUtils.testWithUtils("getParentElement", "parentElement", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.element = {parentElement: {}, parentNode: {}};
    
    // act    
    // assert
    strictEqual(subject.element.parentElement, invoker());
});

testUtils.testWithUtils("getParentElement", "parentNode", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.element = {parentElement: null, parentNode: {}};
    
    // act    
    // assert
    strictEqual(subject.element.parentNode, invoker());
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var element = subject.element = {};
    subject.parentElement = {};
    subject._super = methods.method();
    subject.moved = methods.method([subject.parentElement, null]);
    wipeout.utils.domData.set(subject.element, wipeout.bindings.bindingBase.dataKey, [subject, {}]);
    
    // act
    invoker();
    
    // assert
    strictEqual(wipeout.utils.domData.get(element, wipeout.bindings.bindingBase.dataKey).length, 1);
    notEqual(wipeout.utils.domData.get(element, wipeout.bindings.bindingBase.dataKey)[0], subject);
    ok(!subject.element);
    ok(!subject.parentElement);
});

testUtils.testWithUtils("hasMoved", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var newParent = {}, oldParent = {};
    subject.getParentElement = function() { return newParent; };
    subject.parentElement = oldParent;    
    subject.moved = methods.method([oldParent, newParent]);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.parentElement, newParent);
});