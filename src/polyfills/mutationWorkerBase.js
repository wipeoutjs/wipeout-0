
Class("wipeout.polyfils.mutationWorkerBase", function () {
    return wipeout.base.object.extend({
        constructor: function(element) {
            this._super();
            
            this.element = element;
            this.callbacks = [];
        }
    });
});