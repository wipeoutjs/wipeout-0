module("wipeout.template.engine", {
    setup: function() {
    },
    teardown: function() {
    }
});

var engine = wipeout.template.engine;

testUtils.testWithUtils("constructor", "with prototype, instance and static vals", false, function(methods, classes, subject, invoker) {
    // arrange
    // act - smoke test (no logic)
    invoker();
    
    //assert
    strictEqual(engine.prototype.constructor, ko.templateEngine);
    strictEqual(engine.scriptCache.constructor, Object);
    ok(engine.openCodeTag);
    ok(engine.closeCodeTag);
    ok(engine.instance.constructor);
});


testUtils.testWithUtils("scriptHasBeenReWritten", "", false, function(methods, classes, subject, invoker) {
    // arrange
    // act    
    //assert
    ok(engine.scriptHasBeenReWritten.test(engine.openCodeTag + "32423432" + engine.closeCodeTag));
    ok(!engine.scriptHasBeenReWritten.test("435435"));
    ok(!engine.scriptHasBeenReWritten.test("asdsd"));
    ok(!engine.scriptHasBeenReWritten.test(engine.openCodeTag + "3242s3432" + engine.closeCodeTag));
});

testUtils.testWithUtils("createJavaScriptEvaluatorFunction", "with bindingContext", true, function(methods, classes, subject, invoker) {
    // arrange    
    var val = {};
    
    // act    
    var actual = invoker("something")({something: val, $data:{}});
    
    //assert
    strictEqual(actual, val);
});

testUtils.testWithUtils("createJavaScriptEvaluatorFunction", "with bindingContext.$data", true, function(methods, classes, subject, invoker) {
    // arrange    
    var val = {};
    
    // act    
    var actual = invoker("something")({something: {}, $data:{something: val}});
    
    //assert
    strictEqual(actual, val);
});

testUtils.testWithUtils("createJavaScriptEvaluatorBlock", "Function", true, function(methods, classes, subject, invoker) {
    // arrange
    var id = "KJBKJBKJB";
    classes.mock("wipeout.template.engine.newScriptId", function() { return id; }, 1);
    function script() { }
    
    // act    
    var actual = invoker(script);
    
    //assert
    strictEqual(actual, engine.openCodeTag + id + engine.closeCodeTag);
    strictEqual(script, engine.scriptCache[id]);
});

testUtils.testWithUtils("createJavaScriptEvaluatorBlock", "String", true, function(methods, classes, subject, invoker) {
    // arrange
    var id = "KJBKJBKJB";
    classes.mock("wipeout.template.engine.newScriptId", function() { return id; }, 1);
    var val = {Hello: {}, $data: {}};
    
    // act    
    var actual = invoker("Hello");
    
    //assert
    strictEqual(actual, engine.openCodeTag + id + engine.closeCodeTag);
    strictEqual(val.Hello, engine.scriptCache[id](val));
});

testUtils.testWithUtils("createJavaScriptEvaluatorBlock", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var script = {};
    var expected = {};
    classes.mock("wipeout.template.engine.createJavaScriptEvaluatorBlock", function() { 
        strictEqual(arguments[0], script);
        return expected;
    }, 1);
    
    // act    
    var actual = invoker(script);
    
    //assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("rewriteTemplate", "script is not HTMLElement", false, function(methods, classes, subject, invoker) {
    // arrange
    var arg1 = {}, arg2 = {},arg3 = {};
    classes.mock("ko.templateEngine.prototype.rewriteTemplate", function() {
        methods.method([arg1, arg2, arg3]).apply(null, arguments);
    });
    
    // act    
    invoker(arg1, arg2, arg3);
    
    //assert
});

testUtils.testWithUtils("rewriteTemplate", "is HTMLElement, script has been reWritten", false, function(methods, classes, subject, invoker) {
    // arrange
    var id = "LKJBGKJBKJBKJ", arg2 = {}, arg3 = {};
    var content = engine.openCodeTag + 123 + engine.closeCodeTag;
    $("#qunit-fixture").html("<script id='" + id + "'>" + content + "</script>");
    subject.makeTemplateSource = methods.method([id, arg3], {
        data: methods.method(["isRewritten", true])
    });
    
    subject.wipeoutRewrite = methods.method([$("#" + id)[0], arg2]);
    
    // act
    invoker(id, arg2, arg3);
    
    //assert
});

testUtils.testWithUtils("wipeoutRewrite", "html only", true, function(methods, classes, subject, invoker) {
    // arrange
    var data = "<div><span data-bind=\"html: xxx\"/></div>";
    var element = new DOMParser().parseFromString(data, "application/xml").documentElement;
    
    // act    
    invoker(element);
    
    //assert
    strictEqual(element.nodeName, "div");
    strictEqual(element.attributes.length, 0);
    strictEqual(element.childNodes.length, 1);
    strictEqual(element.firstChild.nodeName, "span");
    strictEqual(element.firstChild.attributes.length, 1);
    strictEqual(element.firstChild.childNodes.length, 0);
    strictEqual(element.firstChild.getAttribute("data-bind"), "html: xxx");
});

testUtils.testWithUtils("wipeoutRewrite", "custom tag", true, function(methods, classes, subject, invoker) {
    // arrange
    var data = "<div><my.tag/></div>";
    var element = new DOMParser().parseFromString(data, "application/xml").documentElement;
    var rewriter = methods.customMethod(function() {
        return arguments[0];
    });
    
    // act    
    invoker(element, rewriter);
    
    //assert
    ok(/^<div><!-- ko wipeout-type: 'my.tag', wo: [0-9]+ --><!-- \/ko --><\/div>$/.test(new XMLSerializer().serializeToString(element)));
});

testUtils.testWithUtils("wipeoutRewrite", "render script logic, invalid vm type", true, function(methods, classes, subject, invoker) {
    // arrange
    window.my = {
        tag: function() {}
    };
    var element = new DOMParser().parseFromString("<div><my.tag/></div>", "application/xml").documentElement;
    invoker(element, function(){ return arguments[0]; });
    var data = new XMLSerializer().serializeToString(element).substring("<div><!-- ko wipeout-type: 'my.tag', wo: ".length);
    data = data.substring(0, data.length - " --><!-- /ko --></div>".length);
    
    ok(engine.scriptCache[data]);
    
    // act   
    // assert
    throws(function() {
        engine.scriptCache[data](bindingContext);
    });
    
    delete window.my;
});

testUtils.testWithUtils("wipeoutRewrite", "render script logic", true, function(methods, classes, subject, invoker) {
    // arrange
    window.my = {
        tag: wo.view.extend(function() { 
            this._super();
            this.initialize = methods.method([configTag, bindingContext]);
            vm = this;
        })
    };
    var vm;
    var id = {};
    var bindingContext = {};
    var element = new DOMParser().parseFromString("<div><my.tag/></div>", "application/xml").documentElement;
    var configTag = element.firstElementChild;
    invoker(element, function(){ return arguments[0]; });
    var data = new XMLSerializer().serializeToString(element).substring("<div><!-- ko wipeout-type: 'my.tag', wo: ".length);
    data = data.substring(0, data.length - " --><!-- /ko --></div>".length);
    classes.mock("wipeout.template.engine.getId", function() {
        strictEqual(arguments[0], configTag);
        return id;
    });
    
    ok(engine.scriptCache[data]);
    
    // act    
    var actual = engine.scriptCache[data](bindingContext);
    
    // assert
    strictEqual(actual.vm, vm);
    strictEqual(actual.id, id);
    
    delete window.my;
});  
     

testUtils.testWithUtils("getId", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var expected = "KJBKJBKJB";
    var element = new DOMParser().parseFromString("<div id='" + expected + "'></div>", "application/xml").documentElement;
    
    // act    
    var actual = invoker(element);
    
    //assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("wipeoutRewrite", "invalid xml", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    //assert
    throws(function() {
        invoker({textContent:"<ASDASDASD>"});
    });
    
});

testUtils.testWithUtils("wipeoutRewrite", "element and comment", false, function(methods, classes, subject, invoker) {
    // arrange
    var html = "<div/><!-- hello -->";
    var input = {textContent:html};
    var rewriter = {};
    classes.mock("wipeout.template.engine.wipeoutRewrite", function() {
        strictEqual(arguments[0].nodeName, "div");
        strictEqual(arguments[0].attributes.length, 0);
        strictEqual(arguments[0].childNodes.length, 0);
        strictEqual(arguments[1], rewriter);
        return arguments[0];
    });
    
    // act  
    invoker(input, rewriter);
    
    //assert
    ok(/^<div\s*\/><!-- hello -->$/.test(input.textContent));
});

testUtils.testWithUtils("renderTemplateSource", "not wo.view", false, function(methods, classes, subject, invoker) {
    // arrange
    
    // act    
    var actual = invoker(null, {});
    
    //assert
    strictEqual(actual.constructor, Array);
    strictEqual(actual.length, 0);
});

testUtils.testWithUtils("renderTemplateSource", "", false, function(methods, classes, subject, invoker) {
    // arrange
    var text = {};
    var expected = {};
    var htmlBuilder;
    var bindingContext = {$data: new wo.view()};
    classes.mock("wipeout.template.htmlBuilder", function() {
        htmlBuilder = this;
        strictEqual(arguments[0], text);
        this.render = methods.method([bindingContext], expected);
    });
    
    var templateSource = {
        data: methods.customMethod(function() {
            strictEqual(arguments[0], "precompiled");
            if(arguments.length > 1)
                strictEqual(arguments[1], htmlBuilder);
            
            return null;
        }),
        text: function() {
            return text;
        }
    };
    
    // act    
    var actual = invoker(templateSource, bindingContext);
    
    //assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("newScriptId", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var base = parseInt(invoker());
    
    // act        
    //assert
    strictEqual(parseInt(invoker()), base + 1);
    strictEqual(parseInt(invoker()), base + 2);
    strictEqual(parseInt(invoker()), base + 3);
    strictEqual(parseInt(invoker()), base + 4);
    strictEqual(parseInt(invoker()), base + 5);
});