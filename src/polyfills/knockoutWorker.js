Class("wipeout.polyfils.knockoutWorker", function () {
    return wipeout.polyfils.mutationWorkerBase.extend({
        constructor: function(element) {
            this._super(element);
            
            var _this = this;
            enumerate(this.element.childNodes, function(node) {
                ko.utils.domNodeDisposal.addDisposeCallback(node, function() {
                    enumerate(_this.callbacks, function(callback) {
                        setTimeout(function() {
                            callback([{removedNodes:[node]}]);
                        }, 0);
                    });
                });
            });
        }
    });
});