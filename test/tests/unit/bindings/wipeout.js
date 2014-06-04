module("wipeout.bindings.wipeout", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "invalid view 1", false, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    throws(function() {
        invoker(null, {});
    });
});

testUtils.testWithUtils("constructor", "invalid view 2", false, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    throws(function() {
        invoker(null, function(){});
    });
});

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var viewType= wo.view.extend(function() { 
        this._super(); 
        if(view) 
            ok(false, "2 views created"); 
        view = this; 
        this.onApplicationInitialized = methods.method();
    });
    var element = {}, aba = {}, vm = {}, bc = {}, view = null;
    subject._super = methods.dynamicMethod(function() { ok(view); return [element, view, aba, bc]; });
    subject.render = methods.dynamicMethod(function() { ok(view); return [view]; });
    
    // act
    invoker(element, viewType, aba, vm, bc);    
    
    // assert
    ok(view);
    ok(subject.renderedView instanceof viewType);
    strictEqual(view.model(), vm);
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    subject.renderedView = {
        dispose: methods.method()
    };
    
    // act
    invoker();
    
    // assert
});

testUtils.testWithUtils("init", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var element = {}, valueAccessor = {}, allBindingsAccessor = {}, viewModel = {}, bindingContext = {}, meta = {};
    classes.mock("wipeout.bindings.wipeout", function() {
        methods.method.call(methods, arguments)(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
        this.bindingMeta = meta;
    }, 1);
    
    // act
    var output = invoker(element, function() { return valueAccessor; }, allBindingsAccessor, viewModel, bindingContext);
    
    // assert
    strictEqual(output, meta);
});