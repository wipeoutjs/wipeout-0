


(function () {
    
    window.wpfko = window.wpfko || {};
    wpfko.util = wpfko.util || {};
    
    var oneWayBinding = function(bindFrom, bindToObject, bindToProperty) {
        
        this.bindToObject = bindToObject;
        this.bindToProperty = bindToProperty;
        
        this.set(bindFrom);

        // bind model to viewModel
        if (ko.isObservable(bindFrom)) {
            var binding2;
            var binding1 = bindFrom.subscribe(function (bindFromVal) {
                var bindToVal = ko.utils.unwrapObservable(bindToObject[bindToProperty]);
                if (bindFromVal !== bindToVal) {
                    this.set(bindToVal);
                }
            }, this);
    
            // if it is an observable array we need to inform the bindTo property when the contents of the array change
            // the equality statement in the previous binding will stop this from happening automatically
            if (bindFrom.deepSubscribe && bindFrom.deepSubscribe === ko.observableArray.fn.deepSubscribe && ko.isObservable(bindToObject[bindToProperty])) {
                binding2 = bindFrom.deepSubscribe(function (removedVaues, addedValues) {
                    if ((removedVaues && removedVaues.length) || (addedValues && addedValues.length)) {
                        bindToObject[bindToProperty].valueHasMutated();
                    }
                });
            }
    
            this.dispose = function() {
                if (binding1) {
                    binding1.dispose();
                    binding1 = null;
                }

                if (binding2) {
                    binding2.dispose();
                    binding2 = null;
                }
            };
        } else {
            this.dispose = function(){};
        }
    };  

    oneWayBinding.prototype.set = function (value) {
        value = ko.utils.unwrapObservable(value);
        if (ko.isObservable(this.bindToObject[this.bindToProperty])) {
            this.bindToObject[this.bindToProperty](value);
        } else {
            this.bindToObject[this.bindToProperty] = value;
        }
    }; 
    
    wpfko.util.oneWayBinding = oneWayBinding;    
})();