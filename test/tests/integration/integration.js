var $fixture;
var $application;
var application;

module("wipeout.tests.integration.integration", {
    setup: function() {
        $fixture = $("#qunit-fixture");
        $fixture.html("<div data-bind='wipeout: wo.contentControl'></div>");
        $application = $($fixture.children()[0]);
        
        ko.applyBindings({}, $application[0]);
        application = wo.html.getViewModel($application[0]);
        application.application = true;
        
        window.views = {};
    },
    teardown: function() {
        delete window.views;
        application.dispose();
        ko.cleanNode($application[0]);
        $fixture.html("");
        $fixture = null;
        $application = null;
        application = null;
    }
});

test("parent child views", function() {
    
    // arrange
    var parent1 = "p1", child1 = "c1", child2 = "c2";
    var parent2 = "p2", child3 = "c3", child4 = "c4";
    var parent3 = "p3", child5 = "c5", child6 = "c6";
    
    
    // act
    application.template('<wo.contentControl shareParentScope="true" id="' + parent1 + '">\
        <template>\
            <wo.view shareParentScope="true" id="' + child1 + '" />\
            <wo.view id="' + child2 + '" />\
        </template>\
    </wo.contentControl>\
    <wo.contentControl id="' + parent2 + '">\
        <template>\
            <wo.view shareParentScope="true" id="' + child3 + '" />\
            <wo.view id="' + child4 + '" />\
        </template>\
    </wo.contentControl>\
    <wo.itemsControl itemSource="[{},{}]" id="' + parent3 + '">\
    </wo.itemsControl>');
    
    ok(parent1 = application.templateItems[parent1]);
    ok(child1 = application.templateItems[child1]);
    ok(child2 = application.templateItems[child2]);
    
    ok(parent2 = application.templateItems[parent2]);
    ok(child3 = parent2.templateItems[child3]);
    ok(child4 = parent2.templateItems[child4]);
    
    ok(parent3 = application.templateItems[parent3]);
    ok(child5 = parent3.items()[0]);
    ok(child6 = parent3.items()[1]);
    
    // assert
    strictEqual(child1.getParent(), application);
    strictEqual(child2.getParent(), application);
    strictEqual(child1.getParent(true), parent1);
    strictEqual(child2.getParent(true), parent1);
    strictEqual(child3.getParent(), parent2);
    strictEqual(child4.getParent(), parent2);
    strictEqual(child5.getParent(), parent3);
    strictEqual(child6.getParent(), parent3);    
});

test("shareParentScope", function() {
    
    // arrange
    var container = "LKHLHKLH", val = "LKJGB*(PYGUBOPY", child = "LKGKJHFF";
    
    // act
    application.template('<wo.contentControl id="' + container + '" anItem="\'' + val + '\'" depth="1">\
    <template>\
        <wo.contentControl shareParentScope="true" depth="2">\
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

test("wipeout.base.if", function() {
    // arrange
    application.hello = ko.observable({hello: "xxx"});
    application.template('<wo.if shareParentScope="false" condition="$parent.hello">\
    <template>\
        <div id="myDiv" data-bind="html: $parent.hello().hello"></div>\
    </template>\
</wo.if>');
    
    ok(document.getElementById("myDiv"));
    
    // act
    application.hello(null);
    
    // assert
    ok(!document.getElementById("myDiv"));
});

test("wipeout.utils.find", function() {
    // arrange
    application.template('<wo.contentControl id="me1">\
    <template>\
        <wo.contentControl id="me2">\
            <template>\
                <wo.contentControl id="me3"\
                    parent="$find(\'parent\')" grandParent="$find({$a:\'grandParent\'})" greatGrandParent="$find({$a:\'greatGrandParent\'})"\
                    cc0="$find(wo.contentControl)" cc1="$find({$t:wo.contentControl, $index: 1})"\
                    v0="$find({$i:wo.view})" v1="$find({$i:wo.view, $index: 1})"\
                    f0="$find({id: \'me1\'})" fY="$find({id: \'me1\'}, {$index:1})" fX="$find({id: \'me3\'})">\
                </wo.contentControl>\
            </template>\
        </wo.contentControl>\
    </template>\
</wo.contentControl>');
    
    var me = application.templateItems.me1.templateItems.me2.templateItems.me3;
    ok(me);
    
    // act    
    // assert
    strictEqual(me.parent, application.templateItems.me1.templateItems.me2);
    strictEqual(me.grandParent, application.templateItems.me1);
    strictEqual(me.greatGrandParent, application);
    
    strictEqual(me.cc0, application.templateItems.me1.templateItems.me2);
    strictEqual(me.cc1, application.templateItems.me1);
    
    strictEqual(me.v0, application.templateItems.me1.templateItems.me2);
    strictEqual(me.v1, application.templateItems.me1);
    
    strictEqual(me.f0, application.templateItems.me1);
    strictEqual(me.fX, null);
    strictEqual(me.fY, null);
});

test("wipeout.base.if, shareParentScope", function() {
    // arrange
    application.hello = ko.observable({hello: "xxx"});
    application.template('<wo.if condition="hello">\
    <template>\
        <div id="myDiv" data-bind="html: hello().hello"></div>\
    </template>\
</wo.if>');
    
    ok(document.getElementById("myDiv"));
    
    // act
    application.hello(null);
    
    // assert
    ok(!document.getElementById("myDiv"));
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
    application.model({child:{child:{child:new wo.routedEventModel()}}})
    var open = "<wo.contentControl id='item' model='$parent.model().child'><template>", close = "</template></wo.contentControl>";
    application.template(open + open + open + "<div>hi</div>" + close + close + close);
    var secondDeepest = application.templateItems.item.templateItems.item;
    var deepest = secondDeepest.templateItems.item;
    
    ok(deepest);
    strictEqual(deepest.model().constructor, wo.routedEventModel);
    
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
        ok(item.__woBag.rootHtmlElement);
    });
    
    // act
    wo.domData.get($application[0], wipeout.bindings.bindingBase.dataKey)[0].unRender();
    
    // assert
    wo.obj.enumerate(ctrls, function(item) {
        ok(!item.__woBag.rootHtmlElement);
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

test("basic items control. initial, add, remove, re-arrange", function() {
    // arrange
    var id1 = "JBKJBLKJBKJLBLKJB";
    var id2 = "oidshfp9usodnf";
    var item1 = "item-1", item2 = "item-2", item3 = "item-3";
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
    var item4  = "item-4";
    application.model().items.push(item4);
    
    // re-assert
    ok(true, "added item");
    assert(item1, item2, item3, item4);
        
    
    // re-act
    application.model().items().splice(1, 1);
    application.model().items.valueHasMutated();
    
    // re-assert
    ok(true, "removed item");
    assert(item1, item3, item4);
        
    
    // re-act
    application.model().items().reverse();
    application.model().items.valueHasMutated();
    
    // re-assert
    ok(true, "reversed items");
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

test("items control, $index", function() {
    // arrange
    var templateId = wo.contentControl.createAnonymousTemplate('<!-- ko itemsControl: null --><!-- /ko -->');
    var itemTemplateId = wo.contentControl.createAnonymousTemplate('<div data-bind="attr: { id: model, \'data-index\': $index }"></div><wo.view id="item" index="$parentContext.$index" />');
    
    var itemsControl1 = new wo.itemsControl();
    itemsControl1.templateId(templateId);
    itemsControl1.itemTemplateId(itemTemplateId);
    itemsControl1.itemSource(["a", "b", "c"]);
    
    application.content = ko.observable();
    application.template('<!-- ko render: content --><!-- /ko -->');
    
    // act
    // assert
    application.content(itemsControl1);
    strictEqual($("#a").attr("data-index"), "0");
    strictEqual(itemsControl1.items()[0].templateItems.item.index, 0);
    strictEqual($("#b").attr("data-index"), "1");
    strictEqual(itemsControl1.items()[1].templateItems.item.index, 1);
    strictEqual($("#c").attr("data-index"), "2");
    strictEqual(itemsControl1.items()[2].templateItems.item.index, 2);
});

test("items control, $index, shareParentScope", function() {
    // arrange
    var templateId = wo.contentControl.createAnonymousTemplate('<!-- ko itemsControl: null --><!-- /ko -->');
    var itemTemplateId = wo.contentControl.createAnonymousTemplate('<div data-bind="attr: { id: model, \'data-index\': $index }"></div>');
    
    var itemsControl1 = new wo.itemsControl();
    itemsControl1.templateId(templateId);
    itemsControl1.itemTemplateId(itemTemplateId);
    itemsControl1.itemSource(["a", "b", "c"]);
    itemsControl1.createItem = function (model) {
        var view = new wipeout.base.view(this.itemTemplateId(), model);
        view.shareParentScope = true;
        return view;
    };
    
    application.content = ko.observable();
    application.template('<!-- ko render: content --><!-- /ko -->');
    
    // act
    // assert
    application.content(itemsControl1);
    strictEqual($("#a").attr("data-index"), "0");
    strictEqual($("#b").attr("data-index"), "1");
    strictEqual($("#c").attr("data-index"), "2");
});

/*test("move view model", function() {
    // arrange
    application.template('<wo.contentControl id="toMove">\
    <template>\
        <span></span>\
    </template>\
</wo.contentControl>\
<wo.contentControl id="moveToParent1" shareParentScope="true">\
    <template>\
        <div id="moveToPosition1"></div>\
    </template>\
</wo.contentControl>\
<wo.contentControl id="moveToParent2">\
    <template>\
        <div id="moveToPosition2"></div>\
    </template>\
</wo.contentControl>');
    
    var toMove = application.templateItems.toMove;
    var moveToParent2 = application.templateItems.moveToParent2;
    strictEqual(toMove.getParent(), application);
    strictEqual(moveToParent2.getParent(), application);
    
    // act
    wo.move(function() {
        $(toMove.entireViewModelHtml()).appendTo("#moveToPosition1");
    });
    stop();
    
    // assert
    setTimeout(function() {
        strictEqual(toMove.getParent(true), application.templateItems.moveToParent1);
        strictEqual(toMove, application.templateItems.toMove);
        
        $(toMove.entireViewModelHtml()).appendTo("#moveToPosition2");        
        setTimeout(function() {
            strictEqual(toMove.getParent(), application.templateItems.moveToParent2);
            
            // test template items have changed
            ok(!application.templateItems.toMove);
            strictEqual(toMove, application.templateItems.moveToParent2.templateItems.toMove);
            
            start();
        }, 150);
    }, 150);    
});*/

function disposeTest (act) {
    function disposeFunc() { this.isDisposed = true; this.constructor.prototype.dispose.call(this); };
    application.template('<wo.view id="i0" />\
<div id="a">\
    <wo.contentControl id="i1">\
        <template>\
            <div id="b">\
                <div id="c">\
                    <wo.view inner="true" id="i2" />\
                </div>\
            </div>\
        </template>\
    </wo.contentControl>\
    <div id="d">\
        <div id="e">\
            <wo.itemsControl id="i3" itemSource="[{},{}]">\
                <template>\
                    <div id="f">\
                        <!-- ko itemsControl: null --><!-- /ko -->\
                    </div>\
                </template>\
            </wo.itemsControl>\
        </div\>\
    </div\>\
</div>');
    
    var i0, i1, i2, i3, i4, i5;
    ok(i0 = application.templateItems.i0);
    ok(i1 = application.templateItems.i1);
    ok(i2 = i1.templateItems.i2);
    ok(i3 = application.templateItems.i3);
    ok(i4 = i3.items()[0]);
    ok(i5 = i3.items()[1]);
    
    i0.dispose = disposeFunc;
    i1.dispose = disposeFunc;
    i2.dispose = disposeFunc;
    i3.dispose = disposeFunc;
    i4.dispose = disposeFunc;
    i5.dispose = disposeFunc;
    
    // act
    act();
    stop();
    
    // assert
    setTimeout(function() {
        ok(i0.isDisposed);
        ok(i1.isDisposed);
        ok(i2.isDisposed);
        ok(i3.isDisposed);
        ok(i4.isDisposed);
        ok(i5.isDisposed);
        start();
    }, 150);    
}

test("dispose", function() {
    disposeTest(function() { 
        application.dispose();
    });
});

test("remove view model from dom", function() {
    disposeTest(function() {  
        wo.html(function() {
            $("#qunit-fixture").html("");
        });
    });  
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

test("binding subscriptions one way", function() {
    // arrange
    var id = "KJKHFGGGH";
    views.view = wo.view.extend(function() {
        this._super();
        
        this.property = ko.observable();
    });
    
    application.property = ko.observable();
        
    application.template("<views.view property='$parent.property' id='" + id + "'></views.view>");
    
    var view = application.templateItems[id];
    
    var v = [];
    view.property.subscribe(function() {
        v.push(arguments[0]);
    });
    
    var a = [];
    application.property.subscribe(function() {
        a.push(arguments[0]);
    });
    
    
    // act
    view.property(1);
    application.property(2);
    view.property(3);
    application.property(4);
    view.property(5);
    application.property(6);
    view.property(7);
    
    // assert
    deepEqual(v, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(a, [2, 4, 6]);
});

test("binding subscriptions two way", function() {
    // arrange
    var id = "KJKHFGGGH";
    views.view = wo.view.extend(function() {
        this._super();
    });
    
    var m = [];
    views.view.prototype.onModelChanged = function(oldVal, newVal) {
        this._super(oldVal, newVal);
        
        m.push(newVal);
    };
    
    application.property = ko.observable();
        
    application.template("<views.view model-tw='$parent.property' id='" + id + "'></views.view>");
    
    var view = application.templateItems[id];
    
    var v = [];
    view.model.subscribe(function() {
        v.push(arguments[0]);
    });
    
    var a = [];
    application.property.subscribe(function() {
        a.push(arguments[0]);
    });
    
    // act
    m.length = 0;
    view.model(1);
    application.property(2);
    view.model(3);
    application.property(4);
    view.model(5);
    application.property(6);
    view.model(7);
    
    // assert
    deepEqual(m, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(v, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(a, [1, 2, 3, 4, 5, 6, 7]);
});