
var wpfko = wpfko || {};
    wpfko.ko = wpfko.ko || {};

(function () {
    
    var deepSubscribe = function (subscribeFunction, context /*optional*/) {
        ///<summary>ko subscribe function, however gives the callback the old and new values</summary>
        var oldValue = this();

        return this.subscribe(function (newValue) {
            try {
                subscribeFunction.call(this, oldValue, newValue);
            } finally {
                oldValue = newValue;
            }
        }, context);
    };
    
    wpfko.ko.observable = {
        deepSubscribe: deepSubscribe,
        utils: {}
    };
    
    for(var i in wpfko.ko.observable) {
        if(i !== "utils") {
            ko.observable.fn[i] = wpfko.ko.observable[i];
        }
    }
})();