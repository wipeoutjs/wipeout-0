module("wipeout.bindings.wo", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("constructor", "", false, function(methods, classes, subject, invoker) {
    // arrange
    classes.mock("wipeout.template.engine.xmlCache.asd")
    
    var created;
    var bindingContext = {
            $data: {
                shareParentScope: true
            },
            $parentContext: {
                $data:{templateItems:{}}
            }
        },
        element = {}, 
        value = {
            type: function() {
                this.__woBag = {};
                created = this;
                this.initialize = methods.method([wipeout.template.engine.xmlCache.asd, bindingContext]);
            }, 
            initXml: "asd", 
            id: "LKNLKNK"
        }, 
        allBindingsAccessor = {};
    
    subject.render = methods.dynamicMethod(function() { return [created]; });
    subject._super = methods.dynamicMethod(function() { return [element, created, allBindingsAccessor, bindingContext]; });
    
    // act
    invoker(element, value, allBindingsAccessor, bindingContext);    
    
    // assert
    ok(created.__woBag.createdByWipeout);
    strictEqual(bindingContext.$parentContext.$data.templateItems[value.id], created);
    throws(function() { subject.render(); });
});

testUtils.testWithUtils("dispose", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.removeFromParentTemplateItems = methods.method();
    subject._super = methods.method();
    subject.value = {
        dispose: methods.method()
    };
    
    // act
    invoker();    
    
    // assert
});

testUtils.testWithUtils("removeFromParentTemplateItems", "", false, function(methods, classes, subject, invoker) {
    // arrange
    subject.value = {id:{}};
    subject.parentElement = {}
    classes.mock("wipeout.bindings.wo.removeFromParentTemplateItems", function() { methods.method([subject.parentElement, subject.value.id]).apply(methods, arguments); });
    
    // act
    invoker();    
    
    // assert
});

testUtils.testWithUtils("removeFromParentTemplateItems", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var actualParent = {
        templateItems: {"JBKJBKJBKJB":{}}
    };
    var parent = {
        shareParentScope: true,
        getParent: function() {
            return actualParent;
        }
    };
    var id = "JBKJBKJBKJB";
    var parentElement = {};
    classes.mock("wipeout.utils.html.getViewModel", function() { strictEqual(arguments[0], parentElement); return parent; });
    
    // act
    invoker(parentElement, id);    
    
    // assert
    ok(!actualParent.templateItems.JBKJBKJBKJB)
});

testUtils.testWithUtils("init", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var value = {};
    var meta = {}, element = {}, valueAccessor = function() {return value;}, allBindingsAccessor = {}, bindingContext = {};
    classes.mock("wipeout.bindings.wo", function() { 
        methods.method([element, value, allBindingsAccessor, bindingContext]).apply(methods, arguments)
        this.bindingMeta = meta; 
    });
    
    // act
    var actual = invoker(element, valueAccessor, allBindingsAccessor, null, bindingContext);
    
    // assert
    strictEqual(actual, meta);
});