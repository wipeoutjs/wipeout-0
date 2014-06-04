
Class("wipeout.base.if", function () {
 
    var sc = true;
    var staticConstructor = function () {
        if (!sc) return;
        sc = false;
        
        _if.blankTemplateId = wipeout.base.contentControl.createAnonymousTemplate("", true);
    };
    
    var _if = wipeout.base.contentControl.extend(function (templateId, model) {
        ///<summary>The if class is a content control which provides the functionality of the knockout if binding</summary> 
        ///<param name="templateId" type="String" optional="true">The template id. If not set, defaults to a blank template</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        
        staticConstructor();
        
        this._super(templateId, model);

        //Specifies whether this object should be used as a binding context. If true, the binding context of this object will be it's parent. Default is true
        this.shareParentScope = true;
        
        // if true, the template will be rendered, otherwise a blank template is rendered
        this.condition = ko.observable();
        
        // the template to render if the condition is false. Defaults to a blank template
        this.elseTemplateId = ko.observable(_if.blankTemplateId);
        
        var d1 = this.elseTemplateId.subscribe(this.elseTemplateChanged, this);
        this.registerDisposable(function() { d1.dispose(); });
        
        // anonymous version of elseTemplateId
        this.elseTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.elseTemplateId, this);
        
        // stores the template id if the condition is false
        this.__cachedTemplateId = this.templateId();
        
        var d2 = this.condition.subscribe(this.onConditionChanged, this);
        this.registerDisposable(function() { d2.dispose(); });
        
        var d3 = this.templateId.subscribe(this.copyTemplateId, this);
        this.registerDisposable(function() { d3.dispose(); });
        
        this.copyTemplateId(this.templateId());
    }, "_if");
    
    _if.prototype.elseTemplateChanged = function (newVal) {
        ///<summary>Resets the template id to the else template if condition is not met</summary>  
        ///<param name="newVal" type="String" optional="false">The else template Id</param>   
        if (!this.condition()) {
            this.templateId(newVal);
        }
    };
    
    _if.prototype.onConditionChanged = function (newVal) {
        ///<summary>Set the template based on whether the condition is met</summary>      
        ///<param name="newVal" type="Boolean" optional="false">The condition</param>   
        if (this.__oldConditionVal && !newVal) {
            this.templateId(this.elseTemplateId());
        } else if (!this.__oldConditionVal && newVal) {
            this.templateId(this.__cachedTemplateId);
        }
        
        this.__oldConditionVal = !!newVal;
    };
    
    _if.prototype.copyTemplateId = function (templateId) {
        ///<summary>Cache the template id and check whether correct template is applied</summary>  
        ///<param name="templateId" type="String" optional="false">The template id to cache</param>      
        if (templateId !== this.elseTemplateId())
            this.__cachedTemplateId = templateId;
    
        if (!this.condition() && templateId !== this.elseTemplateId()) {
            this.templateId(this.elseTemplateId());
        }
    };
    
    return _if;
});