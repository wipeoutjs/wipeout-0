module("wipeout.utils.find", {
    setup: function() {
    },
    teardown: function() {
    }
});

var find = wipeout.utils.find;

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._super = methods.method();
    var ctxt = {};
    
    // act
    invoker(ctxt);
    
    // assert    
    strictEqual(ctxt, subject.bindingContext);
});

testUtils.testWithUtils("find", "no filters", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$number, 0);
    });
    
    // act
    invoker();
    
    // assert
});

testUtils.testWithUtils("find", "filters, no index", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$number, 0);
    });
    
    // act
    invoker(null, {});
    
    // assert
});

testUtils.testWithUtils("find", "filters, $i instanceOf", false, function(methods, classes, subject, invoker) {
    // arrange
    var i = 11;
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$instanceOf, i);
        strictEqual(filters.$, undefined);
    });
    
    // act
    invoker(null, {$i: i});
    
    // assert
});

testUtils.testWithUtils("find", "type search term", false, function(methods, classes, subject, invoker) {
    // arrange
    function x(){};
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$type, x);
    });
    
    // act
    invoker(x);
    
    // assert
});

testUtils.testWithUtils("find", "filters search term", false, function(methods, classes, subject, invoker) {
    // arrange
    var hello = "LKBLKJBLKJBLKJB";
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.aa, hello);
    });
    
    // act
    invoker({aa: hello});
    
    // assert
});

testUtils.testWithUtils("find", "ancestry search term", false, function(methods, classes, subject, invoker) {
    // arrange
    var hello = "zfgzhzfhzxfghxhnnxgn";
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$ancestry, hello);
    });
    
    // act
    invoker(hello);
    
    // assert
});

testUtils.testWithUtils("create", "smoke test", true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    invoker({})();    
    ok(true);
});

testUtils.testWithUtils("regex", "", true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    // assert
    ok(find.regex.ancestors.test("greatgreatgreatgrandparent"));
    ok(find.regex.ancestors.test("grandparent"));
    ok(find.regex.ancestors.test("parent"));
    ok(!find.regex.ancestors.test("grandgrandparent"));
    ok(!find.regex.ancestors.test("grandparentparent"));
    
    ok(find.regex.great.test("great"));
    ok(find.regex.grand.test("grand"));
});

testUtils.testWithUtils("$ancestry", "", true, function(methods, classes, subject, invoker) {
    // arrange    
    // act
    // assert
    strictEqual(invoker(null, "greatparent"), false);
    strictEqual(invoker(null, "parent", 0), true);
    strictEqual(invoker(null, "grandparent", 1), true);
    strictEqual(invoker(null, "greatgrandparent", 2), true);
    strictEqual(invoker(null, "greatgreatgrandparent", 3), true);
    
    strictEqual(invoker(null, "grandparent", 2), false);
    strictEqual(invoker(null, "greatgrandparent", 3), false);
});

testUtils.testWithUtils("$instanceOf", "", true, function(methods, classes, subject, invoker) {
    // arrange
    classes.mock("tests.a.b.c.d.e");
    
    // act    
    // assert
    strictEqual(invoker(new tests.a.b.c.d.e(), tests.a.b.c.d.e), true);
    strictEqual(invoker({}, tests.a.b.c.d.e), false);
    delete window.tests;
});

testUtils.testWithUtils("is", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var filters = {
        $number: {},
        $special: {},
        property: {}
    };
    
    var item = {
        property: filters.property
    };
    
    var special = false;
    classes.mock("wipeout.utils.find.$number", function(){}, 0);
    classes.mock("wipeout.utils.find.$special", function(){return special;}, 3);
    
    // act
    // assert 
    ok(!invoker(item, filters));
    
    special = true;
    ok(invoker(item, filters));
    
    delete item.property;
    ok(!invoker(item, filters));
});