
Class("wpfko.base.if", function () {
    
    var _if = wpfko.base.contentControl.extend(function () {
        ///<summary>The if class is a content control which provides the functionality of the knockout if binding</summary>        
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
            this.templateId(wpfko.base.visual.getBlankTemplateId());
        } else if(!this.__oldConditionVal && newVal) {
            this.templateId(this.__cachedTemplateId);
        }
        
        this.__oldConditionVal = !!newVal;
    };
    
    _if.prototype.copyTemplateId = function(templateId) {
        ///<summary>Cache the template id and check whether correct template is applied</summary>     
        this.__cachedTemplateId = templateId;
        if(!this.condition() && templateId !== wpfko.base.visual.getBlankTemplateId()) {
            this.templateId(wpfko.base.visual.getBlankTemplateId());
        }
    };

    return _if;
});