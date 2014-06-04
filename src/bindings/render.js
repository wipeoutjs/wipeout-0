
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
            
            if(wipeout.utils.domData.get(this.element, wipeout.bindings.render.dataKey))
                throw "There is already a binding on this element for rendering content";
            
            wipeout.utils.domData.set(this.element, wipeout.bindings.render.dataKey, this);
            
            this.initReturnValue = ko.bindingHandlers.template.init(this.element, wipeout.bindings.render.createValueAccessor(value), allBindingsAccessor, null, bindingContext);            
            this.allBindingsAccessor = allBindingsAccessor;
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
        },
        moved: function(oldParentElement, newParentElement) {
            this._super(oldParentElement, newParentElement);
            
            if(!wipeout.settings.suppressWarnings && this.value) {
                for (var i = 0, ii = this.value.__woBag.nodes.length; i < ii; i++) {
                    if(wipeout.utils.ko.virtualElements.parentElement(this.value.__woBag.nodes[i]) !== this.value.__woBag.rootHtmlElement) {
                        console.warn("Only part of this view model was moved. Un moved nodes will be deleted or orphaned with their bindings cleared when this view model is re-rendered or disposed.");
                        break;
                    }
                }
            }
        },
        dispose: function() {
            
            this.unRender();
            
            this._super();     
            
            if(this.subscribed) {
                this.subscribed.dispose();
                delete this.subscribed;
            }            
        },
        reRender: function(value) {
            this.unRender();
            this.render(value);
        },
        unRender: function() {
            
            if(!this.value) return;
            
            this.unTemplate();
            this.value.onUnrender();
            if(this.value.__woBag.rootHtmlElement) {
                // disassociate the visual from its root element and empty the root element
                ko.utils.domData.set(this.value.__woBag.rootHtmlElement, wipeout.bindings.wipeout.utils.wipeoutKey, undefined); 
                delete this.value.__woBag.rootHtmlElement;
            }

            if(this.templateChangedSubscription)
                this.value.disposeOf(this.templateChangedSubscription);

            this.value.disposeOf(this.onDisposeEventSubscription);
            
            delete this.onDisposeEventSubscription;
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
            
            var subscription1 = this.value.__woBag.disposed.register(this.unRender, this);
            this.onDisposeEventSubscription = this.value.registerDisposable(function() { subscription1.dispose(); });
            
            var subscription2 = this.value.templateId.subscribe(this.onTemplateChanged, this);
            this.templateChangedSubscription = this.value.registerDisposable(function() { subscription2.dispose(); });
            this.onTemplateChanged(this.value.templateId.peek());
        },
        unTemplate: function() {
            ///<summary>Removes and disposes (if necessary) of all of the children of the visual</summary>
                        
            if(!this.value) return;
            
            // delete all template items
            enumerate(this.value.templateItems, function(item, i) {            
                delete this.value.templateItems[i];
            }, this);
            
            // clean up all child nodes
            var child = ko.virtualElements.firstChild(this.element);
            while (child) {
                wipeout.utils.html.cleanNode(child);
                var oc = child;
                child = ko.virtualElements.nextSibling(child);
                oc.parentElement.removeChild(oc);
            }
                
            // delete any nodes which have been removed from the template
            if(!wipeout.settings.orphanMovedNodesOnTemplate) {
                enumerate(this.value.__woBag.nodes, function(node) {                    
                    if(node.parentElement)
                        node.parentElement.removeChild(node);
                });
            }
            
            // clear references to html nodes in view
            this.value.__woBag.nodes.length = 0;
        },
        onTemplateChanged: function(newVal) {
            var _this = this;
            function reRender() {
                if(_this.value && _this.value.templateId.peek() !== newVal) return;
                _this.doRendering();
            }

            this.unTemplate();

            if(newVal && wipeout.settings.asynchronousTemplates) {
                ko.virtualElements.prepend(this.element, wipeout.utils.html.createTemplatePlaceholder(this.value))
                wipeout.template.asyncLoader.instance.load(newVal, reRender);
            } else {
                reRender();
            }
        },
        doRendering: function() {

            ko.bindingHandlers.template.update(this.element, wipeout.bindings.render.createValueAccessor(this.value), this.allBindingsAccessor, null, this.bindingContext);

            var bindings = this.allBindingsAccessor();
            if(bindings["wipeout-type"])
                wipeout.bindings["wipeout-type"].utils.comment(this.element, bindings["wipeout-type"]);
        },
        statics: {
            dataKey: "wipeout.bindings.render",
            init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                ///<summary>Initialize the render binding</summary>       
                
                var binding = new wipeout.bindings.render(element, valueAccessor(), allBindingsAccessor, bindingContext);                
                binding.render(wipeout.utils.ko.peek(valueAccessor()));
                return binding.initReturnValue;
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
                            var old = [];
                            enumerate(child.__woBag.nodes, function(node) {
                                old.push(node);
                            });
                            
                            child.__woBag.nodes.length = 0;
                            enumerate(nodes || [], function(node) {
                                child.__woBag.nodes.push(node);
                            });                            
                            
                            child.onRendered(old, nodes);
                        } : undefined
                    };

                    if(child && !child.shareParentScope)
                        output.data = value || {};

                    return output;
                };
            }
        }
    });
});