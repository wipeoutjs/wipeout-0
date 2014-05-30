
Binding("render", true, function () {
    
    function renderedItem(item, parent) {
        ///<summary>A parent/child render relationship</summary>
        if(item && item === parent)
            throw "An item cannot render itself";
        
        this.item = item;
        this.parent = parent instanceof wipeout.base.visual ? parent : null;
        
        wipeout.utils.obj.tryFreeze(this);
    }
    
    return wipeout.bindings.bindingBase.extend({
        constructor: function(element, value, allBindingsAccessor, bindingContext) {  
            this._super(element);
            
            ko.bindingHandlers.template.init(element, wipeout.bindings.render.createValueAccessor(value), allBindingsAccessor, null, bindingContext);        
            
            this.element = element;
            this.allBindingsAccessor = allBindingsAccessor;
            this.bindingContext = bindingContext;
            
            if(ko.isObservable(value)) {
                var val = value.peek();
                value.subscribe(function(newVal) {
                    if(newVal === val)
                        return;
                    
                    try {
                        this.reRender(newVal);
                    } finally {
                        val = newVal;
                    }
                }, this);
            }
        },
        dispose: function() { 
            if(wipeout.bindings.render.freezeDispose && this.value) {
                wipeout.bindings.render.freezeDispose[this.value.__woBag.uniqueId] = this;
            } else {                
                this._super();
                this.unRender();
            }
        },
        reRender: function(value) {
            this.unRender();
            this.render(value);
        },
        unRender: function() {
            
            if (this.value) {
                if(this.value instanceof wipeout.base.visual)
                    this.value.unRender();

                if(this.templateChangedSubscription)
                    this.value.disposeOf(this.templateChangedSubscription);
                
                delete wipeout.bindings.render.renderedItems[this.value.__woBag.uniqueId];
            }
            
            delete this.value;
            delete this.templateChangedSubscription;

        },
        render: function (newVal) {
            if(this.value || this.templateChangedSubscription)
                throw "This binding is already rendering a visual. Call unRender before rendering again.";
            
            if(!(this.value = newVal))
                return;
            
            if (!(this.value instanceof wipeout.base.visual))
                throw "This binding can only be used to render a wo.visual within the context of a wo.visual";

            if (this.value.__woBag.rootHtmlElement)
                throw "This visual has already been rendered. Call its unRender() function before rendering again.";
            
            //TODO: parent is second arg here
            wipeout.bindings.render.renderedItems[this.value.__woBag.uniqueId] = new renderedItem(newVal, this.bindingContext.$data);
            ko.utils.domData.set(this.element, wipeout.bindings.wipeout.utils.wipeoutKey, this.value);
            this.value.__woBag.rootHtmlElement = this.element;
            
            var subscription = this.value.templateId.subscribe(this.onTemplateChanged, this);
            this.templateChangedSubscription = this.value.registerDisposable(function() { subscription.dispose(); });
            this.onTemplateChanged(this.value.templateId.peek());
        },
        onTemplateChanged: function(newVal) {
            var _this = this;
            function reRender() {
                // a more recent request has been sent. Cancel this one
                if(_this.value && _this.value.templateId.peek() !== newVal) return;
                
                ko.bindingHandlers.template.update(_this.element, wipeout.bindings.render.createValueAccessor(_this.value), _this.allBindingsAccessor, null, _this.bindingContext);

                var bindings = _this.allBindingsAccessor();
                if(bindings["wipeout-type"])
                    wipeout.bindings["wipeout-type"].utils.comment(_this.element, bindings["wipeout-type"]);
            }

            if(this.value)
                this.value.unTemplate();

            if(newVal && wipeout.utils.html.asynchronousTemplates) {
                ko.virtualElements.prepend(this.element, wipeout.utils.html.createTemplatePlaceholder(this.value))
                wipeout.template.asyncLoader.instance.load(newVal, reRender);
            } else {
                reRender();
            }
        },
        statics: {
            renderedItems: {},
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>       
                
                var binding = new wipeout.bindings.render(element, valueAccessor(), allBindingsAccessor, bindingContext);                
                binding.render(wipeout.utils.ko.peek(valueAccessor()));
            },
            createValueAccessor: function(value) {
                ///<summary>Create a value accessor for the knockout template binding.</summary>

                // ensure template id does not trigger another update
                // this will be handled within the binding
                return function () {
                    var child = wipeout.utils.ko.peek(value);

                    var output = {
                        templateEngine: wipeout.template.engine.instance,
                        name: child ? child.templateId.peek() : "",                
                        afterRender: child ? function(nodes, context) {
                            var old = child.__woBag.nodes || [];
                            child.__woBag.nodes = nodes;
                            child.onRendered(old, nodes);
                        } : undefined
                    };

                    if(child && !child.shareParentScope)
                        output.data = value || {};

                    return output;
                };
            },
            move: function(moveCallback) {
                if(wipeout.bindings.render.freezeDispose)
                    throw "You can only have one move function running at one time";
                
                wipeout.bindings.render.freezeDispose = {};
                
                try {
                    moveCallback();
                } finally {
                    delete wipeout.bindings.render.freezeDispose;
                }
            }
        }
    });
});