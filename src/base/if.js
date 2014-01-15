
Class("wpfko.base.if", function () {
    
    var sc = true;
    var staticConstructor = function() {
        if(!sc)return;
        sc = false;
        
        _if.blankTemplateId = wpfko.base.contentControl.createAnonymousTemplate("", true);        
    };
    
    var _if = wpfko.base.contentControl.extend(function () {
        ///<summary>The if class is a content control which provides the functionality of the knockout if binding</summary>        
        staticConstructor();
        
        this._super.apply(this, arguments);
        
        // if true, the template will be rendered, otherwise a blank template is rendered
        this.condition = ko.observable();
        
        // stores the template id if the condition is false
        this.__cachedTemplateId = this.templateId();
        
        this.condition.subscribe(this.onConditionChanged, this);
        this.templateId.subscribe(this.copyTemplateId, this);
        
        this.copyTemplateId(this.templateId());
    });        
    
    _if.prototype.onConditionChanged = function(newVal) {
        ///<summary>Set the template based on whether the condition is met</summary>     
        if(this.__oldConditionVal && !newVal) {
            this.templateId(_if.blankTemplateId);
        } else if(!this.__oldConditionVal && newVal) {
            this.templateId(this.__cachedTemplateId);
        }
        
        this.__oldConditionVal = !!newVal;
    };
    
    _if.prototype.copyTemplateId = function(templateId) {
        ///<summary>Cache the template id and check whether correct template is applied</summary>     
        if(templateId !== _if.blankTemplateId)
            this.__cachedTemplateId = templateId;
        
        if(!this.condition() && templateId !== _if.blankTemplateId) {
            this.templateId(_if.blankTemplateId);
        }
    };

    return _if;
});