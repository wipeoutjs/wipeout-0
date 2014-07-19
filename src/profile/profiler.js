Class("wipeout.profile.profile", function () { 
    
    var doRendering, profileState;
    var profile = function(profile) {
        ///<summary>Profile this application.</summary>
        ///<param name="profile" type="Boolean" optional="true">Switch profiling on or off. Default is true</param>
        
        if(arguments.length === 0)
            profile = true;
        
        if((profile && profileState) || (!profile && !profileState)) return;
        
        doRendering = doRendering || wipeout.bindings.render.prototype.doRendering;
        
        if(profile) {
            profileState = {
                highlighter: new wipeout.profile.highlighter(),
                infoBox: wipeout.utils.html.createElement(
                    '<div style="position: fixed; top: 10px; right: 10px; background-color: white; padding: 10px; border: 2px solid gray; display: none; max-height: 500px; overflow-y: scroll; z-index: 10000"></div>'),
                eventHandler: function(e) {
                    if (!e.altKey) return;
                    e.stopPropagation();
                    e.preventDefault();

                    var vm = wo.html.getViewModel(e.target);
                    var vms = vm.getParents();
                    vms.splice(0, 0, vm);

                    profileState.infoBox.innerHTML = '<span style="float: right; margin-left: 10px; cursor: pointer;">x</span>click on a class to view it\'s details in a console window';
                    profileState.infoBox.firstChild.addEventListener("click", function() { profileState.infoBox.style.display = "none"; });

                    var html = [];
                    for (var i = 0, ii = vms.length; i < ii; i++)
                        profileState.infoBox.appendChild(buildProfile(vms[i]));
                    
                    profileState.infoBox.style.display = null;
                },
                dispose: function() {
                    profileState.highlighter.dispose();
                    if(profileState.infoBox.parentElement)
                        profileState.infoBox.parentElement.removeChild(profileState.infoBox);
                    
                    document.body.removeEventListener("click", profileState.eventHandler);
                    wipeout.bindings.render.prototype.doRendering = doRendering;
                }
            };
            
            wipeout.bindings.render.prototype.doRendering = function() {
                var before = new Date();
                doRendering.apply(this, arguments);
                var time = new Date() - before;
                
                if(!this.value.__woBag.profiler)
                    this.value.__woBag.profiler = {};
                
                this.value.__woBag.profiler["Render time"] = time;
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
    
    var buildProfile = function(vm) {
                
        var div = document.createElement('div');
        
        var innerHTML = ["<h4 style='cursor: pointer; margin-bottom: 5px;'>" + (vm.constructor.__woName || 'unknown vm type') + "</h4>"];
        if(vm.__woBag.profiler)
            for(var i in vm.__woBag.profiler)
                innerHTML.push("<label>" + i + ":</label> " + vm.__woBag.profiler[i]);
        
        div.innerHTML += innerHTML.join("");
        div.firstChild.addEventListener("click", function() {
            viewVm(vm, vm.model());
        }, false);
        
        return div;
    };    
    
    return profile;
});