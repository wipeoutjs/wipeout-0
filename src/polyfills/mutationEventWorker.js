Class("wipeout.polyfils.mutationEventWorker", function () {
    return wipeout.polyfils.mutationWorkerBase.extend({
        constructor: function(element) {
            this._super(element);
            
            this.nodes = wipeout.utils.obj.copyArray(this.element.childNodes);
            var _this = this;
            this.onModified = function(mutationEvent) {
                var token = {};

                _this.waiting = token;
                setTimeout(function() {
                    if(_this.waiting === token)
                        _this.onMutation();
                }, 50);
            };
            
            //TODO: removeEventListener
            this.element.addEventListener("DOMSubtreeModified", this.onModified);
        },
        onMutation: function() {
            var diff = [];
            var newNodes = wipeout.utils.obj.copyArray(this.element.childNodes);
            for(var i = 0, ii = this.nodes.length; i < ii; i++) {
                if(newNodes.indexOf(this.nodes[i]) === -1)
                    diff.push(this.nodes[i]);
            }

            this.nodes = newNodes;
            enumerate(this.callbacks, function(callback) {
                setTimeout(function() {
                    callback([{removedNodes:diff}]);
                }, 0);
            });
        }
    });
});