(function(){window.Wipeout={};Wipeout.compiler=(function(){var f=function(h,g){this.classes=[];for(var j=0,k=h.length;j<k;j++){this.classes.push(h[j])}this.compiled=[];for(var j=0,k=g.length;j<k;j++){this.compiled.push({name:g[j],value:e(g[j])})}};function e(k){var g=window;k=k.split(".");for(var h=0,j=k.length;h<j;h++){g=g[k[h]]}return g}f.prototype.checkDependency=function(g){for(var h=0,j=this.compiled.length;h<j;h++){if(this.compiled[h].name===g){return true}}return false};f.prototype.getClass=function(g){for(var h=0,j=this.compiled.length;h<j;h++){if(this.compiled[h].name===g){return this.compiled[h].value}}return null};f.prototype.checkDependencies=function(g){for(var h=0,j=g.length;h<j;h++){if(!this.checkDependency(g[h])){return false}}return true};f.prototype.compile=function(){while(this.classes.length){var l=this.classes.length;for(var h=0;h<this.classes.length;h++){if(this.checkDependencies(this.classes[h].dependencies)){var g=this.classes[h].className;if(g.indexOf(".")!==-1){g=g.substr(g.lastIndexOf(".")+1)}var m=this.classes[h].constructor();var o={};for(var k in m){o[k]=m[k]}var n=m.prototype;m=this.getClass(this.classes[h].parentClass).extend(m,g);for(k in n){m.prototype[k]=n[k]}for(k in o){m[k]=o[k]}this.compiled.push({name:this.classes[h].className,value:m});this.classes.splice(h,1);h--}}if(l===this.classes.length){throw {message:"Cannot compile remainig classes. They all have dependencies not registered with this constructor",classes:this.classes}}}};function d(i,g,h){this.rootNamespace=i;this.baseClass=g;this.dependencies=h||[];this.classes=[]}d.prototype.namespaceCorrectly=function(g){if(this.rootNamespace&&g&&g.indexOf(this.rootNamespace+".")===0){g=g.substr(this.rootNamespace.length+1)}return g};d.prototype.registerClass=function(h,l,g){var l=!l||l===this.baseClass?this.baseClass:this.namespaceCorrectly(l);var m={className:this.namespaceCorrectly(h),constructor:g,parentClass:l,dependencies:[l]};for(var j=0,k=this.classes.length;j<k;j++){if(this.classes[j].className===m.className){throw"There is already a class named "+h}}for(j=3,k=arguments.length;j<k;j++){m.dependencies.push(this.namespaceCorrectly(arguments[j]))}this.classes.push(m)};d.append=function(g,l){var k=g.name.split(".");for(var h=0,j=k.length-1;h<j;h++){l=l[k[h]]=l[k[h]]||{}}l[k[h]]=g.value};d.prototype.compile=function(l){l=l||{};var g=[this.baseClass];for(var h=0,k=this.dependencies.length;h<k;h++){g.push(this.dependencies[h])}var j=new f(this.classes,g);j.compile();for(h=1+this.dependencies.length,k=j.compiled.length;h<k;h++){d.append(j.compiled[h],l)}return l};return d})();var a=new Wipeout.compiler("Wipeout","wo.object",["wo.visual","wo.view","wo.contentControl","wo.itemsControl","wo.if"]);var b=function(f,d,e){e=e||window;if(f){for(var g=0,h=f.length;g<h;g++){d.call(e,f[g],g)}}};var c=function(e,f){var d=f||window;b(e.split("."),function(g){d=d[g]});return d};a.registerClass("Wipeout.Docs.Models.Application","wo.object",function(){d.prototype.back=function(){if(this.contentCacheIndex<1){return}try{this.doNotCacheContent=true;this.contentCacheIndex--;this.content(this.contentCache[this.contentCacheIndex])}finally{this.doNotCacheContent=false}};d.prototype.forward=function(){if(this.contentCacheIndex>=this.contentCache.length){return}try{this.doNotCacheContent=true;this.contentCacheIndex++;this.content(this.contentCache[this.contentCacheIndex])}finally{this.doNotCacheContent=false}};function d(){this.content=ko.observable();this.content.subscribe(function(D){if(this.doNotCacheContent){return}this.contentCacheIndex++;this.contentCache.length=this.contentCacheIndex;this.contentCache.push(D)},this);this.contentCacheIndex=-1;this.doNotCacheContent=false;this.contentCache=[];this.content(new Wipeout.Docs.Models.Pages.LandingPage());var q=new Wipeout.Docs.Models.Components.Api();var n=null;var v=null;var r=null;var h=null;var y=null;var o=null;var A=null;var z=null;var p=null;var s=null;var t=null;var x=null;var C=null;var u=null;var w=null;var B=null;var m=null;var k=null;var g=null;var l=(function(){v=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",q.forClass("wo.object"));for(var F=0,G=v.branches.length;F<G;F++){if(v.branches[F].name==="_super"){h=v.branches[F];break}}for(var F=0,G=v.branches.length;F<G;F++){if(v.branches[F].name==="extend"){r=v.branches[F];break}}for(var F=0,G=v.branches.length;F<G;F++){if(v.branches[F].name==="useVirtualCache"){y=v.branches[F];break}}for(var F=0,G=v.branches.length;F<G;F++){if(v.branches[F].name==="clearVirtualCache"){o=v.branches[F];break}}x=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",q.forClass("wo.routedEventModel"));A=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",q.forClass("wo.visual"));for(var F=0,G=A.branches.length;F<G;F++){if(A.branches[F].name==="woInvisible"){C=A.branches[F];break}}z=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",q.forClass("wo.view"));p=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",q.forClass("wo.contentControl"));s=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",q.forClass("wo.if"));t=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",q.forClass("wo.itemsControl"));var D=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",q.forClass("wo.event"));var M=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",q.forClass("wo.routedEvent"));var L=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",q.forClass("wo.routedEventArgs"));var N=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",q.forClass("wo.routedEventRegistration"));var E=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",q.forClass("wo.html"));var J=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",q.forClass("wo.ko.virtualElements"));var H=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",q.forClass("wo.ko.array"));var I=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",q.forClass("wo.ko"),{staticProperties:{virtualElements:J,array:H}});var K=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",q.forClass("wo.obj"));for(var F=0,G=z.branches.length;F<G;F++){if(z.branches[F].name==="bind"){n=z.branches[F];break}}return new Wipeout.Docs.Models.Components.TreeViewBranch("wo",[p,D,s,E,t,I,K,v,M,L,x,N,z,A])})();var e=(function(){var G=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",q.forClass("wipeout.bindings.itemsControl"));var H=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",q.forClass("wipeout.bindings.render"));var I=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",q.forClass("wipeout.bindings.wipeout-type"));var F=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",q.forClass("wipeout.bindings.wo"));var E=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",q.forClass("wipeout.bindings.wipeout"));var D=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",q.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[D,G,H,I,F,E])})();var j=(function(){var D=(function(){var L=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("object",q.forClass("wo.object"));var O=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventModel",q.forClass("wo.routedEventModel"));var R=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("visual",q.forClass("wo.visual"));var Q=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("view",q.forClass("wo.view"));var H=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("contentControl",q.forClass("wo.contentControl"));var J=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("if",q.forClass("wo.if"));var K=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",q.forClass("wo.itemsControl"));var I=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("event",q.forClass("wo.event"));var N=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEvent",q.forClass("wo.routedEvent"));var M=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventArgs",q.forClass("wo.routedEventArgs"));var P=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("routedEventRegistration",q.forClass("wo.routedEventRegistration"));return new Wipeout.Docs.Models.Components.TreeViewBranch("base",[H,I,J,K,L,N,M,O,P,Q,R])})();var E=(function(){u=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("itemsControl",q.forClass("wipeout.bindings.itemsControl"));w=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("render",q.forClass("wipeout.bindings.render"));B=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout-type",q.forClass("wipeout.bindings.wipeout-type"));m=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wo",q.forClass("wipeout.bindings.wo"));k=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("wipeout",q.forClass("wipeout.bindings.wipeout"));g=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ic-render",q.forClass("wipeout.bindings.ic-render"));return new Wipeout.Docs.Models.Components.TreeViewBranch("bindings",[g,u,w,B,m,k])})();var F=(function(){q.forClass("ko.templateEngine");var H=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("engine",q.forClass("wipeout.template.engine"));var I=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("htmlBuilder",q.forClass("wipeout.template.htmlBuilder"));return new Wipeout.Docs.Models.Components.TreeViewBranch("template",[H,I])})();var G=(function(){var H=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("html",q.forClass("wipeout.utils.html"));var K=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("virtualElements",q.forClass("wipeout.utils.ko.virtualElements"));var I=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("array",q.forClass("wipeout.utils.ko.array"));var J=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("ko",q.forClass("wipeout.utils.ko"),{staticProperties:{virtualElements:K,array:I}});var L=new Wipeout.Docs.Models.Components.ClassTreeViewBranch("obj",q.forClass("wipeout.utils.obj"));return new Wipeout.Docs.Models.Components.TreeViewBranch("utils",[H,J,L])})();return new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout (debug mode only)",[D,e,F,G])})();var i=(function(){var G=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Introduction","IntroductionPage");var F=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Hello Wipeout","HelloWipeoutPage");var E=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("A more complex example","AMoreComplexExamplePage");E.payload().intro=G.payload();E.payload().hello=F.payload();var D=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Lets build an app","LetsBuildAnPppPage");return[G,F,E,D]})();var f=(function(){var G=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Skipping a binding context","SkippingABindingContextPage");G.payload().woInvisible=C.payload();G.payload().visual=A.payload();G.payload()._if=s.payload();var F=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout OO framework","WipeoutObjectOrientedFrameworkPage");F.payload().object=v.payload();F.payload()._super=h.payload();F.payload().extend=r.payload();F.payload().useVirtualCache=y.payload();F.payload().clearVirtualCache=o.payload();var D=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Binding Properties","BindingPropertiesPage");D.payload().bindFunction=n.payload();var E=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Models","ModelsPage");var J=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout Native Classes","WipeoutNativeClassesPage");J.payload().object=v.payload();J.payload().routedEventModel=x.payload();J.payload().visual=A.payload();J.payload().view=z.payload();J.payload().contentControl=p.payload();J.payload()._if=s.payload();J.payload().itemsControl=t.payload();J.payload().woInvisible=G.payload();var I=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("Wipeout Native Bindings","WipeoutNativeBindingsPage");I.payload().itemsControl=u.payload();I.payload().itemsControlClass=t.payload();I.payload().viewClass=z.payload();I.payload().render=w.payload();I.payload().wipeout_type=B.payload();I.payload()._wo=m.payload();I.payload()._wipeout=k.payload();I.payload()._icRender=g.payload();var H=new Wipeout.Docs.Models.Components.StaticPageTreeViewBranch("View Model Lifecycle","ViewModelLifecyclePage");return[F,J,I,D,E,G,H]})();this.menu=new Wipeout.Docs.Models.Components.TreeViewBranch("wipeout",[new Wipeout.Docs.Models.Components.TreeViewBranch("Tutorial",i),new Wipeout.Docs.Models.Components.TreeViewBranch("Features",f),new Wipeout.Docs.Models.Components.TreeViewBranch("API",[l,e,j])])}return d});a.registerClass("Wipeout.Docs.Models.Components.Api","wo.object",function(){var d=function(e){this._super();this.classes=[]};d.prototype.getClassDescription=function(e){for(var f=0,g=this.classes.length;f<g;f++){if(this.classes[f].classConstructor===e){return this.classes[f].classDescription}}};d.prototype.forClass=function(f){var e=c(f);var h=this.getClassDescription(e);if(h){return h}var g=new Wipeout.Docs.Models.Descriptions.Class(f,this);this.classes.push({classDescription:g,classConstructor:e});return g};return d});a.registerClass("Wipeout.Docs.Models.Components.ClassTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){var d=function(g,e,f){this._super(g,e,d.compileBranches(e,f))};d.compileBranches=function(e,f){var g=[];f=f||{};f.staticEvents=f.staticEvents||{};f.staticProperties=f.staticProperties||{};f.staticFunctions=f.staticFunctions||{};f.events=f.events||{};f.properties=f.properties||{};f.functions=f.functions||{};g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch("constructor"));b(e.staticEvents,function(h){if(f.staticEvents[h.eventName]){g.push(f.staticEvents[h.eventName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.eventName,null))}});b(e.staticProperties,function(h){if(f.staticProperties[h.propertyName]){g.push(f.staticProperties[h.propertyName])}else{g.push(new Wipeout.Docs.Models.Components.PropertyTreeViewBranch(h))}});b(e.staticFunctions,function(h){if(f.staticFunctions[h.functionName]){g.push(f.staticFunctions[h.functionName])}else{g.push(new Wipeout.Docs.Models.Components.FunctionTreeViewBranch(h))}});b(e.events,function(h){if(f.events[h.eventName]){g.push(f.events[h.eventName])}else{g.push(new Wipeout.Docs.Models.Components.PageTreeViewBranch(h.eventName,null))}});b(e.properties,function(h){if(f.staticProperties[h.propertyName]){g.push(f.staticProperties[h.propertyName])}else{g.push(new Wipeout.Docs.Models.Components.PropertyTreeViewBranch(h))}});b(e.functions,function(h){if(f.functions[h.functionName]){g.push(f.functions[h.functionName])}else{g.push(new Wipeout.Docs.Models.Components.FunctionTreeViewBranch(h))}});g.sort(function(){return arguments[0].name==="constructor"?-1:arguments[0].name.localeCompare(arguments[1].name)});return g};return d});a.registerClass("Wipeout.Docs.Models.Components.FunctionTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){var d=function(e){this._super(e.functionName,e)};return d});a.registerClass("Wipeout.Docs.Models.Components.PageTreeViewBranch","Wipeout.Docs.Models.Components.TreeViewBranch",function(){var d=function(f,g,e){this._super(f,e);this.page=g};d.prototype.payload=function(){return this.page};return d});a.registerClass("Wipeout.Docs.Models.Components.PropertyTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){var d=function(e){this._super(e.propertyName,e)};return d});a.registerClass("Wipeout.Docs.Models.Components.StaticPageTreeViewBranch","Wipeout.Docs.Models.Components.PageTreeViewBranch",function(){return function(d,e){this._super(d,new Wipeout.Docs.Models.Components.StaticPageTreeViewBranchTemplate(e))}});a.registerClass("Wipeout.Docs.Models.Components.StaticPageTreeViewBranchTemplate","wo.object",function(){return function(d){this._super();this.templateId=d}});a.registerClass("Wipeout.Docs.Models.Components.TreeViewBranch","wo.object",function(){var d=function(f,e){this._super();this.name=f;this.branches=e};d.prototype.payload=function(){return null};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.Argument","wo.object",function(){return function(d){this._super();this.name=d.name;this.type=d.type;this.optional=!!d.optional;this.description=d.description}});a.registerClass("Wipeout.Docs.Models.Descriptions.Class","wo.object",function(){var d=function(f,e){this._super();this.className=d.getClassName(f);this.constructorFunction=c(f);this.classFullName=f;this.api=e;this.classConstructor=null;this.events=[];this.staticEvents=[];this.properties=[];this.staticProperties=[];this.functions=[];this.staticFunctions=[];this.rebuild()};d.getClassName=function(e){e=e.split(".");return e[e.length-1]};d.prototype.rebuild=function(){this.classConstructor=null;this.events.length=0;this.staticEvents.length=0;this.properties.length=0;this.staticProperties.length=0;this.functions.length=0;this.staticFunctions.length=0;for(var h in this.constructorFunction){if(this.constructorFunction.hasOwnProperty(h)){if(this.constructorFunction[h] instanceof wo.event){this.staticEvents.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,h,this.classFullName))}else{if(this.constructorFunction[h] instanceof Function&&!ko.isObservable(this.constructorFunction[h])){this.staticFunctions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction[h],h,this.classFullName))}else{this.staticProperties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction,h,this.classFullName))}}}}for(var h in this.constructorFunction.prototype){if(this.constructorFunction.prototype.hasOwnProperty(h)){if(this.constructorFunction.prototype[h] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,h,this.classFullName))}else{if(this.constructorFunction.prototype[h] instanceof Function&&!ko.isObservable(this.constructorFunction.prototype[h])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction.prototype[h],h,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction,h,this.classFullName))}}}}if(this.constructorFunction.constructor===Function){var e=new this.constructorFunction();for(var h in e){if(e.hasOwnProperty(h)){if(e[h] instanceof wo.event){this.events.push(new Wipeout.Docs.Models.Descriptions.Event(this.constructorFunction,h,this.classFullName))}else{if(e[h] instanceof Function&&!ko.isObservable(e[h])){this.functions.push(new Wipeout.Docs.Models.Descriptions.Function(e[h],h,this.classFullName))}else{this.properties.push(new Wipeout.Docs.Models.Descriptions.Property(this.constructorFunction,h,this.classFullName))}}}}}if(this.constructorFunction.constructor===Function){var g=this.constructorFunction;while((g=Object.getPrototypeOf(g.prototype).constructor)!==Object){var k=this.api.getClassDescription(g);if(!k){throw"Class has not been defined yet"}var f=function(i,n){b(k[i],function(o){if(this[i].indexOf(o)!==-1){return}for(var p=0,q=this[i].length;p<q;p++){if(this[i][p][n]===o[n]){if(!this[i][p].overrides){this[i][p].overrides=o}return}}this[i].push(o)},this)};f.call(this,"events","eventName");f.call(this,"properties","propertyName");f.call(this,"functions","functionName")}}var l=function(i){b(this[i],function(o){var n=o;while(n&&n.overrides&&!n.summary){if(n.overrides.summary){n.summary=n.overrides.summary+(n.overrides.summaryInherited?"":" (from "+n.overrides.classFullName+")");n.summaryInherited=true}n=n.overrides}})};l.call(this,"staticProperties");l.call(this,"staticFunctions");l.call(this,"staticEvents");l.call(this,"events");l.call(this,"properties");l.call(this,"functions");for(var h=0,j=this.functions.length;h<j;h++){if(this.functions[h].functionName==="constructor"){this.classConstructor=this.functions.splice(h,1)[0];break}}if(h===this.functions.length){this.classConstructor=new Wipeout.Docs.Models.Descriptions.Function(this.constructorFunction,this.className,this.classFullName)}var m=function(){return arguments[0].name.localeCompare(arguments[1].name)};this.events.sort(m);this.staticEvents.sort(m);this.properties.sort(m);this.staticProperties.sort(m);this.functions.sort(m);this.staticFunctions.sort(m)};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.ClassItem","wo.object",function(){return function(d,e){this._super();this.name=d;this.summary=e}});a.registerClass("Wipeout.Docs.Models.Descriptions.Event","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var d=function(f,g,e){this._super(g,Wipeout.Docs.Models.Descriptions.Property.getPropertySummary(f,g));this.eventName=g;this.classFullName=e};return d});a.registerClass("Wipeout.Docs.Models.Descriptions.Function","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var e=function(i,h,g){this._super(h,e.getFunctionSummary(i));this["function"]=i;this.functionName=h;this.classFullName=g;this.arguments=e.getArguments(i);this.returns=e.getReturnSummary(i);this.overrides=null;this.fullyQualifiedName=ko.computed(function(){return this.classFullName+"."+this.functionName},this)};var f=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;var d=/([^\s,]+)/g;e.getArguments=function(l){if(!l||!(l instanceof Function)){return[]}var g=l.toString().replace(f,"");var k=g.slice(g.indexOf("(")+1,g.indexOf(")")).match(d);if(!k){return[]}for(var h=0,j=k.length;h<j;h++){k[h]=new Wipeout.Docs.Models.Descriptions.Argument(e.getArgumentSummary(k[h],l))}return k};e.removeFunctionDefinition=function(i){var h=i.indexOf("//");var g=i.indexOf("/*");var j=i.indexOf("{");if(h===-1){h=Number.MAX_VALUE}if(g===-1){g=Number.MAX_VALUE}if(j<h&&j<g){i=i.substr(j+1).replace(/^\s+|\s+$/g,"")}else{if(h<g){i=i.substr(i.indexOf("\n")).replace(/^\s+|\s+$/g,"")}else{i=i.substr(i.indexOf("*/")).replace(/^\s+|\s+$/g,"")}i=e.removeFunctionDefinition(i)}return i};e.getCommentsAsXml=function(l,g){var j=e.removeFunctionDefinition(l.toString());var k;if((k=j.search(g))!==-1){var h=j.substr(k+3);return new DOMParser().parseFromString(h.substr(0,h.indexOf("\n")),"application/xml").documentElement}return null};e.getArgumentSummary=function(g,j){var i=new RegExp('///\\s*<param\\s*name="'+g+'"\\s*(\\s+type=".*"){0,1}>.*</param>\\s*\n');var h=e.getCommentsAsXml(j,i);if(h){return{name:g,type:h.getAttribute("type"),optional:wo.view.objectParser.bool(h.getAttribute("optional")),description:h.innerHTML}}return{name:g}};e.getFunctionSummary=function(i){var h=new RegExp("///\\s*<summary>.*</summary>\\s*\n");var g=e.getCommentsAsXml(i,h);if(g){return g.innerHTML}return""};e.getReturnSummary=function(i){var h=new RegExp('///\\s*<returns\\s*(type=".*"){0,1}>.*</returns>\\s*\n');var g=e.getCommentsAsXml(i,h);if(g&&g.getAttribute("type")!=="void"){return{summary:g.innerHTML,type:g.getAttribute("type")}}return{type:"void"}};return e});a.registerClass("Wipeout.Docs.Models.Descriptions.Property","Wipeout.Docs.Models.Descriptions.ClassItem",function(){var e=function(g,h,f){this._super(h,e.getPropertySummary(g,h,f));this.propertyName=h;this.classFullName=f;this.fullyQualifiedName=ko.computed(function(){return this.classFullName+"."+this.propertyName},this)};var d=/^\/\//;e.getPropertySummary=function(g,h,f){var i;if(i=e.getPropertyDescriptionOverride(f+"."+h)){return i.description}g=g.toString();var j=function(n){var l=g.search(n);if(l!==-1){var k=g.substring(0,l);var m=k.lastIndexOf("\n");if(m>0){k=k.substring(m)}k=k.replace(/^\s+|\s+$/g,"");if(d.test(k)){return k.substring(2)}else{return null}}};i=j(new RegExp("\\s*this\\s*\\.\\s*"+h+"\\s*="));if(i){return i}return j(new RegExp('\\s*this\\s*\\[\\s*"'+h+'"\\s*\\]\\s*='))};e.getPropertyDescriptionOverride=function(f){var g=e.descriptionOverrides;b(f.split("."),function(h){if(!g){return}g=g[h]});return g};e.descriptionOverrides={wo:{"if":{woInvisibleDefault:{description:"The default value for woInvisible for the wo.if class."}},html:{specialTags:{description:"A list of html tags which cannot be placed inside a div element."}},ko:{array:{description:"Utils for operating on observableArrays",diff:{description:'ko constants for operating on array changes ("added", "deleted", "retained").'}},virtualElements:{description:"Utils for operating on knockout virtual elements"}},object:{useVirtualCache:{description:"When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."}},view:{objectParser:{description:"Used to parse string values into a given type"},reservedPropertyNames:{description:"Properties which cannot be set on a wipeout object via the template"}},visual:{reservedTags:{description:"A list of names which cannot be used as wipeout object names. These are mostly html tag names"},woInvisibleDefault:{description:"The default value for woInvisible for the wo.visual class."}}},wipeout:{template:{engine:{closeCodeTag:{description:'Signifies the end of a wipeout code block: "'+wipeout.template.engine.closeCodeTag+'".'},instance:{description:"An instance of a wipeout.template.engine which is used by the render binding."},openCodeTag:{description:'Signifies the beginning of a wipeout code block: "'+wipeout.template.engine.openCodeTag+'".'},scriptCache:{description:"A placeholder for precompiled scripts."},scriptHasBeenReWritten:{description:"Regex to determine whether knockout has rewritten a template."}}}}};return e});a.registerClass("Wipeout.Docs.Models.Pages.DisplayItem","wo.object",function(){return function(d){this._super();this.title=d}});a.registerClass("Wipeout.Docs.Models.Pages.LandingPage","Wipeout.Docs.Models.Pages.DisplayItem",function(){return function(d){this._super(d)}});a.registerClass("Wipeout.Docs.ViewModels.Application","wo.view",function(){function d(){this._super("Wipeout.Docs.ViewModels.Application");this.registerRoutedEvent(Wipeout.Docs.ViewModels.Components.TreeViewBranch.renderPage,function(e){this.model().content(e.data)},this)}d.prototype.onRendered=function(){this._super.apply(this,arguments);this.templateItems.treeView.select()};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.CodeBlock","wo.view",function(){var d=function(e){this._super(e||"Wipeout.Docs.ViewModels.Components.CodeBlock");this.code=ko.observable();this.code.subscribe(this.onCodeChanged,this);this.renderCode=ko.computed(function(){var f=this.code();return f?f.replace(/</g,"&lt;"):f},this)};d.prototype.onCodeChanged=function(e){};d.prototype.onRendered=function(){this._super.apply(this,arguments);prettyPrint(null,this.templateItems.codeBlock)};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.DynamicRender","wo.contentControl",function(){var d=function(){this._super();this.content=ko.observable();this.template("<!-- ko render: content --><!-- /ko -->")};d.prototype.onModelChanged=function(g,e){this._super(g,e);var g=this.content();if(e==null){this.content(null)}else{var f=null;if(e instanceof Wipeout.Docs.Models.Pages.LandingPage){f=new Wipeout.Docs.ViewModels.Pages.LandingPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Class){f=new Wipeout.Docs.ViewModels.Pages.ClassPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Event){f=new Wipeout.Docs.ViewModels.Pages.EventPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Property){f=new Wipeout.Docs.ViewModels.Pages.PropertyPage()}else{if(e instanceof Wipeout.Docs.Models.Descriptions.Function){f=new Wipeout.Docs.ViewModels.Pages.FunctionPage()}else{if(e instanceof Wipeout.Docs.Models.Components.StaticPageTreeViewBranchTemplate){f=new wo.view(e.templateId)}else{throw"Unknown model type"}}}}}}f.model(e);this.content(f)}};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.JsCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var d=function(){this._super.apply(this,arguments)};d.prototype.onCodeChanged=function(e){new Function(e.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))()};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.RaiseRoutedEvent","wo.contentControl",function(){function d(){this._super()}d.prototype.trigger=function(){this.triggerRoutedEvent(this.routedEvent,this.model())};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.TemplateCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var d=function(){d.staticConstructor();this._super.apply(this,arguments)};var e;d.staticConstructor=function(){if(e){return}e=document.createElement("div");e.setAttribute("style","display: none");document.getElementsByTagName("body")[0].appendChild(e)};d.prototype.onCodeChanged=function(f){e.innerHTML+=f.replace(/\&lt;/g,"<").replace(/\&gt;/g,">")};return d});a.registerClass("Wipeout.Docs.ViewModels.Components.TreeViewBranch","wo.view",function(){var d=function(){this._super(d.nullTemplate)};d.branchTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_branch";d.leafTemplate="Wipeout.Docs.ViewModels.Components.TreeViewBranch_leaf";d.nullTemplate=wo.visual.getBlankTemplateId();d.prototype.onModelChanged=function(f,e){this._super(f,e);if(e&&(e.branches||e.payload())){this.templateId(d.branchTemplate)}else{if(e){this.templateId(d.leafTemplate)}else{this.templateId(d.nullTemplate)}}};d.prototype.select=function(){if(this.model().branches){$(this.templateItems.content).toggle()}var e=this.model().payload();if(($(this.templateItems.content).filter(":visible").length||!this.model().branches||!this.model().branches.length)&&e){this.triggerRoutedEvent(d.renderPage,e)}};d.renderPage=new wo.routedEvent();return d});a.registerClass("Wipeout.Docs.ViewModels.Components.UsageCodeBlock","Wipeout.Docs.ViewModels.Components.CodeBlock",function(){var d=function(){this._super("Wipeout.Docs.ViewModels.Components.UsageCodeBlock");this.usage=ko.observable();this.showDefinitionCode=ko.observable(true)};d.prototype.onCodeChanged=function(e){this.usage(e.replace(/\&lt;/g,"<").replace(/\&amp;/g,"&").replace(/\&gt;/g,">"))};return d});a.registerClass("Wipeout.Docs.ViewModels.Pages.ClassItemTable","wo.itemsControl",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassItemTable","Wipeout.Docs.ViewModels.Pages.ClassItemRow");this.itemType="Function"}});a.registerClass("Wipeout.Docs.ViewModels.Pages.ClassPage","wo.view",function(){var d=function(){this._super("Wipeout.Docs.ViewModels.Pages.ClassPage");this.usagesTemplateId=ko.computed(function(){if(this.model()){var e=this.model().classFullName+d.classUsagesTemplateSuffix;if(document.getElementById(e)){return e}}return wo.contentControl.getBlankTemplateId()},this)};d.classUsagesTemplateSuffix="_ClassUsages";return d});a.registerClass("Wipeout.Docs.ViewModels.Pages.FunctionPage","wo.view",function(){var d=function(){this._super("Wipeout.Docs.ViewModels.Pages.FunctionPage");this.usagesTemplateId=ko.computed(function(){if(this.model()){var e=this.model().fullyQualifiedName()+d.classUsagesTemplateSuffix;if(document.getElementById(e)){return e}}return wo.contentControl.getBlankTemplateId()},this)};d.classUsagesTemplateSuffix="_FunctionUsages";return d});a.registerClass("Wipeout.Docs.ViewModels.Pages.LandingPage","wo.view",function(){return function(){this._super("Wipeout.Docs.ViewModels.Pages.LandingPage")}});a.registerClass("Wipeout.Docs.ViewModels.Pages.PropertyPage","wo.view",function(){function d(){this._super("Wipeout.Docs.ViewModels.Pages.PropertyPage");this.usagesTemplateId=ko.computed(function(){if(this.model()){var e=this.model().fullyQualifiedName()+d.classUsagesTemplateSuffix;if(document.getElementById(e)){return e}}return wo.contentControl.getBlankTemplateId()},this)}d.classUsagesTemplateSuffix="_PropertyUsages";return d});a.compile(window.Wipeout);delete a})();