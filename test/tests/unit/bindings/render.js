module("wipeout.bindings.render", {
    setup: function() {
    },
    teardown: function() {
    }
});

var render = wipeout.bindings.render;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var element = {}, value = ko.observable({}), allBindingsAccessor = {}, bindingContext = {}, va = {}, meta = {};
    subject._super = methods.method([element]);
    subject.element = element;
    classes.mock("wipeout.bindings.render.createValueAccessor", function() {
        strictEqual(arguments[0], value);
        return va;
    }, 1);
    
    classes.mock("ko.bindingHandlers.template.init", function() {
        methods.method.call(methods, arguments)(element, va, allBindingsAccessor, null, bindingContext);
        return meta;
    }, 1);
    
    // act
    invoker(element, value, allBindingsAccessor, bindingContext);    
    
    // assert
    strictEqual(subject.bindingMeta, meta);
    strictEqual(subject.allBindingsAccessor, allBindingsAccessor);
    strictEqual(subject.bindingContext, bindingContext);
    
    // - template changed callback
    
    // arrange again
    var newVal = {};
    subject.reRender = methods.method([newVal]);
    
    // act
    // assert
    value(newVal);
});

testUtils.testWithUtils("dispose", null, false, function(methods, classes, subject, invoker) {
    // arrange
    subject.unRender = methods.method();
    subject._super = methods.method();
    subject.subscribed = {dispose: methods.method()};
    
    // act
    invoker();
    
    // assert
    ok(!subject.subscribed);
});

testUtils.testWithUtils("reRender", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var val = {};
    subject.unRender = methods.method();
    subject.render = methods.method([val]);
    
    // act
    // assert
    invoker(val);
});


testUtils.testWithUtils("unRender", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var events = {
        sub: {},
        dis: {}
    };
    
    var element = {};
    wipeout.utils.domData.set(element, wipeout.bindings.wipeout.utils.wipeoutKey, {}); 
    
    var val = {
        onUnrender: methods.method(),
        __woBag: {
            rootHtmlElement: element
        },
        disposeOf: methods.customMethod(function() {
            wo.obj.enumerate(events, function(item, i) {
                var _ok = false;
                if(events[i] === item) {
                    delete events[i];
                    _ok = true;
                }
                
                ok(_ok);
            });
        })
    };
    
    subject.unTemplate = methods.method();
    subject.onDisposeEventSubscription = events.dis;
    subject.templateChangedSubscription = events.sub;
    subject.value = val;
    
    // act
    invoker();
    
    // assert
    ok(!wipeout.utils.domData.get(element, wipeout.bindings.wipeout.utils.wipeoutKey)); 
    ok(!val.__woBag.rootHtmlElement);
    ok(!subject.onDisposeEventSubscription);
    ok(!subject.value);
    ok(!subject.templateChangedSubscription);
    wo.obj.enumerate(events, function(item, i) {
        ok(false, i + " was not disposed");
    });
});

testUtils.testWithUtils("render", "already rendering or not a visual", false, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    throws(function() {
        invoker({});
    });    
    
    subject.value = {};    
    throws(function() {
        invoker();
    });    
    
    delete subject.value;
    subject.templateChangedSubscription = {};    
    throws(function() {
        invoker();
    });    
});

testUtils.testWithUtils("render", "not a visual", false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = "sadsadsadsadsd";
    var val = new wo.visual(templateId);
    subject.element = {};
    subject.unRender = {};
    subject.onTemplateChanged = methods.method([templateId]);
    val.__woBag.disposed.register = methods.method([subject.unRender, subject], {dispose: methods.method()});
    val.templateId.subscribe = methods.method([subject.onTemplateChanged, subject], {dispose: methods.method()});    
    
    // act
    invoker(val);
    
    // assert
    strictEqual(wipeout.utils.domData.get(subject.element, wipeout.bindings.wipeout.utils.wipeoutKey), val);
    strictEqual(subject.value.__woBag.rootHtmlElement, subject.element);
    ok(subject.onDisposeEventSubscription);
    ok(subject.templateChangedSubscription);
    
    // act, ensure disposal works
    val.disposeOf(subject.onDisposeEventSubscription);
    val.disposeOf(subject.templateChangedSubscription);
});

testUtils.testWithUtils("render", "not a visual", false, function(methods, classes, subject, invoker) {
    // arrange
    var templateId = "sadsadsadsadsd";
    var val = new wo.visual(templateId);
    subject.element = {};
    subject.unRender = {};
    subject.onTemplateChanged = methods.method([templateId]);
    val.__woBag.disposed.register = methods.method([subject.unRender, subject], {dispose: methods.method()});
    val.templateId.subscribe = methods.method([subject.onTemplateChanged, subject], {dispose: methods.method()});    
    
    // act
    invoker(val);
    
    // assert
    strictEqual(wipeout.utils.domData.get(subject.element, wipeout.bindings.wipeout.utils.wipeoutKey), val);
    strictEqual(subject.value.__woBag.rootHtmlElement, subject.element);
    ok(subject.onDisposeEventSubscription);
    ok(subject.templateChangedSubscription);
    
    // act, ensure disposal works
    val.disposeOf(subject.onDisposeEventSubscription);
    val.disposeOf(subject.templateChangedSubscription);
});

testUtils.testWithUtils("unTemplate", null, false, function(methods, classes, subject, invoker) {
    // arrange
    $("#qunit-fixture").html('<div id="root"><div id="el1"></div><div id="el2"></div></div>');
    var root = $("#root")[0];
    var el1 = $("#el1")[0];
    var el2 = $("#el2")[0];
    
    subject.element = root;
    subject.value = {
        templateItems: {i1:{}},
        __woBag: {
            nodes: [{}]
        }
    };
    
    classes.mock("wipeout.utils.html.cleanNode", function(node) { node.__cleaned = true; });
    
    // act
    invoker();
    
    // assert
    ok(!el1.parentElement);
    ok(!el2.parentElement);
    ok(el1.__cleaned);
    ok(el2.__cleaned);
    strictEqual(subject.value.__woBag.nodes.length, 0);
    
    wo.obj.enumerate(subject.value.templateItems, function(item, i) {
        ok(false, i + " still exists");
    });
});

testUtils.testWithUtils("onTemplateChanged", "no async", false, function(methods, classes, subject, invoker) {
    // arrange
    wipeout.settings.asynchronousTemplates = false;
    
    subject.element = {};
    subject.unTemplate = methods.method();
    subject.value = {
        templateId: ko.observable({})
    };
    subject.doRendering = methods.method();
    
    // act
    invoker(subject.value.templateId());
    
    // assert
});

testUtils.testWithUtils("onTemplateChanged", "async", false, function(methods, classes, subject, invoker) {
    // arrange
    var placeholder = {};
    wipeout.settings.asynchronousTemplates = true;
    classes.mock("ko.virtualElements.prepend", function() {
        strictEqual(arguments[0], subject.element);
        strictEqual(arguments[1], placeholder);
    }, 1);
    classes.mock("wipeout.utils.html.createTemplatePlaceholder", function() {
        strictEqual(arguments[0], subject.value);
        return placeholder;
    }, 1);
    classes.mock("wipeout.template.asyncLoader.instance.load", function() {
        strictEqual(arguments[0], subject.value.templateId());
        arguments[1]();
    }, 1);
    
    subject.element = {};
    subject.unTemplate = methods.method();
    subject.value = {
        templateId: ko.observable({})
    };
    subject.doRendering = methods.method();
    
    // act
    invoker(subject.value.templateId());
    
    // assert
});

testUtils.testWithUtils("doRendering", null, false, function(methods, classes, subject, invoker) {
    var va = {}, wot = {};
    subject.element = {};
    subject.value = ko.observable({});
    subject.bindingContext = {};
    subject.allBindingsAccessor = function() {
        return {"wipeout-type":wot};
    };
    
    classes.mock("wipeout.bindings.render.createValueAccessor", function() {
        strictEqual(arguments[0], subject.value);
        return va;
    }, 1);
    
    classes.mock("ko.bindingHandlers.template.update", function() {
        methods.method.call(methods, arguments)(subject.element, va, subject.allBindingsAccessor, null, subject.bindingContext);
    }, 1);
    
    classes.mock("wipeout.bindings.wipeout-type.utils.comment", function() {
        strictEqual(arguments[0], subject.element);
        strictEqual(arguments[1], wot);
    }, 1);
    
    // act
    invoker();    
    
    // assert
});

testUtils.testWithUtils("init", null, true, function(methods, classes, subject, invoker) {
    // arrange
    var element = {}, allBindingsAccessor = {}, bindingContext = {}, meta = {};
    var value = {};
    var valueAccessor = function() {
        return value;
    };
    
    classes.mock("wipeout.bindings.render", function() {
        methods.method.call(methods, arguments)(element, value, allBindingsAccessor, bindingContext);
        
        this.render = methods.method([value]);
        this.bindingMeta = meta;
    });
    
    // act
    var output = invoker(element, valueAccessor, allBindingsAccessor, null, bindingContext);
    
    // assert
    strictEqual(output, meta);
});

testUtils.testWithUtils("createValueAccessor", "invalid value", true, function(methods, classes, subject, invoker) {
    // arrange
    
    
    // act
    var output = invoker({})();
    
    // assert
    strictEqual(output.name, wipeout.base.visual.getBlankTemplateId());
});

testUtils.testWithUtils("createValueAccessor", "value, shareParentScope", true, function(methods, classes, subject, invoker) {
    // arrange
    // act   
    // assert
    testCreateValueAccessor(methods, classes, subject, invoker, true);
});

testUtils.testWithUtils("createValueAccessor", "value, !shareParentScope", true, function(methods, classes, subject, invoker) {
    // arrange
    // act   
    // assert
    testCreateValueAccessor(methods, classes, subject, invoker, false);
});

var testCreateValueAccessor = function(methods, classes, subject, invoker, shareParentScope) {
    // arrange
    var nodes = ["sadet5yad","das3sad3e"], nn = ["dadtgsadr", "asdsad"];
    var value = new wo.visual("KJBKJBKJB");
    value.shareParentScope = shareParentScope;
    value.__woBag.nodes.push(nodes[0], nodes[1]);
    
    // act
    var output = invoker(value)();
    
    // assert
    strictEqual(output.templateEngine, wipeout.template.engine.instance);
    strictEqual(output.name, value.templateId());
    strictEqual(output.data, shareParentScope ? undefined : value);
    
    
    // arrange
    value.onRendered = function(oldNodes, newNodes) {
        deepEqual(nodes, oldNodes);
        deepEqual(newNodes, nn);
    };
    
    // act
    output.afterRender(nn);
    deepEqual(value.__woBag.nodes, nn);
};