
(function () {

        ﻿window.wpfko = window.wpfko || {};
wpfko.base = wpfko.base || {};
    
    var object = function (values) {
        this._events = {};

        if (values) {
            $.extend(this, values);
        }
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

    wpfko.base.object = object;
})();