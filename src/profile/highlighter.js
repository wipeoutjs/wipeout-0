Class("wipeout.profile.highlightVM", function () { 
    
    var highlightVM = wipeout.base.object.extend(function(vm, cssClass) {
        ///<summary>Highlight all of the nodes in a view model.</summary>
        ///<param name="vm" type="wo.view" optional="false">The view model to highlight</param>
        ///<param name="cssClass" type="String" optional="false">The class to use to highlight it</param>
        
        ///<Summary type="wo.view">The view model</Summary>
        this.vm = vm;
        
        ///<Summary type="String">The css class</Summary>
        this.cssClass = cssClass;
                
        ///<Summary type="Array" generic0="Node">The nodes belonging to the view model</Summary>
        this.nodes = vm.entireViewModelHtml();
        
        wipeout.utils.obj.enumerate(this.nodes, function(node) {
            if (node.classList)
                node.classList.add(this.cssClass)
        }, this);
    });
    
    highlightVM.prototype.dispose = function() {
        ///<summary>Dispose of this instance.</summary>
        
        wipeout.utils.obj.enumerate(this.nodes, function(node) {
            if (node.classList)
                node.classList.remove(this.cssClass)
        }, this);
    };
    
    return highlightVM;
});

Class("wipeout.profile.highlighter", function () { 
    
    highlighter.newId = (function () {
        var i = 0;
        return function() {
            ///<summary>Get a unique id int.</summary>
            ///<returns type="Number">The id</returns>
            
            return ++i;
        };
    })();
    
    highlighter.generateColour = function() {
        ///<summary>Generate a random pastel colour.</summary>
        ///<returns type="String">THe colour code</returns>
        
        var red = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);
        var green = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);
        var blue = Math.floor((wipeout.utils.obj.random(255) + 255) / 2);

        return red.toString(16) + green.toString(16) + blue.toString(16);
    };
    
    function highlighter() {
        ///<summary>Highlight any view model which the mouse is over.</summary>
        
        ///<Summary type="Element">The style element for this highlighter</Summary>
        this.style = document.createElement("style");     
        
        ///<Summary type="Number">The current css class index</Summary>
        this.index = 0;
        
        ///<Summary type="Array" generic0="String">The css classes belonging to this profiler</Summary>
        this.styles = [
            "wipeout-profiler-" + highlighter.newId(),
            "wipeout-profiler-" + highlighter.newId(),
            "wipeout-profiler-" + highlighter.newId(),
            "wipeout-profiler-" + highlighter.newId(),
            "wipeout-profiler-" + highlighter.newId()
        ];
        
        // generate 5 colours
        for(var i = 0, ii = this.styles.length; i < ii; i++)
            this.style.innerHTML += 
                " ." + this.styles[i] + " {background-color:#" + highlighter.generateColour() + " !important; cursor: pointer !important}";
        
        document.head.appendChild(this.style);
        
        // dummy highlighter to deal with first dispose
        ///<Summary type="wipeout.profile.highlightVM">The current highlight vm wrapper</Summary>
        this.currentHighlighter = {dispose: function(){}};
        
        var _this = this;
        
        ///<Summary type="Function">A placeholder to be used in disposal</Summary>
        this.eventHandler = function(e) {
            _this.highlightVM(e);
        };
        
        window.addEventListener("mousemove", this.eventHandler, false);
    };
            
    highlighter.prototype.nextStyle = function() {
        ///<summary>Get one of the 5 css classes belonging to this object. Classes are chosen sequentially.</summary>
        ///<returns type="String">The class</returns>
        
        if(this.index >= this.styles.length - 1)
            this.index = 0;
        else
            this.index++;
        
        return this.styles[this.index];
    };
    
    highlighter.prototype.highlightVM = function(e) {
        ///<summary>Highlight the current view model.</summary>
        ///<param name="e" type="Any" optional="false">Mousemove event args</param>
        
        var newElement = document.elementFromPoint(e.clientX, e.clientY);
        if(newElement === this.currentElement) return;
        this.currentElement = newElement;
        var vm = wipeout.utils.html.getViewModel(this.currentElement);
        if(!vm || vm === this.currentHighlighter.vm) return;

        var timeout = this.__timeoutToken = {};

        var _this = this;
        setTimeout(function() {
            if(_this.__timeoutToken !== timeout) return;
            
            _this.currentHighlighter.dispose();
            _this.currentHighlighter = new wipeout.profile.highlightVM(vm, _this.nextStyle());
        }, 100);
    };
    
    highlighter.prototype.dispose = function() {
        ///<summary>Dispose of this instances.</summary>
        
        if(this.style.parentElement)
            this.style.parentElement.removeChild(this.style);
        
        delete this.__timeoutToken;
        window.removeEventListener("mousemove", this.eventHandler);
        this.currentHighlighter.dispose();
    };
    
    return highlighter;
});