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

testUtils.testWithUtils("getBindings", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var bindingType = function() { this.bindingMeta = {}; };
    var elements = testUtils.html('<div id="d1">\
    <div id="d2">\
        <div id="d3">\
        </div>\
    </div>\
    <div id="d4">\
        <div id="d5">\
        </div>\
    </div>\
</div>');
    
    var binding1 = new bindingType();
    var binding11 = new bindingType();
    var binding2 = new bindingType();
    var binding3 = new bindingType();
    var binding4 = new bindingType();
    var binding5 = new bindingType();
    
    binding2.bindingMeta.controlsDescendantBindings = true;
    
    wipeout.utils.domData.set(elements["d1"], wipeout.bindings.bindingBase.dataKey, [binding1, binding11]);
    wipeout.utils.domData.set(elements["d2"], wipeout.bindings.bindingBase.dataKey, [binding2, {}]);
    wipeout.utils.domData.set(elements["d3"], wipeout.bindings.bindingBase.dataKey, [binding3]);
    wipeout.utils.domData.set(elements["d4"], wipeout.bindings.bindingBase.dataKey, [binding4]);
    wipeout.utils.domData.set(elements["d5"], wipeout.bindings.bindingBase.dataKey, [binding5]);
    debugger;
    // act
    var bindings = invoker(elements["d1"], bindingType);
    
    // assert
    strictEqual(bindings.length, 5);
    strictEqual(bindings[0], binding1);
    strictEqual(bindings[1], binding11);
    strictEqual(bindings[2], binding2);
    strictEqual(bindings[3], binding4);
    strictEqual(bindings[4], binding5);
});