
(function () {

        ﻿window.wpfko = window.wpfko || {};
wpfko.base = wpfko.base || {};
    
    var object = function (values) {
        this._events = {};

        if (values) {
            $.extend(this, values);
        }
    };

    object.create = function (value) {

        var alreadyDone = [];

        // conversion is not fully recursive, it just ensures that $.extend(...) is called on the elements of an array rather than the array itself
        var recursion = function (val) {
            if (alreadyDone.indexOf(val) !== -1)
                throw "Circular reference in arrays detected. Object.create() is meant simple data serialized from JSON";

            alreadyDone.push(val);
            var newValue;
            // if the value is an array
            if (value instanceof Array) {
                newValue = [];
                for (var i = 0, ii = val.length; i < ii; i++) {
                    newValue.push(recursion(val[i]));
                }
            } else {
                newVal = new Object();

                if (values) {
                    $.extend(newVal, values);
                }
            }

            return newVal;
        };

        return recursion(value);
    };

    object.extend = function (childClass) {

        var _this = this;
        var newConstructor = function () {

            var __this = this;

            // add a parent constructor
            this._super = function () {
                _this.apply(__this, arguments);
            };

            childClass.apply(this, arguments);
        };

        // static items
        for (var p in this)
            if (this.hasOwnProperty(p)) newConstructor[p] = this[p];

        // will ensure any subsequent changes to the parent class will reflect in child class

        function prototypeTracker() { this.constructor = newConstructor; }

        prototypeTracker.prototype = this.prototype;

        // inherit
        newConstructor.prototype = new prototypeTracker();

        //        //TODO: this cannot go here. Will throw problems if virtual method is inherited from by multiple ancestors
        //        // call base methods. Argument 1 is method name, subsequent args are method arguments
        //    newConstructor.prototype._supermethod = function () {
        //            var args = [];
        //            for (var i = 1, ii = arguments.length; i < ii; i++)
        //                args.push(arguments[i]);

        //            return parentClass.prototype[arguments[0]].apply(_this, args);
        //        };

        return newConstructor;
    };

    
    object.prototype._generateEventNamespace = (function () {
        var id = Math.floor(Math.random() * 1000);
        return function (eventName) {
            return "_event" + (++id);
        };
    })();

    object.prototype.registerEvent = function (eventName, eventHandler) {
        eventName += ("." + this._generateEventNamespace());
        $(this._events).on(eventName, function () { eventHandler(arguments[1]); });

        // return dispose function
        var _this = this;
        return function () {
            $(_this._events).off(eventName);
        }
    };

    object.prototype.triggerEvent = function (eventName, eventData) {
        $(this._events).trigger(eventName, eventData);
    };

    wpfko.base.object = object;
})();