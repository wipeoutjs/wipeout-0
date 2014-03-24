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
    
    profiler.prototype.level1Nodes = function() {
        // TODO: where nodeType = 1
        return wipeout.utils.ko.virtualElements.childNodes(this.vm.__woBag.rootHtmlElement);
    };
    
    var eventNamespace = ".wipeoutProfiler";
    profiler.prototype.profile = function() {
        profiler.createStyle();
        
        var vm = this.vm;
        
        enumerate(this.level1Nodes(), function(element) {
            $el = $(element);
            
            $el.addClass(this.cssClass);
            $el.on("click" + eventNamespace, function (e) {
                e.preventDefault();
                e.stopPropagation();

                wipeout.profile.utils.popup(wipeout.profile.utils.generateInfo(vm));
            });            
        }, this);
        
        profiler.style.innerHTML += "." + this.cssClass + " {background-color:#" + wipeout.profile.utils.generateColour() + " !important;}";
    };
    
    profiler.prototype.dispose = function() {
        // TODO: where nodeType = 1
        $(this.level1Nodes())
            .off("click" + eventNamespace)
            .removeClass(this.cssClass);
    };
        
    profiler.newId = (function () {
        var i = 0;
        return function() {
            return ++i;
        };
    })();
    
    profiler.profile = function(rootViewModel) {
        
        var profiles = [];        
        enumerate(wipeout.debug.renderedItems(rootViewModel.__woBag.rootHtmlElement), function(vm) {
            var p = new profiler(vm);
            p.profile();
            profiles.push(p);
        });
        
        return {
            dispose: function() {
                enumerate(profiles, function(profile) {
                    profile.dispose();
                });
            }
        }
    };
    
    return profiler;
});