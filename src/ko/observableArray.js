
var wpfko = wpfko || {};
    wpfko.ko = wpfko.ko || {};

(function () {
    
    var copyArray = function (array) {
        var output = [];
        for (var i = 0, ii = array.length; i < ii; i++) {
            output[i] = array[i];
        }

        return output;
    };

    var getCount = function (items) {
        ///<summary>Return an array of unique elements in the array with the amount of times they appear</summary>
        var count = [];
        for (var i = 0, ii = items.length; i < ii; i++) {
            var _break = false;
            for (var j = 0, jj = count.length; j < jj; j++) {
                if (count[j].value === items[i]) {
                    _break = true;
                    count[j].count++;
                    break;
                }
            }

            if (!_break) {
                count.push({ value: items[i], count: 1 });
            }
        }

        return count;
    };

    var deepSubscribe = function (subscribeFunction, context /*optional*/) {
        ///<summary>ko subscribe function, however gives the callback a list of items added and removed from the array</summary>
        var initial = wpfko.ko.observableArray.utils.copyArray(this() || []);
        
        return this.subscribe(function (values) {

            // reused in loops
            var i, ii, j, jj, val;
            var addedValues = [];
            var removedValues = [];
            
            // get unique items in each array with a count
            var initialCount = wpfko.ko.observableArray.utils.getCount(initial);
            var valuesCount = wpfko.ko.observableArray.utils.getCount(values);

            for (i = 0, ii = initialCount.length; i < ii; i++) {
                val = null;
                for (j = 0, jj = valuesCount.length; j < jj; j++) {
                    if (initialCount[i].value === valuesCount[j].value) {

                        // remove found value from valuesCount, anything left
                        // in valuesCount after operation will be taken as added
                        val = valuesCount.splice(j, 1)[0];
                        var diff = val.count - initialCount[i].count;
                        
                        // if diff != 0, a value was added or removed
                        while (diff > 0) {
                            addedValues.push(val.value);
                            diff--;
                        }
                        while (diff < 0) {
                            removedValues.push(val.value);
                            diff++;
                        }

                        break;
                    }
                }

                // if match not found, the objects must have been removed
                if (!val) {
                    for (j = 0; j < initialCount[i].count; j++) {
                        removedValues.push(initialCount[i].value);
                    }
                }
            }

            // anything left in values as been added
            for (i = 0, ii = valuesCount.length; i < ii; i++) {
                for (j = 0; j < valuesCount[i].count; j++) {
                    addedValues.push(valuesCount[i].value);
                }
            }

            // reset for next call
            initial = wpfko.ko.observableArray.utils.copyArray(values);
            subscribeFunction.call(this, removedValues, addedValues);
        }, context);
    };    
    
    wpfko.ko.observableArray = {
        deepSubscribe: deepSubscribe,
        utils: {
            copyArray: copyArray,
            getCount: getCount
        }
    };
    
    for(var i in wpfko.ko.observableArray) {
        if(i !== "utils") {
            ko.observableArray.fn[i] = wpfko.ko.observableArray[i];
        }
    }
})();