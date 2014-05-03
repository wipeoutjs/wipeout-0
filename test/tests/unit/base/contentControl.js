module("wipeout.base.contentControl", {
    setup: function() {
    },
    teardown: function() {
    }
});

var contentControl = wipeout.base.contentControl;

testUtils.testWithUtils("constructor", "and all functionality", false, function(methods, classes, subject, invoker) {
    // arrange
    var template = {}, templateId = {}, model = {};
    subject._super = methods.method([templateId, model]);
    subject.templateId = {};
    classes.mock("wipeout.base.contentControl.createTemplatePropertyFor", function() {
        methods.method([subject.templateId, subject])(arguments[0], arguments[1]);
        return template;
    }, 1);
    
    // act
    invoker(templateId, model);
    
    // assert
    strictEqual(subject.template, template);
});

testUtils.testWithUtils("createTemplatePropertyFor", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var templateValue = "Hi";
    var owner = new wipeout.base.visual();
    var templateId = ko.observable(contentControl.createAnonymousTemplate(templateValue));
    
    // act
    var template = contentControl.createTemplatePropertyFor(templateId, owner);
    var t1 = templateId();
    
    // assert
    strictEqual($("#" + templateId()).html(), template());
    
    template("Bye");
    ok(t1 != templateId());
    
    templateId(t1);
    strictEqual(template(), templateValue);
});

testUtils.testWithUtils("createAnonymousTemplate", "Create same template twice", true, function(methods, classes, subject, invoker) {
    // arrange
    var val = "LKJBLKJBKJBLKJBKJBKJB";
        
    // act
    var result1 = invoker(val, false);
    var result2 = invoker(val, false);
    
    // assert
    strictEqual(result1, result2);
    strictEqual($("#" + result1).html(), val);
    ok($("#" + result1).attr("data-templatehash"));
});

testUtils.testWithUtils("createAnonymousTemplate", "Create same template twice, force create", true, function(methods, classes, subject, invoker) {
    // arrange
    var val = "LKJBLKJBKJBLKJBKJBKJB";
        
    // act
    var result1 = invoker(val, false);
    var result2 = invoker(val, true);
    
    // assert
    notEqual(result1, result2);
    strictEqual($("#" + result1).html(), val);
    strictEqual($("#" + result2).html(), val);
    ok($("#" + result1).attr("data-templatehash"));
    ok($("#" + result2).attr("data-templatehash"));
});

testUtils.testWithUtils("deleteAnonymousTemplate", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var result = contentControl.createAnonymousTemplate("asdgdfs");
        
    // act
    invoker(result);
    
    // assert
    strictEqual($("#" + result).length, 0);
});

testUtils.testWithUtils("hashCode", "", true, function(methods, classes, subject, invoker) {
    // arrange
    var str1 = "KJBJBJBJKBJKBJLKJ";
    var str2 = "sdfsdfdfsdfsdfsdf";
    
    // act
    var result1 = invoker(str1);
    var result2 = invoker(str1);
    var result3 = invoker(str2);
    
    // assert
    strictEqual(result1, result2);
    notEqual(result1, result3);
});