(function(){var k={};var e=function(n,l,m){m=m||window;if(n==null){return}if(n instanceof Array||n instanceof HTMLCollection||n instanceof NodeList||n instanceof NamedNodeMap){for(var o=0,p=n.length;o<p;o++){l.call(m,n[o],o)}}else{for(var o in n){l.call(m,n[o],o)}}};var f=function(n,l,m){m=m||window;if(n==null){return}if(n instanceof Array||n instanceof HTMLCollection||n instanceof NodeList||n instanceof NamedNodeMap){for(var o=n.length-1;o>=0;o--){l.call(m,n[o],o)}}else{var p=[];for(var o in n){p.push(o)}for(var o=p.length-1;o>=0;o--){l.call(m,n[p[o]],p[o])}}};var b=function(n,m,l){var o=c("wipeout.bindings."+n,l);ko.bindingHandlers[n]={init:o.init,update:o.update};if(m){ko.virtualElements.allowedBindings[n]=true}};var c=function(m,l){m=m.split(".");var n=m.splice(0,m.length-1);var o={};o[m[m.length-1]]=l();g(n.join("."),o);return o[m[m.length-1]]};var g=function(n,m){n=n.split(".");if(n[0]!=="wipeout"){throw'Root must be "wipeout".'}n.splice(0,1);var l=k;e(n,function(o){l=l[o]||(l[o]={})});if(m&&m instanceof Function){m=m()}e(m,function(p,o){l[o]=p})};var a=/^\s+|\s+$/g;var i=function(l){return l?l.replace(a,""):l};var j=function(l){return l?i(l).toLowerCase():l};var h=function(l){if(l==null){return false}l=j(l);return l&&l!=="false"&&l!=="0"};c("wipeout.utils.obj",function(){var m=function(o,p){if(!p){p=window}var n=o.split(".");for(var q=0,r=n.length;q<r;q++){p=p[n[q]];if(!p){throw'Cannot create object "'+o+'"'}}if(p instanceof Function){return new p()}else{throw o+" is not a valid function."}};var l=function(p){var q=[];for(var n=0,o=p.length;n<o;n++){q.push(p[n])}return q};return{parseBool:h,trimToLower:j,trim:i,enumerate:e,enumerateDesc:f,createObject:m,copyArray:l}});c("wipeout.util.obj",function(){return k.utils.obj});c("wipeout.base.object",function(){var m=function(){};var l={parents:[],children:[]};m.clearVirtualCache=function(o){if(!o){l.parents.length=0;l.children.length=0;return}for(var p=0,q=l.children.length;p<q;p++){if(l.children[p]===o||l.parents[p]===o){l.children.splice(p,1);l.parents.splice(p,1)}}};m.useVirtualCache=true;m.prototype._super=function(){var o=null;if(m.useVirtualCache){var v=l.children.indexOf(arguments.callee.caller);if(v!==-1){o=l.parents[v]}}if(!o){var s=[];var p=this.constructor.prototype;while(p){s.push(p);p=Object.getPrototypeOf(p)}s.reverse();for(var q=0,r=s.length;q<r;q++){if(s[q]===arguments.callee.caller.prototype){o=s[q-1].constructor}else{for(var u in s[q]){if(s[q][u]===arguments.callee.caller){for(var t=q-1;t>=0;t--){if(s[t][u]!==arguments.callee.caller){o=s[t][u];break}}}if(o){break}}}if(o){if(m.useVirtualCache){l.children.push(arguments.callee.caller);l.parents.push(o)}break}}if(!o){throw"Could not find method in parent class"}}return o.apply(this,arguments)};var n=/^[a-zA-Z_][a-zA-Z_0-9]*$/;m.extend=function(o,q){for(var r in this){if(this.hasOwnProperty(r)&&this[r]&&this[r].constructor===Function){o[r]=this[r]}}if(q){if(!n.test(q)){throw"Invalid class name. The class name is for debug purposes and can contain alphanumeric characters only"}new Function("childClass","parentClass","            function "+q+"() { this.constructor = childClass; }            "+q+".prototype = parentClass.prototype;            childClass.prototype = new "+q+"();")(o,this)}else{function s(){this.constructor=o}s.prototype=this.prototype;o.prototype=new s()}return o};return m});c("wipeout.base.visual",function(){var l=k.base.object.extend(function(m){this._super();this.woInvisible=this.constructor.woInvisibleDefault;this.templateItems={};this.templateId=ko.observable(m||l.getDefaultTemplateId());this.__woBag={disposables:{},createdByWipeout:false,rootHtmlElement:null,routedEventSubscriptions:[],renderedChildren:[]}},"visual");l.woInvisibleDefault=false;l.prototype.disposeOf=function(m){if(this.__woBag.disposables[m]){this.__woBag.disposables[m]();delete this.__woBag.disposables[m]}};l.prototype.disposeOfAll=function(){for(var m in this.__woBag.disposables){this.disposeOf(m)}};l.prototype.registerDisposable=(function(){var m=0;return function(n){if(!n||n.constructor!==Function){throw"The dispose function must be a Function"}var o=(++m).toString();this.__woBag.disposables[o]=n;return o}})();l.prototype.unTemplate=function(){e(this.__woBag.renderedChildren.splice(0,this.__woBag.renderedChildren.length),function(m){if(m instanceof l){if(m.__woBag.createdByWipeout){m.dispose()}else{m.unRender()}}});e(this.templateItems,function(n,m){delete this.templateItems[m]},this);if(this.__woBag.rootHtmlElement){if(document.contains(this.__woBag.rootHtmlElement)){ko.virtualElements.emptyNode(this.__woBag.rootHtmlElement)}else{console.warn("Warning, could not dispose of html element correctly. This element has been manually moved from the DOM (not by knockout)")}}};l.prototype.unRender=function(){this.onUnrender();this.unTemplate();if(this.__woBag.rootHtmlElement){ko.utils.domData.set(this.__woBag.rootHtmlElement,k.bindings.wipeout.utils.wipeoutKey,undefined);delete this.__woBag.rootHtmlElement}};l.prototype.dispose=function(){this.unRender();for(var m in this){if(ko.isObservable(this[m])&&this[m].dispose instanceof Function){this[m].dispose()}}e(this.__woBag.routedEventSubscriptions.splice(0,this.__woBag.routedEventSubscriptions.length),function(n){n.dispose()})};l.getParentElement=function(o){var n=0;var m=o.previousSibling;while(m){if(k.utils.ko.virtualElements.isVirtualClosing(m)){n--}if(k.utils.ko.virtualElements.isVirtual(m)){if(n===0){return m}n++}m=m.previousSibling}return o.parentElement};l.prototype.getParents=function(){var m=this;var n=[];while(m){n.push(m);m=m.getParent()}return n};l.prototype.getParent=function(){var n;var m=l.getParentElement(this.__woBag.rootHtmlElement);while(m){if(n=ko.utils.domData.get(m,k.bindings.wipeout.utils.wipeoutKey)){return n}m=l.getParentElement(m)}};l.prototype.unRegisterRoutedEvent=function(q,m,n){for(var o=0,p=this.__woBag.routedEventSubscriptions.length;o<p;o++){if(this.__woBag.routedEventSubscriptions[o].routedEvent===q){this.__woBag.routedEventSubscriptions[o].event.unRegister(m,context);return}}};l.prototype.registerRoutedEvent=function(r,m,n){var q;for(var o=0,p=this.__woBag.routedEventSubscriptions.length;o<p;o++){if(this.__woBag.routedEventSubscriptions[o].routedEvent===r){q=this.__woBag.routedEventSubscriptions[o];break}}if(!q){q=new k.base.routedEventRegistration(r);this.__woBag.routedEventSubscriptions.push(q)}q.event.register(m,n)};l.prototype.triggerRoutedEvent=function(q,m){if(!(m instanceof k.base.routedEventArgs)){m=new k.base.routedEventArgs(m,this)}for(var n=0,o=this.__woBag.routedEventSubscriptions.length;n<o;n++){if(m.handled){return}if(this.__woBag.routedEventSubscriptions[n].routedEvent===q){this.__woBag.routedEventSubscriptions[n].event.trigger(m)}}if(!m.handled){var p=this.getParent();if(p){p.triggerRoutedEvent(q,m)}}};l.prototype.onRendered=function(n,m){};l.prototype.onUnrender=function(){};l.prototype.onApplicationInitialized=function(){};l.getDefaultTemplateId=(function(){var m=null;return function(){if(!m){m=k.base.contentControl.createAnonymousTemplate("<span>No template has been specified</span>")}return m}})();l.getBlankTemplateId=(function(){var m=null;return function(){if(!m){m=k.base.contentControl.createAnonymousTemplate("")}return m}})();l.visualGraph=function(o,m){if(!o){return[]}m=m||function(){return typeof arguments[0]};var n=[];k.utils.obj.enumerate(k.utils.html.getAllChildren(o),function(q){k.utils.obj.enumerate(l.visualGraph(q),n.push,n)});var p=ko.utils.domData.get(o,k.bindings.wipeout.utils.wipeoutKey);if(p){return[{viewModel:p,display:m(p),children:n}]}return n};l.reservedTags=["a","abbr","acronym","address","applet","area","article","aside","audio","b","base","basefont","bdi","bdo","big","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","command","datalist","dd","del","details","dfn","dialog","dir","div","dl","dt","em","embed","fieldset","figcaption","figure","font","footer","form","frame","frameset","head","header","h1","h2","h3","h4","h5","h6","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","map","mark","menu","meta","meter","nav","noframes","noscript","object","ol","optgroup","option","output","p","param","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strike","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var","video","wbr"];return l});c("wipeout.base.view",function(){var l="wo.view.modelRoutedEvents";var n=k.base.visual.extend(function(q,p){this._super(q);this.model=ko.observable(p||null);var p=null;this.registerDisposable(this.model.subscribe(function(r){try{this.onModelChanged(p,r)}finally{p=r}},this).dispose);var o=this;this.__woBag.bindings={}},"view");var m=function(o,p,q){if(ko.isObservable(o[p])){o[p](ko.utils.unwrapObservable(q))}else{o[p]=ko.utils.unwrapObservable(q)}};n.prototype.disposeOfBinding=function(o){if(this.__woBag.bindings[o]){this.__woBag.bindings[o].dispose();delete this.__woBag.bindings[o]}};n.prototype.dispose=function(){this._super();if(this.__woBag[l]){this.__woBag[l].dispose();delete this.__woBag[l]}for(var o in this.__woBag.bindings){this.disposeOfBinding(o)}};n.prototype.onInitialized=function(){};n.prototype.bind=function(o,t,s){if(s&&(!ko.isObservable(this[o])||!ko.isObservable(t()))){throw"Two way bindings must be between 2 observables"}this.disposeOfBinding(o);var r=ko.dependentObservable({read:function(){return ko.utils.unwrapObservable(t())},write:s?function(){var u=t();if(u){u(arguments[0])}}:undefined});m(this,o,r.peek());var p=r.subscribe(function(u){m(this,o,u)},this);var q=s?this[o].subscribe(function(u){m({x:r},"x",u)},this):null;this.__woBag.bindings[o]={dispose:function(){if(p){p.dispose();p=null}if(q){q.dispose();q=null}if(r){r.dispose();r=null}}}};n.elementHasModelBinding=function(o){for(var p=0,q=o.attributes.length;p<q;p++){if(o.attributes[p].nodeName==="model"||o.attributes[p].nodeName==="model-tw"){return true}}for(var p=0,q=o.childNodes.length;p<q;p++){if(o.childNodes[p].nodeType===1&&o.childNodes[p].nodeName==="model"){return true}}return false};n.reservedPropertyNames=["constructor","constructor-tw","id","id-tw"];n.prototype.initialize=function(r,p){if(this._initialized){throw"Cannot call initialize item twice"}this._initialized=true;if(!r){return}var q=r.getAttribute("woInvisible");if(q){this.woInvisible=h(q)}if(!n.elementHasModelBinding(r)&&k.utils.ko.peek(this.model)==null){this.bind("model",p.$data.model)}var o=this.woInvisible?p:p.createChildContext(this);e(r.attributes,function(s){if(n.reservedPropertyNames.indexOf(s.nodeName)!==-1){return}var t=s.nodeName,u="";if(t.indexOf("-tw")===s.nodeName.length-3){t=t.substr(0,t.length-3);u=",\n\t\t\tfunction(val) {\n\t\t\t\tif(!ko.isObservable("+s.value+"))\n\t\t\t\t\tthrow 'Two way bindings must be between 2 observables';\n\t\t\t\t"+s.value+"(val);\n\t\t\t}"}try{o.__$woCurrent=this;k.template.engine.createJavaScriptEvaluatorFunction("(function() {\n\t\t\t__$woCurrent.bind('"+t+"', function() {\n\t\t\t\treturn "+s.value+";\n\t\t\t}"+u+");\n\n\t\t\treturn '';\n\t\t})()")(o)}finally{delete o.__$woCurrent}},this);e(r.childNodes,function(s,t){if(s.nodeType!==1||n.reservedPropertyNames.indexOf(s.nodeName)!==-1){return}var y="string";for(var v=0,w=s.attributes.length;v<w;v++){if(s.attributes[v].nodeName==="constructor"&&s.attributes[v].nodeValue){y=s.attributes[v].nodeValue;break}}if(n.objectParser[j(y)]){var u=[];var x=x||new XMLSerializer();for(var v=0,w=s.childNodes.length;v<w;v++){u.push(x.serializeToString(s.childNodes[v]))}var z=n.objectParser[j(y)](u.join(""));if(ko.isObservable(this[s.nodeName])){this[s.nodeName](z)}else{this[s.nodeName]=z}}else{var z=k.utils.obj.createObject(y);if(z instanceof k.base.view){z.__woBag.createdByWipeout=true;z.initialize(s,o)}if(ko.isObservable(this[s.nodeName])){this[s.nodeName](z)}else{this[s.nodeName]=z}}},this)};n.objectParser={json:function(o){return JSON.parse(o)},string:function(o){return o},bool:function(p){var o=j(p);return o?o!=="false"&&o!=="0":false},"int":function(o){return parseInt(i(o))},"float":function(o){return parseFloat(i(o))},regexp:function(o){return new RegExp(i(o))},date:function(o){return new Date(i(o))}};n.prototype.onModelChanged=function(p,o){this.disposeOf(this.__woBag[l]);if(o instanceof k.base.routedEventModel){this.__woBag[l]=this.registerDisposable(o.__triggerRoutedEventOnVM.register(this.onModelRoutedEvent,this).dispose)}};n.prototype.onModelRoutedEvent=function(o){if(!(o.routedEvent instanceof k.base.routedEvent)){throw"Invaid routed event"}this.triggerRoutedEvent(o.routedEvent,o.eventArgs)};return n});c("wipeout.base.contentControl",function(){var l=k.base.view.extend(function(o){this._super(o||k.base.visual.getBlankTemplateId());this.template=l.createTemplatePropertyFor(this.templateId,this)},"contentControl");l.createTemplatePropertyFor=function(q,p){var o=ko.dependentObservable({read:function(){var r=document.getElementById(q());return r?r.textContent:""},write:function(r){q(k.base.contentControl.createAnonymousTemplate(r))},owner:p});if(p instanceof k.base.visual){p.registerDisposable(o.dispose)}return o};var m="data-templatehash";var n=(function(){var q=null;var o=Math.floor(Math.random()*1000000000);var p=function(){if(!q){q=k.utils.html.createElement("<div style='display: none'></div>");document.body.appendChild(q)}};return{create:function(w,r){p();w=i(w);var s=l.hashCode(w).toString();if(!r){for(var u=0,v=q.childNodes.length;u<v;u++){if(q.childNodes[u].nodeType===1&&q.childNodes[u].nodeName==="SCRIPT"&&q.childNodes[u].id&&q.childNodes[u].attributes[m]&&q.childNodes[u].attributes[m].nodeValue===s&&q.childNodes[u].innerHTML===w){return q.childNodes[u].id}}}var t="AnonymousTemplate"+(++o);q.innerHTML+='<script type="text/xml" id="'+t+'" '+m+'="'+s+'">'+w+"</script>";return t},del:function(s){p();for(var r=0;r<q.childNodes.length;r++){if(q.childNodes[r].nodeType===1&&q.childNodes[r].nodeName==="SCRIPT"&&q.childNodes[r].id===s){q.removeChild(q.childNodes[r]);r--}}}}})();l.createAnonymousTemplate=n.create;l.deleteAnonymousTemplate=n.del;l.hashCode=function(s){var p=0;for(var q=0,r=s.length;q<r;q++){var o=s.charCodeAt(q);p=((p<<5)-p)+o;p=p&p}return p};return l});var k=k||{};k.base=k.base||{};c("wipeout.base.event",function(){var l=function(){this._registrations=[]};l.prototype.trigger=function(m){for(var n=0,o=this._registrations.length;n<o;n++){if(m instanceof k.base.routedEventArgs&&m.handled){return}this._registrations[n].callback.call(this._registrations[n].context,m)}};l.prototype.unRegister=function(m,n){n=n==null?window:n;for(var o=0,p=this._registrations.length;o<p;o++){if(this._registrations[o].callback===m&&this._registrations[o].context===n){this._registrations.splice(o,1);o--}}};l.prototype.dispose=function(){this._registrations.length=0};l.prototype.register=function(m,n){if(!(m instanceof Function)){throw"Invalid event callback"}var p=this._registrations;var o={callback:m,context:n==null?window:n,dispose:function(){var q=p.indexOf(o);if(q>=0){p.splice(q,1)}}};this._registrations.push(o);return{callback:o.callback,context:o.context,dispose:o.dispose}};return l});c("wipeout.base.if",function(){var m=true;var n=function(){if(!m){return}m=false;l.blankTemplateId=k.base.contentControl.createAnonymousTemplate("",true)};var l=k.base.contentControl.extend(function(){n();this._super.apply(this,arguments);this.condition=ko.observable();this.elseTemplateId=ko.observable(l.blankTemplateId);this.registerDisposable(this.elseTemplateId.subscribe(this.elseTemplateChanged,this).dispose);this.elseTemplate=k.base.contentControl.createTemplatePropertyFor(this.elseTemplateId,this);this.__cachedTemplateId=this.templateId();this.registerDisposable(this.condition.subscribe(this.onConditionChanged,this).dispose);this.registerDisposable(this.templateId.subscribe(this.copyTemplateId,this).dispose);this.copyTemplateId(this.templateId())},"_if");l.woInvisibleDefault=true;l.prototype.elseTemplateChanged=function(o){if(!this.condition()){this.templateId(o)}};l.prototype.onConditionChanged=function(o){if(this.__oldConditionVal&&!o){this.templateId(this.elseTemplateId())}else{if(!this.__oldConditionVal&&o){this.templateId(this.__cachedTemplateId)}}this.__oldConditionVal=!!o};l.prototype.copyTemplateId=function(o){if(o!==this.elseTemplateId()){this.__cachedTemplateId=o}if(!this.condition()&&o!==this.elseTemplateId()){this.templateId(this.elseTemplateId())}};return l});c("wipeout.base.itemsControl",function(){var l;var n=function(){if(l){return}l=k.base.contentControl.createAnonymousTemplate("<div data-bind='itemsControl: null'></div>")};var m=k.base.contentControl.extend(function(p,o){n();this._super(p||l);this.itemTemplateId=ko.observable(o);this.itemTemplate=k.base.contentControl.createTemplatePropertyFor(this.itemTemplateId,this);this.itemSource=ko.observableArray([]);this.items=ko.observableArray([]);if(k.utils.ko.version()[0]<3){m.subscribeV2.call(this)}else{m.subscribeV3.call(this)}this.registerDisposable(this.items.subscribe(this.syncModelsAndViewModels,this).dispose);var o=this.itemTemplateId.peek();this.registerDisposable(this.itemTemplateId.subscribe(function(q){if(o!==q){try{this.reDrawItems()}finally{o=q}}},this).dispose)},"itemsControl");m.subscribeV2=function(){var p=this.itemSource.peek();this.registerDisposable(this.itemSource.subscribe(function(){try{if(this.modelsAndViewModelsAreSynched()){return}this._itemSourceChanged(ko.utils.compareArrays(p,arguments[0]||[]))}finally{p=k.utils.obj.copyArray(arguments[0]||[])}},this).dispose);var o=this.items.peek();this.registerDisposable(this.items.subscribe(function(){try{this._itemsChanged(ko.utils.compareArrays(o,arguments[0]||[]))}finally{o=k.utils.obj.copyArray(arguments[0]||[])}},this).dispose)};m.subscribeV3=function(){this.registerDisposable(this.itemSource.subscribe(this._itemSourceChanged,this,"arrayChange").dispose);this.registerDisposable(this.items.subscribe(this._itemsChanged,this,"arrayChange").dispose)};m.prototype.syncModelsAndViewModels=function(){var o=false,r=false;var s=this.itemSource();if(s==null){r=true;s=[]}var t=this.items();if(s.length!==t.length){o=true;s.length=t.length}for(var p=0,q=t.length;p<q;p++){if(t[p].model()!==s[p]){s[p]=t[p].model();o=true}}if(o){if(r){this.itemSource(s)}else{this.itemSource.valueHasMutated()}}};m.prototype.modelsAndViewModelsAreSynched=function(){var q=this.itemSource()||[];var r=this.items()||[];if(q.length!==r.length){return false}for(var o=0,p=q.length;o<p;o++){if(q[o]!==r[o].model()){return false}}return true};m.prototype._itemsChanged=function(o){e(o,function(p){if(p.status===k.utils.ko.array.diff.deleted&&p.moved==null){this.onItemDeleted(p.value)}else{if(p.status===k.utils.ko.array.diff.added&&p.moved==null){this.onItemRendered(p.value)}}},this)};m.prototype._itemSourceChanged=function(p){var u=this.items();var q=[],o=[],v={},r=0;for(var s=0,t=p.length;s<t;s++){if(p[s].status===k.utils.ko.array.diff.retained){continue}else{if(p[s].status===k.utils.ko.array.diff.deleted){q.push((function(w){return function(){var x=u.splice(w.index+r,1)[0];if(w.moved!=null){v[w.moved+"."+w.index]=x}r--}})(p[s]))}else{if(p[s].status===k.utils.ko.array.diff.added){o.push((function(w){return function(){var x=w.moved!=null?v[w.index+"."+w.moved]:this._createItem(w.value);u.splice(w.index,0,x)}})(p[s]))}else{throw"Unsupported status"}}}}for(s=0,t=q.length;s<t;s++){q[s].call(this)}for(s=0,t=o.length;s<t;s++){o[s].call(this)}this.items.valueHasMutated()};m.prototype.onItemRendered=function(o){};m.prototype.onItemDeleted=function(o){var p=this.__woBag.renderedChildren.indexOf(o);if(p!==-1){this.__woBag.renderedChildren.splice(p,1)}o.dispose()};m.prototype._createItem=function(p){var o=this.createItem(p);o.__woBag.createdByWipeout=true;return o};m.prototype.createItem=function(o){return new k.base.view(this.itemTemplateId(),o)};m.prototype.reDrawItems=function(){var q=this.itemSource()||[];var r=this.items();r.length=q.length;for(var o=0,p=q.length;o<p;o++){r[o]=this._createItem(q[o])}this.items.valueHasMutated()};return m});c("wipeout.base.routedEvent",function(){var l=function(){};l.prototype.trigger=function(n,m){n.triggerRoutedEvent(this,new k.base.routedEventArgs(m,n))};l.prototype.unRegister=function(m,o,n){o.unRegisterRoutedEvent(this,m,n)};l.prototype.register=function(m,o,n){o.registerRoutedEvent(this,m,n)};return l});c("wipeout.base.routedEventArgs",function(){var l=function(m,n){this.handled=false;this.data=m;this.originator=n};return l});c("wipeout.base.routedEventRegistration",function(){var l=function(m){this.routedEvent=m;this.event=new k.base.event()};l.prototype.dispose=function(){this.event.dispose()};return l});c("wipeout.base.routedEventModel",function(){var l=k.base.object.extend(function(){this.__triggerRoutedEventOnVM=new wo.event()});l.prototype.triggerRoutedEvent=function(n,m){this.__triggerRoutedEventOnVM.trigger({routedEvent:n,eventArgs:m})};return l});b("itemsControl",true,function(){var m="";var n=null;var o=function(){if(n){return}var r="<!-- ko ic-render: $data";if(d){r+=", wipeout-type: 'items[' + wipeout.util.ko.peek($index) + ']'"}r+=" --><!-- /ko -->";n=k.base.contentControl.createAnonymousTemplate(r)};var l=function(t,v,r,w,s){var u=k.utils.ko.peek(w);if(u&&!(u instanceof k.base.itemsControl)){throw"This binding can only be used on an itemsControl"}o();return ko.bindingHandlers.template.init.call(this,t,q.createAccessor(w),r,w,s)};var p=function(t,v,r,w,s){var u=k.utils.ko.peek(w);if(u&&!(u instanceof k.base.itemsControl)){throw"This binding can only be used on an itemsControl"}return ko.bindingHandlers.template.update.call(this,t,q.createAccessor(w),r,w,s)};var q={createAccessor:function(r){r=k.utils.ko.peek(r);return function(){return{name:n,foreach:r.items,templateEngine:k.template.engine.instance}}}};return{init:l,update:p,utils:q}});b("ic-render",true,function(){var l=function(p,q,n,r,o){return k.bindings.render.init.call(this,p,q,n,o.$parent,o.$parentContext)};var m=function(p,q,n,r,o){return k.bindings.render.update.call(this,p,q,n,o.$parent,o.$parentContext)};return{init:l,update:m}});b("render",true,function(){var m=function(q,r,o,s,p){return ko.bindingHandlers.template.init.call(this,q,k.bindings.render.utils.createValueAccessor(r),o,s,p)};var n=function(s,v,p,w,q){var r=k.utils.ko.peek(k.utils.ko.peek(v()));if((w&&!(w instanceof k.base.visual))||(r&&!(r instanceof k.base.visual))){throw"This binding can only be used to render a wo.visual within the context of a wo.visual"}if(r&&w&&r===w){throw"A wo.visual cannot be a child of itself."}if(r&&r.__woBag.rootHtmlElement){throw"This visual has already been rendered. Call its unRender() function before rendering again."}var o=this;var u=function(){if(r){r.unTemplate()}ko.bindingHandlers.template.update.call(o,s,k.bindings.render.utils.createValueAccessor(v),p,r,q);var x=p();if(x["wipeout-type"]){k.bindings["wipeout-type"].utils.comment(s,x["wipeout-type"])}};var t=ko.utils.domData.get(s,k.bindings.wipeout.utils.wipeoutKey);if(t instanceof k.base.visual){if(t.__woBag.createdByWipeout){t.dispose()}else{t.unRender()}}if(r){ko.utils.domData.set(s,k.bindings.wipeout.utils.wipeoutKey,r);r.__woBag.rootHtmlElement=s;if(w){w.__woBag.renderedChildren.push(r)}r.templateId.subscribe(u)}u()};var l=function(o){return function(){var q=o();var p=ko.utils.unwrapObservable(q);var r={templateEngine:k.template.engine.instance,name:p?p.templateId.peek():"",afterRender:p?function(t,s){var u=p.nodes||[];p.nodes=t;p.onRendered(u,t)}:undefined};if(q&&!q.woInvisible){r.data=q||{}}return r}};return{init:m,update:n,utils:{createValueAccessor:l}}});b("wipeout-type",true,function(){var l="wipeout-type";return{init:function(){},utils:{comment:function(m,o){o=k.utils.ko.peek(o);if(m.nodeType===1){if(m.childNodes.length){m.insertBefore(document.createComment(o),m.childNodes[0])}else{m.appendChild(document.createComment(o))}}else{if(m.nodeType===8){var n;if(!(n=ko.utils.domData.get(m,l))){ko.utils.domData.set(m,l,n=m.textContent)}m.textContent=n+" wipeout-type: "+o}}}}}});b("wipeout",true,function(){var m=function(p,s,n,u,o){if(ko.utils.domData.get(p,k.bindings.wipeout.utils.wipeoutKey)){throw"This element is already bound to another model"}var r=s();if(!r){throw"Invalid view type"}var t=new r();if(!(t instanceof k.base.view)){throw"Invalid view type"}t.model(u);var q=ko.bindingHandlers.render.init.call(this,p,l(t),n,null,o);ko.bindingHandlers.render.update.call(this,p,l(t),n,null,o);t.onApplicationInitialized();return q};var l=function(n){return function(){return n}};return{init:m,utils:{createValueAccessor:l,wipeoutKey:"__wipeout"}}});b("wo",true,function(){var l=function(p,s,m,t,n){var r=k.template.engine.scriptCache[s()](n);if(r.id){var o=n;while(o.$data.woInvisible){o=o.$parentContext}o.$data.templateItems[r.id]=r.vm}var q=k.bindings.render.init.call(this,p,function(){return r.vm},m,t,n);k.bindings.render.update.call(this,p,function(){return r.vm},m,t,n);return q};return{init:l}});c("wipeout.template.engine",function(){var l=function(){};l.prototype=new ko.templateEngine();l.createJavaScriptEvaluatorFunction=function(n){return new Function("bindingContext","with(bindingContext) {\n\twith($data) {\n\t\treturn "+n+";\n\t}\n}")};l.createJavaScriptEvaluatorBlock=function(n){var o=l.newScriptId();if(n instanceof Function){l.scriptCache[o]=n}else{l.scriptCache[o]=l.createJavaScriptEvaluatorFunction(n)}return l.openCodeTag+o+l.closeCodeTag};l.prototype.createJavaScriptEvaluatorBlock=function(n){return l.createJavaScriptEvaluatorBlock(n)};l.prototype.rewriteTemplate=function(p,n,q){var o=document.getElementById(p);if(o instanceof HTMLElement){if(!l.scriptHasBeenReWritten.test(o.textContent)){ko.templateEngine.prototype.rewriteTemplate.call(this,p,n,q)}else{this.makeTemplateSource(p,q).data("isRewritten",true)}this.wipeoutRewrite(o,n)}else{ko.templateEngine.prototype.rewriteTemplate.call(this,p,n,q)}};l.wipeoutRewrite=function(t,r){if(k.base.visual.reservedTags.indexOf(t.nodeName)!==-1){for(var n=0;n<t.childNodes.length;n++){if(t.childNodes[n].nodeType===1){l.wipeoutRewrite(t.childNodes[n],r)}}}else{var o=l.newScriptId();l.scriptCache[o]=function(u){var v=k.utils.obj.createObject(t.nodeName);if(!(v instanceof k.base.view)){throw"Only wo.view elements can be created in this way"}v.__woBag.createdByWipeout=true;v.initialize(t,u);return{vm:v,id:l.getId(t)}};var s="<!-- ko";if(d){s+=" wipeout-type: '"+t.nodeName+"',"}s+=" wo: "+o+" --><!-- /ko -->";var q=new DOMParser().parseFromString("<root>"+r(s)+"</root>","application/xml").documentElement;while(q.childNodes.length){var p=q.childNodes[0];p.parentElement.removeChild(p);t.parentElement.insertBefore(p,t)}t.parentElement.removeChild(t)}};l.getId=function(p){for(var n=0,o=p.attributes.length;n<o;n++){if(p.attributes[n].nodeName==="id"){return p.attributes[n].value}}return null};l.prototype.wipeoutRewrite=function(p,o){var r=new XMLSerializer();xmlTemplate=new DOMParser().parseFromString("<root>"+p.textContent+"</root>","application/xml").documentElement;if(xmlTemplate.firstChild&&xmlTemplate.firstChild.nodeName==="parsererror"){throw"Invalid xml template:\n"+r.serializeToString(xmlTemplate.firstChild)}var q=[];for(var n=0;n<xmlTemplate.childNodes.length;n++){if(xmlTemplate.childNodes[n].nodeType===1){l.wipeoutRewrite(xmlTemplate.childNodes[n],o)}q.push(r.serializeToString(xmlTemplate.childNodes[n]))}p.textContent=q.join("")};l.prototype.renderTemplateSource=function(r,n,p){if(!(n.$data instanceof k.base.view)){return[]}var o=r.data("precompiled");if(!o){o=new k.template.htmlBuilder(r.text());r.data("precompiled",o)}var q;ko.dependentObservable(function(){q=o.render(n)},this).dispose();return q};if(d){var m=function(n){l.prototype[n]=function(){ko.templateEngine.prototype[n].apply(this,arguments)}};m("isTemplateRewritten");m("makeTemplateSource");m("renderTemplate")}l.newScriptId=(function(){var n=Math.floor(Math.random()*10000);return function(){return(++n).toString()}})();l.scriptCache={};l.openCodeTag="<!-- wipeout_code: {";l.closeCodeTag="} -->";l.scriptHasBeenReWritten=RegExp(l.openCodeTag.replace("{","{")+"[0-9]+"+l.closeCodeTag.replace("}","}"));l.instance=new l();return l});c("wipeout.template.htmlBuilder",function(){var l=function(m){this.preRendered=[];this.generatePreRender(m)};l.prototype.render=function(m){var n=[];var s=[];for(var p=0,q=this.preRendered.length;p<q;p++){if(this.preRendered[p] instanceof Function){var r=this.preRendered[p](m);s.push(r)}else{s.push(this.preRendered[p])}}var o=k.utils.html.createElements(s.join(""));e(l.getTemplateIds({childNodes:o}),function(u,t){m.$data.templateItems[t]=u});if(m.$data instanceof k.base.view){m.$data.onInitialized()}return o};l.prototype.generatePreRender=function(s){var t=new DOMParser().parseFromString("<root>"+s+"</root>","application/xml").documentElement;if(t.firstChild&&t.firstChild.nodeName==="parsererror"){var p=new XMLSerializer();throw"Invalid xml template:\n"+p.serializeToString(t.firstChild)}var o=k.template.engine.openCodeTag;var m=k.template.engine.closeCodeTag;var r=k.template.htmlBuilder.generateTemplate(t);this.preRendered.length=0;var q,n;while((q=r.indexOf(o))!==-1){this.preRendered.push(r.substr(0,q));r=r.substr(q);n=r.indexOf(m);if(n===-1){throw"Invalid wipeout_code tag."}this.preRendered.push((function(u){return function(v){return k.template.engine.scriptCache[u](v)}})(r.substr(o.length,n-o.length)));r=r.substr(n+m.length)}this.preRendered.push(r)};l.getTemplateIds=function(m){var n={};e(m.childNodes,function(q){if(q.nodeType===1){for(var o=0,p=q.attributes.length;o<p;o++){if(q.attributes[o].nodeName==="id"){n[q.attributes[o].nodeValue]=q;break}}e(l.getTemplateIds(q),function(r,s){n[s]=r})}});return n};l.generateTemplate=function(o){var m=[];var n=new XMLSerializer();e(o.childNodes,function(q){if(q.nodeType==1){var p=new DOMParser().parseFromString(n.serializeToString(q),"application/xml").documentElement;while(p.childNodes.length){p.removeChild(p.childNodes[0])}var r=k.utils.html.createElement(n.serializeToString(p));r.innerHTML=k.template.htmlBuilder.generateTemplate(q);m.push(k.utils.html.outerHTML(r))}else{if(q.nodeType===3){m.push(q.data)}else{m.push(n.serializeToString(q))}}});return m.join("")};return l});c("wipeout.utils.html",function(){var r=function(w){if(!w){return null}if(w.constructor===HTMLHtmlElement){throw"Cannot serialize a Html element using outerHTML"}var x=w.nodeType===1?(s[w.tagName.toLowerCase()]||"div"):"div";var v=document.createElement(x);v.innerHTML=w.outerHTML;return v.innerHTML};var u=/[a-zA-Z0-9]/;var p=function(x){x=x.replace(/^\s+|\s+$/g,"");if(!x||x[0]!=="<"){throw"Invalid html tag"}x=x.substring(1).replace(/^\s+|\s+$/g,"");for(var v=0,w=x.length;v<w;v++){if(!u.test(x[v])){break}}return x.substring(0,v)};var t=/<\!--[^>]*-->/g;var o=function(v){v=v.replace(t,"").replace(/^\s+|\s+$/g,"");var w=0;if((w=v.indexOf("<"))===-1){return null}return p(v.substring(w))};var s={area:"map",base:"head",basefont:"head",body:"html",caption:"table",col:"colgroup",colgroup:"table",command:"menu",frame:"frameset",frameset:"html",head:"html",li:"ul",tbody:"table",td:"tr",tfoot:"table",th:"tr",thead:"table",tr:"tbody"};var l=function(w){if(!w){return null}var x=document.createElement(s[p(w)]||"div");x.innerHTML=w;var v=x.firstChild;x.removeChild(v);return v};var m=function(w){if(w==null){return[]}var z=o(w)||"div";var y=s[p("<"+z+"/>")]||"div";w="<"+z+"></"+z+">"+w+"<"+z+"></"+z+">";var v=document.createElement(y);v.innerHTML=w;var x=[];while(v.firstChild){x.push(v.firstChild);v.removeChild(v.firstChild)}x.splice(0,1);x.splice(x.length-1,1);return x};var n=function(x){var v=[];if(k.utils.ko.virtualElements.isVirtual(x)){var B=k.utils.ko.virtualElements.parentElement(x);for(var y=0,z=B.childNodes.length;y<z;y++){if(B.childNodes[y]===x){break}}y++;for(var z=B.childNodes.length;y<z;y++){v.push(B.childNodes[y])}}else{v=x.childNodes}var A=[];var w=0;for(var y=0,z=v.length;y<z;y++){if(k.utils.ko.virtualElements.isVirtualClosing(v[y])){w--;if(w<0){return A}continue}if(w>0){continue}A.push(v[y]);if(k.utils.ko.virtualElements.isVirtual(v[y])){w++}}return A};var q=function(v){return ko.utils.domData.get(v,k.bindings.wipeout.utils.wipeoutKey)};return{specialTags:s,getFirstTagName:o,getTagName:p,getAllChildren:n,outerHTML:r,createElement:l,createElements:m,getViewModel:q}});c("wipeout.util.html",function(){return k.utils.html});c("wipeout.utils.ko",function(){var l={};l.version=function(){if(!ko||!ko.version){return null}var o=ko.version.split(".");for(var m=0,n=o.length;m<n;m++){o[m]=parseInt(o[m])}return o};l.peek=function(m){if(ko.isObservable(m)){return m.peek()}else{return m}};l.array={diff:{added:"added",deleted:"deleted",retained:"retained"}};l.isObservableArray=function(m){return ko.isObservable(m)&&m.push&&m.push.constructor===Function};l.virtualElements={parentElement:function(n){var m=n.previousSibling;while(m){if(l.virtualElements.isVirtual(m)){return m}m=m.previousSibling}return n.parentNode},isVirtual:function(m){return m.nodeType===8&&m.nodeValue.replace(/^\s+/,"").indexOf("ko")===0},isVirtualClosing:function(m){return m.nodeType===8&&i(m.nodeValue)==="/ko"}};return l});c("wipeout.util.ko",function(){return k.utils.ko});window.wo={};e(k.base,function(m,l){window.wo[l]=m});e(k.utils,function(m,l){window.wo[l]=m});var d=wo.DEBUG=false})();