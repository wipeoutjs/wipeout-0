
Class("wpfko.base.if", function () {
    
    var _if = wpfko.base.contentControl.extend(function () {
        ///<summary>The if class is a content control which provides the functionality of the knockout if binding</summary>        
        this._super.apply(this, arguments);
        
        this.condition = ko.observable();
        this.condition.subscribe(this.ifValueChanged, this);
        this.templateId.subscribe(this.copyTemplateId, this);
        
        this.copyTemplateId(this.templateId());
    });
    
    _if.prototype.ifValueChanged= function(newVal) {
        if(this.oldVal && !newVal) {
            this.templateId(wpfko.base.visual.getBlankTemplateId());
        } else if(!this.oldVal && newVal) {
            this.templateId(this.__cachedTemplateId);
        }
        
        this.oldVal = !!newVal;
    };
    
    _if.prototype.copyTemplateId= function(templateId) {
        this.__cachedTemplateId = templateId;
        if(!this.condition() && templateId !== wpfko.base.visual.getBlankTemplateId()) {
            this.templateId(wpfko.base.visual.getBlankTemplateId());
        }
    };

    return _if;
});