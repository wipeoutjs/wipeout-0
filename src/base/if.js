
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

        ///<Summary type="Boolean">Specifies whether this object should be used as a binding context. If true, the binding context of this object will be it's parent. Default is true</Summary>
        this.shareParentScope = true;
        
        ///<Summary type="ko.observable" generic0="Boolean">if true, the template will be rendered, otherwise a blank template is rendered</Summary>
        this.condition = ko.observable();
        
        ///<Summary type="ko.observable" generic0="String">the template to render if the condition is false. Defaults to a blank template</Summary>
        this.elseTemplateId = ko.observable(_if.blankTemplateId);
        
        var d1 = this.elseTemplateId.subscribe(this.elseTemplateChanged, this);
        this.registerDisposable(d1);
        
        ///<Summary type="ko.observable" generic0="String">Anonymous version of elseTemplateId</Summary>
        this.elseTemplate = wipeout.base.contentControl.createTemplatePropertyFor(this.elseTemplateId, this);
        
        ///<Summary type="String">Stores the template id if the condition is false</Summary>
        this.__cachedTemplateId = this.templateId();
        
        var d2 = this.condition.subscribe(this.onConditionChanged, this);
        this.registerDisposable(d2);
        
        var d3 = this.templateId.subscribe(this.copyTemplateId, this);
        this.registerDisposable(d3);
        
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