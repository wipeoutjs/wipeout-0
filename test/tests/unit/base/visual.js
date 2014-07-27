module("wipeout.base.visual", {
    setup: function() {
    },
    teardown: function() {
    }
});

var visual = wipeout.base.visual;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = {};
    subject._super = methods.method();
    
    // act
    invoker(templateId);
    
    // assert
    strictEqual(subject.templateId(), templateId);
    strictEqual(subject.templateItems.constructor, Object);
    strictEqual(subject.__woBag.constructor, Object);
    strictEqual(subject.__woBag.disposables.constructor, Object);
    strictEqual(subject.__woBag.createdByWipeout, false);
    strictEqual(subject.__woBag.rootHtmlElement, null);
    strictEqual(subject.__woBag.routedEventSubscriptions.constructor, Array);
});


testUtils.testWithUtils("constructor", "default template", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = function() {};
    
    // act
    invoker();
    
    // assert
    strictEqual(subject.templateId(), wo.visual.getDefaultTemplateId());
});

testUtils.testWithUtils("disposeOf", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var key = "KLJGLKJBGLKJBG";
    subject.__woBag = {
        disposables: {}
    };
    subject.__woBag.disposables[key] = methods.method()
    
    // act
    invoker(key);
    
    // assert
    ok(!subject.__woBag.disposables[key]);
});

testUtils.testWithUtils("disposeOfAll", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var key = "KLJGLKJBGLKJBG";
    subject.disposeOf = methods.method([key]);
    subject.__woBag = {
        disposables: {}
    };
    subject.__woBag.disposables[key] = true;
    
    // act
    invoker();
    
    // assert
});

testUtils.testWithUtils("registerDisposeCallback", "not function", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    // assert
    throws(function() {
        invoker({});
    });    
});

testUtils.testWithUtils("registerDisposeCallback", "ids and dispose functions", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.__woBag = { disposables: {}};
    function d1(){}
    function d2(){}
    
    // act
    var i1 = parseInt(invoker(d1));
    var i2 = parseInt(invoker(d2));
    
    // assert
    strictEqual(subject.__woBag.disposables[i1], d1);
    strictEqual(subject.__woBag.disposables[i2], d2);
    strictEqual(i1 + 1, i2);
});

testUtils.testWithUtils("registerDisposable", "object, null", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert
    throws(function() {
        invoker();
    });
});

testUtils.testWithUtils("registerDisposable", "object, invalid dispose function", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert
    throws(function() {
        invoker({});
    });
});

testUtils.testWithUtils("registerDisposable", "callback, null", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert
    throws(function() {
        invoker(function(){});
    });
});

testUtils.testWithUtils("registerDisposable", "callback, invalid dispose function", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    // assert
    throws(function() {
        invoker(function(){return {};});
    });
});

testUtils.testWithUtils("registerDisposable", "ok, obj", false, function(methods, classes, subject, invoker) {
    // arrange
    var callback;
    var expected = {};
    subject.registerDisposeCallback = methods.customMethod(function() {
        if(callback) ok(false);
        callback = arguments[0];
        return expected;
    });
    
    var dispose = {
        dispose: methods.method()
    };
    
    // act
    var actual = invoker(dispose);
    
    // assert
    strictEqual(actual, expected);
    callback();
});


testUtils.testWithUtils("registerDisposable", "ok, obj", false, function(methods, classes, subject, invoker) {
    // arrange
    var callback;
    var expected = {};
    subject.registerDisposeCallback = methods.customMethod(function() {
        if(callback) ok(false);
        callback = arguments[0];
        return expected;
    });
    
    var dispose = function() {
        return {
            dispose: methods.method()
        };
    };
    
    // act
    var actual = invoker(dispose);
    
    // assert
    strictEqual(actual, expected);
    callback();
});

testUtils.testWithUtils("entireViewModelHtml", "no html", false, function(methods, classes, subject, invoker) {
    // arrange    
    subject.__woBag = {};
    
    // act
    var actual = invoker();
    
    // assert
    strictEqual(actual.length, 0);
});

testUtils.testWithUtils("entireViewModelHtml", "element", false, function(methods, classes, subject, invoker) {
    // arrange    
    subject.__woBag = {
        rootHtmlElement: {
            nodeType: 1,
            nextSibling: {}
        }
    };
    
    // act
    var actual = invoker();
    
    // assert
    strictEqual(actual.length, 1);
    strictEqual(actual[0], subject.__woBag.rootHtmlElement);
});

testUtils.testWithUtils("entireViewModelHtml", "virtual element", false, function(methods, classes, subject, invoker) {
    // arrange    
    var $dom = $("<!-- ko --><div>inner</div>hello<!-- a comment --><!-- /ko -->");
    subject.__woBag = {
        rootHtmlElement: $dom[0]
    };
    
    // act
    var actual = invoker();
    
    // assert
    strictEqual(actual.length, $dom.length);
    for(var i = 0; i < $dom.length; i++) {
        strictEqual(actual[i], $dom[i]);
    }
});

testUtils.testWithUtils("entireViewModelHtml", "virtual elements", false, function(methods, classes, subject, invoker) {
    // arrange    
    var $dom = $("<!-- ko --><div>inner</div>hello<!-- a comment --><!-- ko --><div>something</div><!-- /ko --><!-- /ko -->");
    subject.__woBag = {
        rootHtmlElement: $dom[0]
    };
    
    // act
    var actual = invoker();
    
    // assert
    strictEqual(actual.length, 7);
    strictEqual(actual[0], $dom[0]);
    strictEqual(actual[1], $dom[1]);
    strictEqual(actual[2], $dom[2]);
    strictEqual(actual[3], $dom[3]);
    strictEqual(actual[4], $dom[4]);
    strictEqual(actual[5], $dom[6]);
    strictEqual(actual[6], $dom[7]);
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.c1 = ko.computed(function() { return {}; });
    subject.c1.dispose = methods.method();
    subject.c2 = ko.computed(function() { return {}; });
    subject.c2.dispose = methods.method();
    
    subject.__woBag = {
        routedEventSubscriptions: [
            {dispose: methods.method()},
            {dispose: methods.method()}
        ],
        disposed: {
            trigger: methods.method()
        }
    };
    
    // act
    invoker();
    
    // assert
    ok(!subject.__woBag.routedEventSubscriptions.length);
});

testUtils.testWithUtils("getParent", "don't include shareParentScope", false, function(methods, classes, subject, invoker) {
    // arrange
    var expected = {};
    var parentElement = {};
    classes.mock("wipeout.utils.ko.parentElement", function() {
        strictEqual(arguments[0], subject.__woBag.rootHtmlElement);
        return parentElement;
    }, 1);
    
    classes.mock("wipeout.utils.html.getViewModel", function() {
        strictEqual(arguments[0], parentElement);
        return {
            shareParentScope: true,
            getParent: function() {
                ok(!arguments[0]);
                return expected;
            }
        };
    });
    
    subject.__woBag = {
        rootHtmlElement: {}
    };
    
    // act
    var actual = invoker(false);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("getParent", "include shareParentScope", false, function(methods, classes, subject, invoker) {
    // arrange
    var expected = {};
    var parentElement = {};
    classes.mock("wipeout.utils.ko.parentElement", function() {
        strictEqual(arguments[0], subject.__woBag.rootHtmlElement);
        return parentElement;
    }, 1);
    
    classes.mock("wipeout.utils.html.getViewModel", function() {
        strictEqual(arguments[0], parentElement);
        return expected;
    });
    
    subject.__woBag = {
        rootHtmlElement: {}
    };
    
    // act
    var actual = invoker(false);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("unRegisterRoutedEvent", "no event", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.__woBag = {
        routedEventSubscriptions: []
    };
    
    // act
    var actual = invoker();
    
    // assert
    ok(!actual);
});

testUtils.testWithUtils("unRegisterRoutedEvent", "no event", false, function(methods, classes, subject, invoker) {
    // arrange
    var callback = {};
    var context = {};
    var routedEvent = {};
    subject.__woBag = {
        routedEventSubscriptions: [
            {
                routedEvent: routedEvent,
                event: {
                    unRegister: methods.method([callback, context])
                }
            }
        ]
    };
    
    // act
    var actual = invoker(routedEvent, callback, context);
    
    // assert
    ok(actual);
});

testUtils.testWithUtils("registerRoutedEvent", "event exists", false, function(methods, classes, subject, invoker) {
    // arrange
    var expected = {};
    var callback = {};
    var context = {};
    var routedEvent = {};
    subject.__woBag = {
        routedEventSubscriptions: [
            {
                routedEvent: routedEvent,
                event: {
                    register: methods.method([callback, context], expected)
                }
            }
        ]
    };
    
    // act
    var actual = invoker(routedEvent, callback, context);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("registerRoutedEvent", "new event", false, function(methods, classes, subject, invoker) {
    // arrange
    var expected = {};
    function callback() {};
    var context = {};
    var routedEvent = {};
    subject.__woBag = {
        routedEventSubscriptions: []
    };
    
    // act
    var actual = invoker(routedEvent, callback, context);
    
    // assert
    strictEqual(subject.__woBag.routedEventSubscriptions.length, 1);
    strictEqual(actual.dispose.constructor, Function);
});

testUtils.testWithUtils("triggerRoutedEvent", "no test here. see integration tests instead", false, function(methods, classes, subject, invoker) {
    // arrange
    ok(true);
});

testUtils.testWithUtils("getDefaultTemplateId", null, true, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    var id1 = invoker();
    var id2 = invoker();
    
    // assert
    strictEqual(id1, id2);
    strictEqual($("#" + id1)[0].tagName.toLowerCase(), "script");
    strictEqual($("#" + id1).html(), "<span>No template has been specified</span>");
});

testUtils.testWithUtils("getBlankTemplateId", null, true, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    var id1 = invoker();
    var id2 = invoker();
    
    // assert
    strictEqual(id1, id2);
    strictEqual($("#" + id1)[0].tagName.toLowerCase(), "script");
    strictEqual($("#" + id1).html(), "");
});