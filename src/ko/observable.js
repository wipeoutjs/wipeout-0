
var Quest = Quest || {};
Quest.KnockoutExtensions = Quest.KnockoutExtensions || {};
Quest.KnockoutExtensions.Observable = Quest.KnockoutExtensions.Observable || {};


$.extend(Quest.KnockoutExtensions.Observable, (function () {

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

    ko.observable.fn.deepSubscribe = deepSubscribe;

    return {
        // exposed for unit testing purposes
        DeepSubscribe: deepSubscribe
    };
})());