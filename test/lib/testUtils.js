window.testUtils = window.testUtils || {};
$.extend(testUtils, (function() {
    
    var cached = [];
    var classMock = function () { this.mocks = []; cached.push(this); };
    classMock.reset = function() {
        for(var i = 0, ii = cached.length; i < ii; i++) {
            cached[i].reset();
        }
    };
 
    classMock.prototype.mock = function(className, newValue /*optional*/, expected /*optional*/) {
 
        newValue = newValue || function(){};
 
        className = className.split(".");
        var current = window;
        for (var i = 0, ii = className.length - 1; i < ii; i++) {
            current = current[className[i]] = (current[className[i]] || {});
        }
 
        var mock = {ns: current, name: className[i], oldVal: current[className[i]], expected: expected, actual: 0};
        this.mocks.push(mock);
        if(newValue == null || newValue.constructor === Function)        
            current[className[i]] = function() {
                mock.actual++;

                // return so that both methods and constructors can be mocked
                return newValue.apply(this, arguments);
            };
        else
            current[className[i]] = newValue;
 
        return current[className[i]];
    };
 
    classMock.prototype.reset = function() {
        for(var i = 0, ii = this.mocks.length; i < ii; i++) {
            if(this.mocks[i].expected != null) {
                strictEqual(this.mocks[i].actual, this.mocks[i].expected, "Constructor not called the correct number of times");
            }
 
            this.mocks[i].ns[this.mocks[i].name] = this.mocks[i].oldVal;
        }
 
        this.mocks.length = 0;
    };
 
    var methodMock = function () { this.calls = []; };
 
    methodMock.prototype.customMethod = function (evaluatorFunction, name /* optional */) {
        evaluatorFunction = evaluatorFunction || function() { };
        var output = function () {
            output.__called = true;
            return evaluatorFunction.apply(window, arguments);
        };
 
        this.calls.push({ name: name, method: output });
 
        return output;
    };
 
    methodMock.prototype.dynamicMethod = function (expectedArguments, returnValue /* optional */, name /* optional */) {
        name = name || "unnamed";
 
        return this.customMethod(function () {
            var expected = expectedArguments();
            if(expected)
                for (var i = 0, ii = arguments.length; i < ii; i++) {
                    strictEqual(expected[i], arguments[i], "Argument " + i + " of method \"" + name + "\" was invalid.");
                }
 
            return returnValue ? returnValue() : returnValue;        
        }, name);
    };
 
    methodMock.prototype.method = function (expectedArguments, returnValue /* optional */, name /* optional */) {
        return this.dynamicMethod(function () { return expectedArguments; }, function () { return returnValue; }, name);
    };
 
    methodMock.prototype.verifyAllExpectations = function () {
        for (var i = 0, ii = this.calls.length; i < ii; i++) {
            ok(this.calls[i].method.__called, "Method \"" + this.calls[i].name + "\" was not called.");
        }
    };
 
    var testWithUtils = function(method, description, isStatic, testLogic) {
        
        var methods = new methodMock();
        var classes = new classMock();
        test(method + ", " + description, function() {
            try {
                var subject = {};                
                var testSubject = testUtils.currentModule;
                if(method.toLowerCase() !== "consrtuctor") {
                    if(!isStatic) {
                        testSubject += ".prototype";
                    }

                    testSubject += "." + method;
                }
                
                testSubject = wipeout.utils.obj.getObject(testSubject);
                function invoker() {                    
                    return testSubject.apply(subject, arguments);                   
                };
                
                testLogic(methods, classes, subject, invoker);    
                methods.verifyAllExpectations();
            } finally {
                classes.reset();
            }
        });
    };
    
    QUnit.moduleStart(function( details ) {
      testUtils.currentModule = details.name;
    });
    
    return {
        testWithUtils: testWithUtils,
        classMock: classMock,
        methodMock: methodMock
    };

})());