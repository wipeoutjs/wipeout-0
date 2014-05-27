module("wipeout.utils.ko", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("virtualElements.closingTag", function() {
    // arrange    
    var id1 = "LKJBLKJBLKJB", id2 = "sadsadasdsadsa";
    $("#qunit-fixture").html('\
    <!-- ko -->\
        <div id="' + id1 + '"></div>\
        <div></div>\
        <!-- ko -->\
            <div></div>\
            <div></div>\
        <!-- /ko -->\
        <div id="' + id2 + '"></div>\
    <!-- /ko -->');
    //debugger;
    var item1 = $("#" + id1)[0].previousSibling.previousSibling;
    var item2 = $("#" + id2)[0].nextSibling.nextSibling;
    ok(item1);
    ok(item2);
    strictEqual(item1.nodeType, 8);
    strictEqual(item2.nodeType, 8);
    
    // act
    var actual = wipeout.utils.ko.virtualElements.closingTag(item1);
    
    //assert
    strictEqual(actual, item2);
});

test("buildBindingContextAlias", function() {
    // arrange  
    var bindingContext = {
        $data: new wo.view(),
        $parentContext: {
            $data: new wo.view(),
            $parentContext: {
                $data: new wo.view(),
                $parentContext: {
                    $data: new wo.view()
                }            
            }            
        }
    };
    
    bindingContext.$data.alias = "a1";
    bindingContext.$data.__woBag.type = "t1";
    bindingContext.$parentContext.$data.alias = "a2";
    bindingContext.$parentContext.$data.__woBag.type = "t2";
    bindingContext.$parentContext.$parentContext.$data.alias = "a3";
    bindingContext.$parentContext.$parentContext.$data.__woBag.type = "t3";
    bindingContext.$parentContext.$parentContext.$parentContext.$data.alias = "a1";
    bindingContext.$parentContext.$parentContext.$parentContext.$data.__woBag.type = "t1";
    
    
    // act
    var actual = wipeout.utils.ko.buildBindingContextAlias(bindingContext);
    
    //assert
    strictEqual(actual.a1, bindingContext.$data);
    strictEqual(actual.$type.t1, bindingContext.$data);
    strictEqual(actual.a2, bindingContext.$parentContext.$data);
    strictEqual(actual.$type.t2, bindingContext.$parentContext.$data);
    strictEqual(actual.a3, bindingContext.$parentContext.$parentContext.$data);
    strictEqual(actual.$type.t3, bindingContext.$parentContext.$parentContext.$data);
});








