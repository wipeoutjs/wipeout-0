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
        strictEqual(filters.$index, 0);
    });
    
    // act
    invoker();
    
    // assert
});

testUtils.testWithUtils("find", "filters, no index", false, function(methods, classes, subject, invoker) {
    // arrange
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$index, 0);
    });
    
    // act
    invoker(null, {});
    
    // assert
});

testUtils.testWithUtils("find", "filters, $i index", false, function(methods, classes, subject, invoker) {
    // arrange
    var i = 11;
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$index, i);
        strictEqual(filters.$i, undefined);
    });
    
    // act
    invoker(null, {$i: i});
    
    // assert
});

testUtils.testWithUtils("find", "constructor search term", false, function(methods, classes, subject, invoker) {
    // arrange
    function x(){};
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.constructor, x);
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

testUtils.testWithUtils("find", "string search term", false, function(methods, classes, subject, invoker) {
    // arrange
    var hello = "zfgzhzfhzxfghxhnnxgn";
    subject._find = methods.customMethod(function(filters) {
        strictEqual(filters.$searchTerm, hello);
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
    
    ok(find.regex.instanceOf.test("instanceof: a"));
    ok(find.regex.instanceOf.test("instanceof:a"));
    ok(!find.regex.instanceOf.test("instanceof: "));
    ok(!find.regex.instanceOf.test("instanceof:"));
    ok(!find.regex.instanceOf.test(" instanceof: a"));
});

testUtils.testWithUtils("_find", "no search term", true, function(methods, classes, subject, invoker) {
    // arrange
    // act
    var output = invoker();
    
    // assert
    ok(!output);
});

testUtils.testWithUtils("_find", "ancestors", true, function(methods, classes, subject, invoker) {
    // arrange
    var expected = {}, ctxt = {}, search = "parent";
    classes.mock("wipeout.utils.find.ancestors", function() {
        methods.method([ctxt, search])(arguments[0], arguments[1]);
        return expected;
    }, 1);
    
    // act
    var actual = invoker(ctxt, search);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("_find", "instanceOf", true, function(methods, classes, subject, invoker) {
    // arrange
    var expected = {}, ctxt = {}, search = "instanceof:";
    classes.mock("wipeout.utils.find.instanceOf", function() {
        methods.method([ctxt, search])(arguments[0], arguments[1]);
        return expected;
    }, 1);
    
    // act
    var actual = invoker(ctxt, search);
    
    // assert
    strictEqual(actual, expected);
});

testUtils.testWithUtils("ancestors", "", true, function(methods, classes, subject, invoker) {
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

testUtils.testWithUtils("instanceOf", "", true, function(methods, classes, subject, invoker) {
    // arrange
    classes.mock("tests.a.b.c.d.e");
    
    // act    
    // assert
    strictEqual(invoker(new tests.a.b.c.d.e(), "instanceOf:      tests.a.b.c.d.e"), true);
    strictEqual(invoker({}, "instanceOf:      tests.a.b.c.d.e"), false);
    delete window.tests;
});

testUtils.testWithUtils("is", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var filter1 = {}, filter2 = {};
    var item = {
        i1: filter1,
        i2: filter2,
        asdjfvjsdvf:{}
    };
    var filters = {
        i1: filter1,
        i2: filter2,
        $kjbgkjbkjbkjb: {}
    };
    
    // act
    // assert    
    ok(invoker(item, filters));
    
    filters.dkfkdfjbk = {};
    ok(!invoker(item, filters));
});