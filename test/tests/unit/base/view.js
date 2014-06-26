module("wipeout.base.view", {
    setup: function() {
    },
    teardown: function() {
    }
});

var view = wipeout.base.view;

testUtils.testWithUtils("binding subscriptions one way", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var view = new wo.view();
    view.prop = ko.observable();
    
    var obs = ko.observable();
    
    view.bind("prop", function() { return obs; }, false);
    
    var props = [];
    view.prop.subscribe(function() {
        props.push(arguments[0]);
    });
    
    var obss = [];
    obs.subscribe(function() {
        obss.push(arguments[0]);
    });
    
    
    // act
    view.prop(1);
    obs(2);
    view.prop(3);
    obs(4);
    view.prop(5);
    obs(6);
    view.prop(7);
    
    // assert
    deepEqual(props, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(obss, [2, 4, 6]);
});

testUtils.testWithUtils("binding subscriptions two way", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var view = new wo.view();
    view.prop = ko.observable();
    
    var obs = ko.observable();
    
    view.bind("prop", function() { return obs; }, true);
    
    var props = [];
    view.prop.subscribe(function() {
        props.push(arguments[0]);
    });
    
    var obss = [];
    obs.subscribe(function() {
        obss.push(arguments[0]);
    });
    
    
    // act
    view.prop(1);
    obs(2);
    view.prop(3);
    obs(4);
    view.prop(5);
    obs(6);
    view.prop(7);
    
    // assert
    deepEqual(props, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(obss, [1, 2, 3, 4, 5, 6, 7]);
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = {};
    var model = {};
    subject.__woBag = {};
    subject._super = methods.method([templateId]);
    subject.registerDisposable = methods.customMethod();
    
    // act
    invoker(templateId, model);
    
    // assert    
    strictEqual(subject.model(), model);
    strictEqual(subject.__woBag.bindings.constructor, Object);
    
    // test on model changed
    var newModel = {};
    subject._onModelChanged = methods.method([model, newModel]);
    subject.model(newModel);
});

testUtils.testWithUtils("setObservable", "non observable", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj = {
        val: null
    };
    
    var val = {};
    
    // act
    invoker(obj, "val", val);
    
    // assert    
    strictEqual(obj.val, val);
});

testUtils.testWithUtils("setObservable", "observable", true, function(methods, classes, subject, invoker) {
    // arrange
    var obj = {
        val: ko.observable()
    };
    
    var val = {};
    
    // act
    invoker(obj, "val", val);
    
    // assert    
    strictEqual(obj.val(), val);
});
    

testUtils.testWithUtils("disposeOfBinding", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.__woBag = {
        bindings: {
            propertyName: {
                dispose: methods.method([])
            }
        }
    };
    
    // act
    invoker("propertyName");
    
    // assert    
});
   

testUtils.testWithUtils("dispose", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    subject.__woBag = {
        "wipeout.base.view.modelRoutedEvents": {},
        bindings: {
            blabla: {}
        }
    };
    subject.disposeOf = methods.method([subject.__woBag["wipeout.base.view.modelRoutedEvents"]]);
    subject.disposeOfBinding = methods.method(["blabla"]);
    
    // act
    invoker();
    
    // assert    
    ok(!subject.__woBag["wipeout.base.view.modelRoutedEvents"]);
});

testUtils.testWithUtils("elementHasModelBinding", "no model", true, function(methods, classes, subject, invoker) {
    // arrange
    var element = new DOMParser().parseFromString("<root></root>", "application/xml").documentElement;
    
    // act
    var actual = invoker(element);
    
    // assert
    ok(!actual);
});    

testUtils.testWithUtils("elementHasModelBinding", "model as attribute", true, function(methods, classes, subject, invoker) {
    // arrange
    var element = new DOMParser().parseFromString("<root model='asdsad'></root>", "application/xml").documentElement;
    
    // act
    var actual = invoker(element);
    
    // assert
    ok(actual);
});      

testUtils.testWithUtils("elementHasModelBinding", "model as element", true, function(methods, classes, subject, invoker) {
    // arrange
    var element = new DOMParser().parseFromString("<root><model /></root>", "application/xml").documentElement;
    
    // act
    var actual = invoker(element);
    
    // assert
    ok(actual);
});

testUtils.testWithUtils("initialize", "more of an integration test than a unit test", false, function(methods, classes, subject, invoker) {
    // arrange
    var bindingContext = new ko.bindingContext({
            model: ko.observable({}),
            twProperty: ko.observable({}),
            owProperty: {}
        }, null);
    
    var subject = new wo.view();
    subject.twProp = ko.observable();
    
    var element = new DOMParser().parseFromString(
'<root shareParentScope="false" twProp-tw="$parent.twProperty" owProp="$parent.owProperty">\
    <inlinePropString>Hello</inlinePropString>\
    <inlinePropParser constructor="int">22</inlinePropParser>\
    <inlinePropConstructor constructor="Array"></inlinePropConstructor>\
</root>', "application/xml").documentElement;
    
    // act
    subject._initialize(element, bindingContext);
    
    // assert
    strictEqual(subject.__woBag.type, "root");
    strictEqual(subject.shareParentScope, false);
    strictEqual(subject.model(), bindingContext.$data.model());
    strictEqual(subject.twProp(), bindingContext.$data.twProperty());
    strictEqual(subject.owProp, bindingContext.$data.owProperty);
    strictEqual(subject.inlinePropString, "Hello");
    strictEqual(subject.inlinePropParser, 22);
    strictEqual(subject.inlinePropConstructor.constructor, Array);
});
    
testUtils.testWithUtils("objectParser", "all but json", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert   
    strictEqual(view.objectParser.string("aval"), "aval");
    strictEqual(view.objectParser.bool(" tRue "), true);
    strictEqual(view.objectParser.int(" 44 "), 44);
    strictEqual(view.objectParser.float(" 44.55 "), 44.55);
    ok(view.objectParser.regexp("^Hello$").test("Hello"));
    strictEqual(view.objectParser.date("2012/01/01") - new Date("2012/01/01"), 0);
});
    
testUtils.testWithUtils("objectParser", "json", false, function(methods, classes, subject, invoker) {
    // arrange
    // act    
    var json = view.objectParser.json('{"val1":8,"val2":"3"}')
    
    // assert   
    strictEqual(json.val1, 8);
    strictEqual(json.val2, "3");
});

testUtils.testWithUtils("_onModelChanged", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.__woBag = {
        "wipeout.base.view.modelRoutedEvents": {}
    };
    var disposable = {};
    var newVal = new wipeout.base.routedEventModel();
    subject.disposeOf = methods.method([subject.__woBag["wipeout.base.view.modelRoutedEvents"]]);
    subject.registerDisposable = methods.customMethod(function() {
        return disposable;
    });
    subject.onModelRoutedEvent = function(){};
    subject.onModelChanged = methods.method([null, newVal]);
    
    // act
    invoker(null, newVal);
    
    // assert   
    strictEqual(subject.__woBag["wipeout.base.view.modelRoutedEvents"], disposable);
});

testUtils.testWithUtils("onModelRoutedEvent", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var eventArgs = {
        routedEvent: new wipeout.base.routedEvent(),
        eventArgs: {}
    };
    
    subject.triggerRoutedEvent = methods.method([eventArgs.routedEvent, eventArgs.eventArgs]);
    
    // act
    invoker(eventArgs);
    
    // assert    
});