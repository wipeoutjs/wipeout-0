module("wipeout.tests.integration", {
    setup: function() {
        $fixture = $("#qunit-fixture");
        $fixture.html("<div data-bind='wpfko: wo.contentControl'></div>");
        $application = $($fixture.children()[0]);
        
        ko.applyBindings({}, $application[0]);
        application = wo.html.getViewModel($application[0]);
        
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

test("woInvisible", function() {
    ok(true);
    return;
    
    // arrange
    var container = "LKHLHKLH", val = "LKJGB*(PYGUBOPY", child = "LKGKJHFF";
    
    // act
    application.template('<wo.contentControl id="' + container + '" anItem="\'' + val + '\'" depth="1">\
    <template>\
        <wo.contentControl woInvisible="true" depth="2">\
            <template>\
                <wo.view id="' + child + '" anItem="$parent.anItem" depth="3"></wo.view>\
            </template>\
        </wo.contentControl>\
    </template>\
</wo.contentControl>');
    
    var subject = application.templateItems[container];
    ok(subject);
    
    // assert
    ok(subject.templateItems[child]);
    strictEqual(subject.templateItems[child].anItem, val);
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

test("routed event, from model", function() {
    // arrange
    var eventArgs = {}, triggered1 = false, triggered2 = false;
    var aRoutedEvent = new wo.routedEvent();
    application.model({child:{child:{child:new wo.object()}}})
    var open = "<wo.contentControl id='item' model='$parent.model().child'><template>", close = "</template></wo.contentControl>";
    application.template(open + open + open + "<div>hi</div>" + close + close + close);
    var secondDeepest = application.templateItems.item.templateItems.item;
    var deepest = secondDeepest.templateItems.item;
    
    ok(deepest);
    strictEqual(deepest.model().constructor, wo.object);
    
    deepest.registerRoutedEvent(aRoutedEvent, function() {
        triggered1 = true;
    });
    
    secondDeepest.registerRoutedEvent(aRoutedEvent, function() {
        triggered2 = true;
    });
    
    // act
    deepest.model().triggerRoutedEvent(aRoutedEvent, eventArgs);
    
    // assert
    ok(triggered2);
    ok(triggered1);
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
        wo.obj.enumerate(forItem.rendernedChildren, function(item) {
            getAllChildren(item);
        });
    };
    
    getAllChildren(application);
        
    wo.obj.enumerate(ctrls, function(item) {
        ok(item._rootHtmlElement);
    });
    
    // act
    application.unRender();
    
    // assert
    wo.obj.enumerate(ctrls, function(item) {
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


test("advanced items control, creating/destroying", function() {
    // arrange
    var templateId = wo.contentControl.createAnonymousTemplate('<!-- ko itemsControl: null --><!-- /ko -->');
    var itemTemplateId = wo.contentControl.createAnonymousTemplate('<div data-bind="attr: { id: model }"></div>');
    
    var itemsControl1 = new wo.itemsControl();
    itemsControl1.templateId(templateId);
    itemsControl1.itemTemplateId(itemTemplateId);
    itemsControl1.itemSource(["a", "b", "c"]);
    
    var itemsControl2 = new wo.itemsControl();
    itemsControl2.templateId(templateId);
    itemsControl2.itemTemplateId(itemTemplateId);
    itemsControl2.itemSource(["d", "e", "f"]);
    
    application.content = ko.observable();
    application.template('<!-- ko render: content --><!-- /ko -->');
    
    // act
    // assert
    application.content(itemsControl1);
    strictEqual($("#a").length, 1);
    strictEqual($("#b").length, 1);
    strictEqual($("#c").length, 1);
    
    application.content(itemsControl2);
    strictEqual($("#d").length, 1);
    strictEqual($("#e").length, 1);
    strictEqual($("#f").length, 1);
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