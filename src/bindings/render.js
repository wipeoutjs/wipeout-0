Binding("render", true, function () {
    
    var render = wipeout.bindings.bindingBase.extend(function(element, value, allBindingsAccessor, bindingContext) { 
        ///<summary>A knockout binding to render a wo.view</summary>
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="value" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>
        
        this._super(element);

        ///<Summary type="Object">metadata for the binding</Summary>
        this.bindingMeta = ko.bindingHandlers.template.init(this.element, wipeout.bindings.render.createValueAccessor(value), allBindingsAccessor, null, bindingContext);
        
        ///<Summary type="Function">Other bindings on the element</Summary>
        this.allBindingsAccessor = allBindingsAccessor;
        
        ///<Summary type="ko.bindingContext">The binding context</Summary>
        this.bindingContext = bindingContext;

        if(ko.isObservable(value)) {
            var val = value.peek();
            this.subscribed = value.subscribe(function(newVal) {
                if(newVal === val)
                    return;

                try {
                    this.reRender(newVal);
                } finally {
                    val = newVal;
                }
            }, this);
        }
    }, "render");
    
    render.prototype.moved = function(oldParentElement, newParentElement) {
        ///<summary>Perform actions after the element that this binding is on has moved</summary>
        ///<param name="oldParentElement" type="HTMLElement" optional="false">The old parent element</param>
        ///<param name="newParentElement" type="HTMLElement" optional="false">The new parent element</param>
        
        this._super(oldParentElement, newParentElement);
        if(DEBUG && !wipeout.settings.suppressWarnings && this.value) {
            for(var i = 0, ii = this.value.__woBag.nodes.length; i < ii; i++) {
                if(wipeout.utils.ko.parentElement(this.value.__woBag.nodes[i]) !== this.value.__woBag.rootHtmlElement) {
                    console.warn("Only part of this view model was moved. Un moved nodes will be deleted or orphaned with their bindings cleared when this view model is re-rendered or disposed.");
                    break;
                }
            };
        }
    };
    
    render.prototype.dispose = function() {
        ///<summary>Dispose of this binding</summary>

        this.unRender();

        this._super();     

        if(this.subscribed) {
            this.subscribed.dispose();
            delete this.subscribed;
        }            
    };
    
    render.prototype.reRender = function(value) {
        ///<summary>Re render the value</summary>
        ///<param name="value" type="wo.view" optional="false">The value to render</param>
        
        this.unRender();
        this.render(value);
    };
    
    render.prototype.unTemplate = function() {
        ///<summary>Removes and disposes (if necessary) of all of the children of the visual</summary>

        if(!this.value) return;

        // delete all template items
        enumerate(this.value.templateItems, function(item, i) {            
            delete this.value.templateItems[i];
        }, this);

        // clean up all child nodes
        var oc, child = ko.virtualElements.firstChild(this.element);
        while (child) {
            oc = child;
            child = ko.virtualElements.nextSibling(child);
            wipeout.utils.html.cleanNode(oc);
            wipeout.bindings.bindingBase.getParentElement(oc).removeChild(oc);
        }

        // clear references to html nodes in view
        this.value.__woBag.nodes.length = 0;
    };
    
    render.prototype.unRender = function() {
        ///<summary>Un renders all of the content of the binding</summary>

        if(!this.value) return;

        this.unTemplate();
        this.value.onUnrender();
        if(this.value.__woBag.rootHtmlElement) {
            // disassociate the visual from its root element and empty the root element
            wipeout.utils.domData.set(this.value.__woBag.rootHtmlElement, wipeout.bindings.wipeout.utils.wipeoutKey, undefined); 
            delete this.value.__woBag.rootHtmlElement;
        }

        if(this.templateChangedSubscription)
            this.value.disposeOf(this.templateChangedSubscription);

        this.value.disposeOf(this.onDisposeEventSubscription);

        delete this.onDisposeEventSubscription;
        delete this.value;
        delete this.templateChangedSubscription;
    };
    
    render.prototype.render = function (newVal) {
        ///<summary>Render a given value</summary>
        ///<param name="newVal" type="wo.view" optional="false">The value to render</param>
        
        if(this.value || this.templateChangedSubscription)
            throw "This binding is already rendering a visual. Call unRender before rendering again.";

        if(!(this.value = newVal))
            return;

        if (!(this.value instanceof wipeout.base.visual))
            throw "This binding can only be used to render a wo.visual within the context of a wo.visual";

        if (this.value.__woBag.rootHtmlElement)
            throw "This visual has already been rendered. Call its unRender() function before rendering again.";

        wipeout.utils.domData.set(this.element, wipeout.bindings.wipeout.utils.wipeoutKey, this.value);
        this.value.__woBag.rootHtmlElement = this.element;

        var subscription1 = this.value.__woBag.disposed.register(this.unRender, this);
        this.onDisposeEventSubscription = this.value.registerDisposable(subscription1);

        var subscription2 = this.value.templateId.subscribe(this.onTemplateChanged, this);
        this.templateChangedSubscription = this.value.registerDisposable(subscription2);
        this.onTemplateChanged(this.value.templateId.peek());
    };
    
    render.prototype.onTemplateChanged = function(newVal) {
        ///<summary>Apply the template of the value to the binding element</summary>  
        ///<param name="newVal" type="wo.view" optional="false">The value to render</param>      
        
        var _this = this;
        function reRender() {
            if(_this.value && _this.value.templateId.peek() !== newVal) return;
            _this.doRendering();
        }

        this.unTemplate();

        if(newVal && wipeout.settings.asynchronousTemplates) {
            ko.virtualElements.prepend(this.element, wipeout.utils.html.createTemplatePlaceholder(this.value));
            wipeout.template.asyncLoader.instance.load(newVal, reRender);
        } else {
            reRender();
        }
    };
    
    render.prototype.doRendering = function() {
        ///<summary>Do the rendering</summary>  

        ko.bindingHandlers.template.update(this.element, wipeout.bindings.render.createValueAccessor(this.value), this.allBindingsAccessor, null, this.bindingContext);

        var bindings = this.allBindingsAccessor();
        if(bindings["wipeout-type"])
            wipeout.bindings["wipeout-type"].utils.comment(this.element, bindings["wipeout-type"]);
    };
    
    render.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ///<summary>Initialize the render binding</summary> 
        ///<param name="element" type="HTMLElement" optional="false">The to bind to</param>
        ///<param name="valueAccessor" type="wo.view" optional="false">The content to render</param>
        ///<param name="allBindingsAccessor" type="Function" optional="false">Other bindings on the element</param>
        ///<param name="viewModel" type="Object" optional="true">Not used</param>
        ///<param name="bindingContext" type="ko.bindingContext" optional="false">The binding context</param>

        var binding = new wipeout.bindings.render(element, valueAccessor(), allBindingsAccessor, bindingContext);                
        binding.render(wipeout.utils.ko.peek(valueAccessor()));
        return binding.bindingMeta;
    };
    
    render.createValueAccessor = function(value) {
        ///<summary>Create a value accessor for the knockout template binding.</summary>
        ///<param name="value" type="wo.view" optional="false">The value to render</param>      

        // ensure template id does not trigger another update
        // this will be handled within the binding
        return function () {
            value = wipeout.utils.ko.peek(value);

            // use the knockout vanilla template engine to render nothing
            if(!(value instanceof wipeout.base.visual))
                 return {
                     name: wipeout.base.visual.getBlankTemplateId()
                 };

            var output = {
                templateEngine: wipeout.template.engine.instance,
                name: value.templateId.peek(),
                afterRender: function(nodes, context) {
                    var old = [];
                    enumerate(value.__woBag.nodes, function(node) {
                        old.push(node);
                    });

                    value.__woBag.nodes.length = 0;
                    enumerate(nodes || [], function(node) {
                        value.__woBag.nodes.push(node);
                    });                            

                    value.onRendered(old, nodes);
                }
            };

            // do not move this to upper definition, knokout regards undefined as a value in this case and will use it as the current binding context
            if(!value.shareParentScope)
                output.data = value;

            return output;
        };
    };
    
    return render;
});