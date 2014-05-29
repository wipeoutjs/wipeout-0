module("wipeout.tests.integration.utils.find", {
    setup: function() {
    },
    teardown: function() {
    }
});

var find = wipeout.utils.find;

testUtils.testWithUtils("find", "index only", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var bc = {
        $data: {},
        $parentContext: {
            $data: {},
            $parentContext: {
                $data: {},
                $parentContext: {
                    $data: {}
                }
            }
        }
    };
    
    subject = new find(bc);
    
    // act        
    // assert
    strictEqual(subject.find(null, {$i: 1}), bc.$parentContext.$parentContext.$data);
    strictEqual(subject.find(null, {$i: 2}), bc.$parentContext.$parentContext.$parentContext.$data);
});

testUtils.testWithUtils("find", "index and ancestor", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var bc = {
        $data: {},
        $parentContext: {
            $data: {},
            $parentContext: {
                $data: {}
            }
        }
    };
    
    subject = new find(bc);
    
    // act
    var output = subject.find("parent", {$i: 1});
        
    // assert
    strictEqual(output, bc.$parentContext.$parentContext.$data);
});

testUtils.testWithUtils("find", "ancestors", false, function(methods, classes, subject, invoker) {
    
    // arrange
    var bc = {
        $data: {},
        $parentContext: {        
            $data: {},
            $parentContext: {        
                $data: {},
                $parentContext: {
                    $data: {},
                    $parentContext: {
                        $data: {}
                    }
                }
            }
        }
    };
    
    subject = new find(bc);
    
    // act        
    // assert
    strictEqual(subject.find("Parent"), bc.$parentContext.$data);
    strictEqual(subject.find("grandParent"), bc.$parentContext.$parentContext.$data);
    strictEqual(subject.find("greatgrandParent"), bc.$parentContext.$parentContext.$parentContext.$data);
    strictEqual(subject.find("greatgreatgrandParent"), bc.$parentContext.$parentContext.$parentContext.$parentContext.$data);
    strictEqual(subject.find("greatParent"), null);
});

testUtils.testWithUtils("find", "constructor and index", false, function(methods, classes, subject, invoker) {
    function x(){}
    
    // arrange
    var bc = {
        $data: {},
        $parentContext: {        
            $data: {},
            $parentContext: {        
                $data: new x(),
                $parentContext: {
                    $data: {},
                    $parentContext: {
                        $data: new x()
                    }
                }
            }
        }
    };
    
    subject = new find(bc);
    
    // act        
    // assert
    strictEqual(subject.find(x), bc.$parentContext.$parentContext.$data);
    strictEqual(subject.find(x, {$i: 1}), bc.$parentContext.$parentContext.$parentContext.$parentContext.$data);
    strictEqual(subject.find(x, {$i: 2}), null);
});


testUtils.testWithUtils("find", "instanceof and index", false, function(methods, classes, subject, invoker) {
    classes.mock("tests.a.s.d.f.g", function(){this.hello = "sadasds"});
    
    // arrange
    var bc = {
        $data: {},
        $parentContext: {        
            $data: {},
            $parentContext: {        
                $data: new tests.a.s.d.f.g(),
                $parentContext: {
                    $data: {},
                    $parentContext: {
                        $data: new tests.a.s.d.f.g()
                    }
                }
            }
        }
    };
    
    subject = new find(bc);
    
    // act        
    // assert
    strictEqual(subject.find("instanceOf: tests.a.s.d.f.g"), bc.$parentContext.$parentContext.$data);
    strictEqual(subject.find("instanceof: tests.a.s.d.f.g", {$i: 1}), bc.$parentContext.$parentContext.$parentContext.$parentContext.$data);
    strictEqual(subject.find("instanceOf: tests.a.s.d.f.g", {$i: 2}), null);
    delete window.tests;
});























