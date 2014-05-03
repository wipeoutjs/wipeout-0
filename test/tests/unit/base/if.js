module("wipeout.base.if", {
    setup: function() {
    },
    teardown: function() {
    }
});

testUtils.testWithUtils("if", "and all functionality (kind of an integration test)", false, function(methods, classes, subject, invoker) {
    // arrange
    var subject = new wipeout.base["if"]();
    subject.condition(true);
    subject.template("asdfsdfgkhlsaklksndf");
    subject.elseTemplate("LAJKISBDKJBASDKJ");
    var yes = subject.templateId();
    var no = subject.elseTemplateId();
    
    // act
    // assert
    subject.condition(false);
    strictEqual(no, subject.templateId());
    subject.condition(true);
    strictEqual(yes, subject.templateId());
});