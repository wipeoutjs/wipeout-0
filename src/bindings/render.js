
Binding("render", true, function () {
    
    return wipeout.base.disposable.extend({
        constructor: function(element, value, allBindingsAccessor, bindingContext) {
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
            this._super();
            this.unRender();
        },
        reRender: function(value) {
            this.unRender();
            this.render(value);
        },
        unRender: function() {
            
            if (this.value) {
                var i, parent;
                if((parent = this.value.getParent()) instanceof wipeout.base.visual && 
                   parent.__woBag.renderedChildren.indexOf(this.value) !== -1)
                    parent.__woBag.renderedChildren.splice(i, 1);

                if(this.value instanceof wipeout.base.visual)
                    this.value.unRenderOrDispose();

                if(this.templateChangedSubscription)
                    this.value.disposeOf(this.templateChangedSubscription);
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

            ko.utils.domData.set(this.element, wipeout.bindings.wipeout.utils.wipeoutKey, this.value);
            this.value.__woBag.rootHtmlElement = this.element;
            
            var parent = this.value.getParent();
            if(parent)
                parent.__woBag.renderedChildren.push(this.value);
            
            var subscription = this.value.templateId.subscribe(this.onTemplateChanged, this);
            this.templateChangedSubscription = this.value.registerDisposable(function() { subscription.dispose(); });
            this.onTemplateChanged(this.value.templateId.peek());
        },
        onTemplateChanged: function(newVal) {
            var _this = this;
            function reRender() {
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
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>                
                var binding = new wipeout.bindings.render(element, valueAccessor(), allBindingsAccessor, bindingContext);
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    binding.dispose();
                });
                
                binding.render(wipeout.utils.ko.peek(valueAccessor()));
            },
            createValueAccessor: function(value) {
                ///<summary>Create a value accessor for the knockout template binding.</summary>

                // ensure template id does not trigger another update
                // this will be handled within the binding
                return function () {
                    var child = value;
                    var _child = wipeout.utils.ko.peek(child);

                    var output = {
                        templateEngine: wipeout.template.engine.instance,
                        name: _child ? _child.templateId.peek() : "",                
                        afterRender: _child ? function(nodes, context) {
                            var old = _child.nodes || [];
                            _child.nodes = nodes;
                            _child.onRendered(old, nodes);
                        } : undefined
                    };

                    if(_child && !_child.woInvisible)
                        output.data = child || {};

                    return output;
                };
            }
        }
    });
});