Class("wipeout.profile.profiler", function () { 
    var jQ = function() {
        if(!window.jQuery)
            throw "This debug tool requires jQuery";
    };
    
    var profiler = wipeout.base.object.extend(function(vm) {
        jQ();
        this.vm = vm;
        this.cssClass = "wipeout-profiler-" + profiler.newId();
    });
    
    profiler.createStyle = function() {
        if(profiler.style)
            return;
        
        profiler.style = document.createElement("style");     
        $("body").append(profiler.style);   
    };
    
    profiler.prototype.allNodes = function() {
        var $elements = $(wipeout.utils.ko.virtualElements.childNodes(this.vm.__woBag.rootHtmlElement));
        return $elements.find('*').add($elements);
    };
    
    var eventNamespace = ".wipeoutProfiler";
    profiler.prototype.profile = function() {
        profiler.createStyle();
        
        var vm = this.vm;
        
        var _this = this;
        this.allNodes().addClass(_this.cssClass).on("click" + eventNamespace, function (e) {
                e.preventDefault();
                e.stopPropagation();

                wipeout.profile.utils.popup(wipeout.profile.utils.generateInfo(vm));
            });
        
        //profiler.style.innerHTML += "." + this.cssClass + " {background-color:#" + wipeout.profile.utils.generateColour() + " !important;}";
        profiler.style.innerHTML += "." + this.cssClass + " {background-color:#efcdd9 !important;}";
    };
    
    profiler.prototype.dispose = function() {
        // TODO: where nodeType = 1
        this.allNodes()
            .off("click" + eventNamespace)
            .removeClass(this.cssClass);
    };
        
    profiler.newId = (function () {
        var i = 0;
        return function() {
            return ++i;
        };
    })();
    
    function queue() {
        this.items = [];
    };
    
    queue.prototype.push = function(callback) {
        var _this = this;
        var cb = function() {
            
            _this.items.splice(_this.items.indexOf(cb), 1);
            
            callback();
                        
            if (_this.items.length)
                _this.items.splice(0, 1)[0](_this);
        };
        
        this.items.push(cb);
        
        if(this.items[0] === cb)
            cb();
    };
    
    profiler.profile = function() {
        var timeout;
        var q = new queue();
        var currentElement = null;
        var currentProfiler = {dispose: function(){}};
        $("body").on("mouseover", function(e) {
            if(!e.fromElement || currentElement === e.fromElement) return;
            
            currentElement = e.fromElement;
            var vm = wipeout.utils.html.getViewModel(currentElement);
            if(!vm || vm === currentProfiler.vm) return;
                        
            if(timeout) clearTimeout(timeout);
            
            // makes it less jumpy
            timeout = setTimeout(function() {
                // like thread.lock
                q.push(function() {
                    currentProfiler.dispose();
                    currentProfiler = new profiler(vm);
                    currentProfiler.profile();
                });
            }, 100);
        });
    };
    
    return profiler;
});