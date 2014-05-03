module("wipeout.base.itemsControl", {
    setup: function() {
    },
    teardown: function() {
    }
});

var itemsControl = wipeout.base.itemsControl;

testUtils.testWithUtils("constructor", "static constructor", false, function(methods, classes, subject, invoker) {
    // arrange
    var ex = {};
    subject._super = methods.customMethod(function() {
        strictEqual($("#" + arguments[0]).html(), "<div data-bind='itemsControl: null'></div>");
        // exit, we are done
        throw ex;
    });
        
    // act
    try {
        invoker();
    } catch (e) {
        strictEqual(e, ex);
    }
    
    // assert
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = {}, itemTemplateId = {}, model = {};
    subject._super = methods.method([templateId, model]);
    classes.mock("wipeout.base.contentControl.createTemplatePropertyFor", function () {
        methods.method([subject.itemTemplateId, subject])(arguments[0], arguments[1]);
    }, 1);
    
    var mock = wipeout.utils.ko.version()[0] < 3 ? "subscribeV2" : "subscribeV3";
    classes.mock("wipeout.base.itemsControl." + mock, function() {
        strictEqual(this, subject);
    }, 1);
    
    subject.syncModelsAndViewModels = function(){};
    subject.registerDisposable = methods.method();
    
    // act
    invoker(templateId, itemTemplateId, model);
    
    // assert
    strictEqual(subject.itemTemplateId(), itemTemplateId);
    ok(ko.isObservable(subject.itemSource));
    ok(ko.isObservable(subject.items));
});

testUtils.testWithUtils("syncModelsAndViewModels", "null models", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray(null);
    subject.itemSource.subscribe(methods.method());
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.itemSource().length, 2);
    strictEqual(subject.itemSource()[0], m0);
    strictEqual(subject.itemSource()[1], m1);
});

testUtils.testWithUtils("syncModelsAndViewModels", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([{}, {}, {}, {}]);
    subject.itemSource.subscribe(methods.method());
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.itemSource().length, 2);
    strictEqual(subject.itemSource()[0], m0);
    strictEqual(subject.itemSource()[1], m1);
});

testUtils.testWithUtils("modelsAndViewModelsAreSynched", "different lengths", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([m0, m1, {}]);
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    var actual = invoker();
    
    // assert
    ok(!actual);
});

testUtils.testWithUtils("modelsAndViewModelsAreSynched", "different values", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([m0, {}]);
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    var actual = invoker();
    
    // assert
    ok(!actual);
});

testUtils.testWithUtils("modelsAndViewModelsAreSynched", "are synched", false, function(methods, classes, subject, invoker) {
    // arrange
    var m0 = {}, m1 = {};
    subject.itemSource = ko.observableArray([m0, m1]);
    subject.items = ko.observableArray([{model: ko.observable(m0)}, {model: ko.observable(m1)}]);
    
    // act
    var actual = invoker();
    
    // assert
    ok(actual);
});

testUtils.testWithUtils("_itemsChanged", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var added = {}, deleted = {};
    subject.onItemDeleted = methods.method([deleted]);
    subject.onItemRendered = methods.method([added]);
    
    // act
    invoker([{
        status: wipeout.utils.ko.array.diff.deleted, 
        value: deleted }, {
        status: wipeout.utils.ko.array.diff.added, 
        value: added
    }]);
    
    // assert
});

testUtils.testWithUtils("_itemSourceChanged", "should cover all cases", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.items = ko.observableArray([{},{},{},{},{},{},{},{},{}]);
    var result = [subject.items()[2], subject.items()[3], subject.items()[1], subject.items()[8]];
    
    // act
    invoker(ko.utils.compareArrays(subject.items(), result));
    
    // assert
    strictEqual(subject.items().length, 4);
    strictEqual(subject.items()[0], result[0]);
    strictEqual(subject.items()[1], result[1]);
    strictEqual(subject.items()[2], result[2]);
    strictEqual(subject.items()[3], result[3]);
});

testUtils.testWithUtils("onItemDeleted", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var item = {
        dispose: methods.method()
    };
    subject.__woBag = {
        renderedChildren: [{}, {}, item, {}]
    };
    
    // act
    invoker(item);
    
    // assert
    strictEqual(subject.__woBag.renderedChildren.indexOf(item), -1);
});

testUtils.testWithUtils("_createItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var model = {};
    var expected = {
        __woBag: {}
    };
    subject.createItem = methods.method([model], expected);
    
    // act
    var actual = invoker(model);
    
    // assert
    strictEqual(actual, expected);
    ok(actual.__woBag.createdByWipeout);
});

testUtils.testWithUtils("createItem", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var itemTemplateId = {};
    var model = {};
    subject.itemTemplateId = function() { return itemTemplateId; };
    
    // act
    var actual = invoker(model);
    
    // assert
    ok(actual instanceof wipeout.base.view);
    strictEqual(actual.model(), model);
    strictEqual(actual.templateId(), itemTemplateId);
});

testUtils.testWithUtils("reDrawItems", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var model = {};
    var viewModel = {};
    subject.itemSource = ko.observableArray([model]);
    subject.items = ko.observableArray([]);
    subject._createItem = methods.method([model], viewModel);
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.items().length, 1);
    strictEqual(subject.items()[0], viewModel);
});