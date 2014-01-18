module("wipeout.tests.integration", {
    setup: function() {
        $fixture = $("#qunit-fixture");
        $fixture.html("<div data-bind='wpfko: wo.contentControl'></div>");
        $application = $($fixture.children()[0]);
        
        ko.applyBindings({}, $application[0]);
        application = wo.utils.html.getViewModel($application[0]);
        
        window.views = {};
    },
    teardown: function() {
        delete window.views;
        ko.cleanNode($application[0]);
        $fixture.html("");
        $fixture = null;
        $application = null;
        application = null;
    }
});

test("wpfko.base.if", function() {
    // arrange
    application.hello = ko.observable({hello: "xxx"});
    application.template('<wo.if condition="$parent.hello">\
    <template>\
        <div data-bind="html: $parent.hello().hello"></div>\
    </template>\
</wo.if>');
    
    // act
    application.hello(null);
    
    // assert
    // no exception means it is ok
    ok(true);
});

test("templateItems", function() {
    // arrange
    var id = "IBYIBOIYHOUUBOH";
    
    // act
    application.template("<div id='" + id + "'></div>");
    
    // assert
    var item = $("#" + id);
    strictEqual(item.length, 1);
    strictEqual(application.templateItems[id], item[0]);
});

test("routed event", function() {
    // arrange
    var aRoutedEvent = new wo.routedEvent();
    var open = "<wo.contentControl id='item'><template>", close = "</template></wo.contentControl>";
    application.template(open + open + open + "<div>hi</div>" + close + close + close);
    application.registerRoutedEvent(aRoutedEvent, function() { this.__caught = true; }, application);
    application.templateItems.item.registerRoutedEvent(aRoutedEvent, function() { this.__caught = true; }, application.templateItems.item);
    
    // act
    application.templateItems.item.templateItems.item.templateItems.item.triggerRoutedEvent(aRoutedEvent, {});
    
    // assert
    ok(application.__caught);
    ok(application.templateItems.item.__caught);
});

test("routed event, handled", function() {
    // arrange
    var aRoutedEvent = new wo.routedEvent();
    var open = "<wo.contentControl id='item'><template>", close = "</template></wo.contentControl>";
    application.template(open + open + open + "<div>hi</div>" + close + close + close);
    application.registerRoutedEvent(aRoutedEvent, function() { this.__caught = true; }, application);
    application.templateItems.item.registerRoutedEvent(aRoutedEvent, function() { 
        this.__caught = true; 
        arguments[0].handled = true;
    }, application.templateItems.item);
    
    // act
    application.templateItems.item.templateItems.item.templateItems.item.triggerRoutedEvent(aRoutedEvent, {});
    
    // assert
    ok(!application.__caught);
    ok(application.templateItems.item.__caught);
});

test("basic knockout binding, non observable", function() {
    // arrange
    var val = "LIB:OIPHJKB:OIYHJB";
    var id = "dsfbisdfb";
    application.model().value = val;
    
    // act
    application.template("<div id='" + id + "' data-bind='html: model().value'></div>");
    
    // assert
    strictEqual($("#" + id).html(), val);
});

test("un render", function() {
    // arrange    
    application.hello = new wo.contentControl();
    application.hello.helloAgain = new wo.contentControl();
    application.hello.helloAgain.template(
"<wo.contentControl id=\"asdasdd\">\
</wo.contentControl>\
<div>Hi</div>\
<wo.contentControl>\
</wo.contentControl>");
    application.hello.template("<!-- ko render: helloAgain--><!-- /ko -->");
    
    application.template("<!-- ko render: hello--><!-- /ko -->");
    var ctrls = [];
    var getAllChildren = function(forItem) {
        ctrls.push(forItem);
        wo.utils.obj.enumerate(forItem.rendernedChildren, function(item) {
            getAllChildren(item);
        });
    };
    
    getAllChildren(application);
        
    wo.utils.obj.enumerate(ctrls, function(item) {
        ok(item._rootHtmlElement);
    });
    
    // act
    application.unRender();
    
    // assert
    wo.utils.obj.enumerate(ctrls, function(item) {
        ok(!item._rootHtmlElement);
    });
});

test("basic knockout binding", function() {
    // arrange
    var val = "LIB:OIPHJKB:OIYHJB";
    var id = "dsfbisdfb";
    application.model().value = ko.observable(val);
    
    // act
    application.template("<div id='" + id + "' data-bind='html: model().value'></div>");
    
    // assert
    strictEqual($("#" + id).html(), val);
        
    
    // re-act
    var val2 = "NP(UNN{  JPIUNIIN";
    application.model().value(val2);
    
    // re-assert
    strictEqual($("#" + id).html(), val2);
});

test("basic items source. initial, add, remove, re-arrange", function() {
    // arrange
    var id1 = "JBKJBLKJBKJLBLKJB";
    var id2 = "oidshfp9usodnf";
    var item1 = "dsjhvflksdyhfi", item2 = "asdugp9gopgpiugasd", item3 = "asdiougp9asgdug";
    application.model().items = ko.observableArray([item1, item2, item3]);
    
    var bound = {};
    var assert = function() {
        var reBound = {};
        var $items = $("." + id2);
        strictEqual($items.length, arguments.length, "html length");
        strictEqual(application.templateItems[id1].items().length, arguments.length, "items length");
        for(var i = 0, ii = arguments.length; i < ii; i++) {            
            strictEqual($items[i].innerHTML, arguments[i], "html value");           
            strictEqual(application.templateItems[id1].items()[i].model(), arguments[i], "item model value");
            reBound[arguments[i]] = $items[i];
            
            if(bound[arguments[i]])
                strictEqual(bound[arguments[i]], $items[i], "template was not re-drawn");
            else
                bound[arguments[i]] = $items[i];
        }
        
        for(var i in bound) {
            if(!reBound[i]) {
                ok(!bound[i].parentElement, "deleted item was removed");
                delete bound[i];
            }
        }
    }
    
    // act
    application.template(
"<wo.itemsControl itemSource='model().items' id='" + id1 + "'>\
    <itemTemplate>\
        <div class='" + id2 + "' data-bind='html: model()'></div>\
    </itemTemplate>\
</wo.itemsControl>");
    
    // assert
    assert(item1, item2, item3);
        
    
    // re-act
    var item4  = "ILUGLUIYLBKI:Y";
    application.model().items.push(item4);
    
    // re-assert
    assert(item1, item2, item3, item4);
        
    
    // re-act
    application.model().items().splice(1, 1);
    application.model().items.valueHasMutated();
    
    // re-assert
    assert(item1, item3, item4);
        
    
    // re-act
    application.model().items().reverse();
    application.model().items.valueHasMutated();
    
    // re-assert
    assert(item4, item3, item1);
});

test("multi-dimentional binding", function() {
    // arrange
    var val = "KJBIUPJKKJGVLHJVMGJ";
    var model = { inner: ko.observable({ inner: ko.observable({ inner: ko.observable({ val: ko.observable("") }) }) }) };
    var id1 = "asdhasjdkjbasd", id2 = "asdhasjdkjbasdasdwetsdf";
    var open = "<wo.contentControl id='" + id1 + "' model='$parent.model().inner'><template>", close = "</template></wo.contentControl>";
    application.model(model);
    application.template(open + open + open + "<div id='" + id2 + "' data-bind='html: model().val'></div>" + close + close + close);
    
    // act
    model.inner().inner().inner().val(val);
    
    // assert
    strictEqual($("#" + id2).html(), val);
    
    
    // re-act
    model.inner().inner().inner({val: val});
    
    // re-assert
    strictEqual($("#" + id2).html(), val);
    
    
    // re-act
    model.inner().inner({inner: {val: val}});
    
    // re-assert
    strictEqual($("#" + id2).html(), val);
    
    
    // re-act
    model.inner({inner:{inner: {val: val}}});
    
    // re-assert
    strictEqual($("#" + id2).html(), val);
    
    
    // re-act
    application.model({inner:{inner:{inner: {val: val}}}});
    
    // re-assert
    strictEqual($("#" + id2).html(), val);
});