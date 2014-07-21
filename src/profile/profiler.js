Class("wipeout.profile.profile", function () { 
    
    var doRendering, _initialize, rewriteTemplate, profileState;
    var profile = function profile(profile) {
        ///<summary>Profile this application.</summary>
        ///<param name="profile" type="Boolean" optional="true">Switch profiling on or off. Default is true</param>
        
        if(arguments.length === 0)
            profile = true;
        
        if((profile && profileState) || (!profile && !profileState)) return;
        
        doRendering = doRendering || wipeout.bindings.render.prototype.doRendering;
        _initialize = _initialize || wipeout.base.view.prototype._initialize;
        rewriteTemplate = rewriteTemplate || wipeout.template.engine.prototype.rewriteTemplate;
        
        if(profile) {
            profileState = {
                highlighter: new wipeout.profile.highlighter(),
                infoBox: wipeout.utils.html.createElement(
                    '<div style="position: fixed; top: 10px; right: 10px; background-color: white; padding: 10px; border: 2px solid gray; display: none; max-height: 500px; overflow-y: scroll; z-index: 10000"></div>'),
                eventHandler: function(e) {
                    if (!e.ctrlKey) return;
                    e.stopPropagation();
                    e.preventDefault();

                    var vm = wo.html.getViewModel(e.target);
					if(!vm) return;
                    var vms = vm.getParents();
                    vms.splice(0, 0, vm);

                    // todo: dispose of old content (dispose methods from buildProfile function)
                    profileState.infoBox.innerHTML = '<span style="float: right; margin-left: 10px; cursor: pointer;">x</span>Open a console window and click on a class to debug it';
                    profileState.infoBox.firstChild.addEventListener("click", function() { profileState.infoBox.style.display = "none"; });

                    var html = [];
                    for (var i = 0, ii = vms.length; i < ii; i++)
                        profileState.infoBox.appendChild(buildProfile(vms[i]).element);
                    
                    profileState.infoBox.style.display = "block";
                },
                dispose: function() {
                    profileState.highlighter.dispose();
                    if(profileState.infoBox.parentElement)
                        profileState.infoBox.parentElement.removeChild(profileState.infoBox);
                    
                    document.body.removeEventListener("click", profileState.eventHandler);
                    wipeout.bindings.render.prototype.doRendering = doRendering;
                    wipeout.base.view.prototype._initialize =  _initialize;
                    wipeout.template.engine.prototype.rewriteTemplate = rewriteTemplate;
                }
            };
            
            wipeout.bindings.render.prototype.doRendering = function() {
                var before = new Date();
                doRendering.apply(this, arguments);
                var time = new Date() - before;
                
                if(!this.value.__woBag.profiler)
                    this.value.__woBag.profiler = {};
                
                this.value.__woBag.profiler["Render time"] = time;
                var template = document.getElementById(this.value.templateId());
                if(template)
                    this.value.__woBag.profiler["Template compile time"] =  wipeout.utils.domData.get(template, "rewriteTemplateTime");
            };
            
             wipeout.base.view.prototype._initialize = function() {
                var before = new Date();
                _initialize.apply(this, arguments);
                var time = new Date() - before;
                
                if(!this.__woBag.profiler)
                    this.__woBag.profiler = {};
                
                this.__woBag.profiler["Initialize time"] = time;
             };
            
            wipeout.template.engine.prototype.rewriteTemplate = function(template) {
                var before = new Date();
                rewriteTemplate.apply(this, arguments);
                var time = new Date() - before;
                
                var script = document.getElementById(template);
                if (script instanceof HTMLElement) {
                    var oldTime = wipeout.utils.domData.get(script, "rewriteTemplateTime");
                    if(oldTime instanceof Number)
                        time += oldTime;
                    
                    wipeout.utils.domData.set(script, "rewriteTemplateTime", time);
                }
            };
            
            document.body.appendChild(profileState.infoBox);
            document.body.addEventListener("click", profileState.eventHandler, false);
            
        } else {
            profileState.dispose();            
            profileState = null;
        }
        
        return;
    };
    
    var viewVm = new Function("viewModel", "model", "//Use your browser's debugger to inspect the model and view model\ndebugger;");
    
	var functionName = /^function\s*([^\s(]+)/;
    var buildProfile = function(vm) {
                
        var div = document.createElement('div');
        wipeout.utils.domData.set(div, wipeout.bindings.wipeout.utils.wipeoutKey, vm);
        
		// IE doesn't support name
		var tmp;		
		var fn = vm.constructor.name ? 
			vm.constructor.name :
			((tmp = vm.constructor.toString().match(functionName)) ? tmp[1] : 'unknown vm type');
			
        var innerHTML = ["<h4 style='cursor: pointer; margin-bottom: 5px;'>" + fn + "</h4>"];
        if(vm.__woBag.profiler)
            for(var i in vm.__woBag.profiler)
                innerHTML.push("<label>" + i + ":</label> " + vm.__woBag.profiler[i]);
        
        div.innerHTML += innerHTML.join("<br />");
        
        function listener() {
            viewVm(vm, vm.model());
        }
        
        div.firstChild.addEventListener("click", listener, false);
        
        return {
            element: div,
            dispsoe: function() {
                div.firstChild.removeEventListener("click", listener);
                wipeout.utils.domData.clear(div);
            }
        };
    };    
    
    return profile;
});