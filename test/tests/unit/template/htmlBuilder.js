module("wipeout.template.htmlBuilder", {
    setup: function() {
    },
    teardown: function() {
    }
});

var htmlBuilder = wipeout.template.htmlBuilder;

testUtils.testWithUtils("constructor", null, false, function(methods, classes, subject, invoker) {
    // arrange
    var xmlTemplate = {};
    subject.generatePreRender = methods.method([xmlTemplate]);
    
    // act    
    invoker(xmlTemplate);
    
    //assert
    strictEqual(subject.preRendered.constructor, Array);
});

testUtils.testWithUtils("render", "gernerate html string (function and static string)", false, function(methods, classes, subject, invoker) {
    // arrange  
    var dynamicRender = "KJHVKJHVKJHVJHV";
    subject.preRendered = ["sadasdsdgfoishfo;isdh", function() {
        strictEqual(arguments[0], bindingContext);
        return dynamicRender;        
    }];
    var bindingContext = {};
    var expected = {};
    
    classes.mock("wipeout.utils.html.createElements", function() {
        strictEqual(subject.preRendered[0] + dynamicRender, arguments[0]);
        return expected;
    }, 1);
    
    // act
    var actual = invoker(bindingContext);
    
    //assert
    strictEqual(actual, expected);
});


testUtils.testWithUtils("render", "templateItems", false, function(methods, classes, subject, invoker) {
    // arrange  
    subject.preRendered = [];
    var bindingContext = {
        $data: {
            templateItems: {}
        }
    };   
    var html = {}, element = {};
    classes.mock("wipeout.utils.html.createElements", function() {
        return html;
    }, 1);
    classes.mock("wipeout.template.htmlBuilder.getTemplateIds", function() {
        strictEqual(arguments[0].childNodes, html);
        return {
            blabla: element
        };
    }, 1);
    
    // act
    invoker(bindingContext);
    
    //assert
    strictEqual(bindingContext.$data.templateItems.blabla, element);
});


testUtils.testWithUtils("render", "onInitialized", false, function(methods, classes, subject, invoker) {
    // arrange  
    subject.preRendered = [];
    var bindingContext = {
        $data: new wipeout.base.view()
    };
    
    bindingContext.$data.onInitialized = methods.method([]);
    
    // act
    invoker(bindingContext);
    
    //assert
});

testUtils.testWithUtils("generatePreRender", "invlaid xml", false, function(methods, classes, subject, invoker) {
    // arrange    
    // act    
    //assert
    throws(function() {
        invoker("<asdsdasd>");
    });
});

testUtils.testWithUtils("generatePreRender", "invlaid wipeout tags", false, function(methods, classes, subject, invoker) {
    // arrange    
    subject.preRendered = [];
    
    // act      
    //assert
    throws(function() {
        invoker("<div>" + wipeout.template.engine.openCodeTag + "</div>");
    });
});

testUtils.testWithUtils("generatePreRender", "strings and functions", false, function(methods, classes, subject, invoker) {
    // arrange    
    var div = "<div></div>";
    var scriptId = "KJBKJ>BJK>BKJB";
    wipeout.template.engine.scriptCache[scriptId] = {};
    subject.preRendered = [];
    
    // act  
    invoker(div + wipeout.template.engine.openCodeTag + scriptId + wipeout.template.engine.closeCodeTag + div);
    
    //assert
    strictEqual(subject.preRendered[0], div);
    strictEqual(subject.preRendered[1], wipeout.template.engine.scriptCache[scriptId]);
    strictEqual(subject.preRendered[2], div);
});

testUtils.testWithUtils("getTemplateIds", null, true, function(methods, classes, subject, invoker) {
    // arrange  
    var id1 = "JKHVBJKLHJKHV", id2 = "RTTRSTRSTRSTRS";
    var elements = $("<div><div id='" + id1 + "'><div id='" + id2 + "'></div></div></div>")[0];
    
    // act   
    var actual = invoker(elements);
    
    //assert
    ok(actual[id1]);
    strictEqual(actual[id1], $("#" + id1, elements)[0]);
    ok(actual[id2]);
    strictEqual(actual[id2], $("#" + id2, elements)[0]);
});
    
testUtils.testWithUtils("generateTemplate", "element node, text node, comment node", true, function(methods, classes, subject, invoker) {
    // arrange 
    var expected = "<div>jgjhgjhgjhgjg<!--asdsadasdsad--></div>";
    var element = $("<div>" + expected + "</div>")[0];
    
    // act    
    var actual = new DOMParser().parseFromString(invoker(element), "application/xml").documentElement;
    
    //assert
    strictEqual(actual.nodeName, "div");
    strictEqual(actual.nodeType, 1);
    strictEqual(actual.childNodes.length, 2);
    strictEqual(actual.childNodes[0].nodeType, 3);
    strictEqual(actual.childNodes[0].nodeValue, "jgjhgjhgjhgjg");
    strictEqual(actual.childNodes[1].nodeType, 8);
    strictEqual(actual.childNodes[1].nodeValue, "asdsadasdsad");
});

