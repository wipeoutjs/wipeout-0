
Class("wpfko.base.if", function () {
 
    var sc = true;
    var staticConstructor = function () {
        if (!sc) return;
        sc = false;
        
        _if.blankTemplateId = wpfko.base.contentControl.createAnonymousTemplate("", true);
    };
    
    var _if = wpfko.base.contentControl.extend(function () {
        ///<summary>The if class is a content control which provides the functionality of the knockout if binding</summary>        
        staticConstructor();
        
        this._super.apply(this, arguments);
        
        // if true, the template will be rendered, otherwise a blank template is rendered
        this.condition = ko.observable();
        
        // the template to render if the condition is false. Defaults to a blank template
        this.elseTemplateId = ko.observable(_if.blankTemplateId);
        this.registerDisposable(this.elseTemplateId.subscribe(this.elseTemplateChanged, this).dispose);
        
        // anonymous version of elseTemplateId
        this.elseTemplate = wpfko.base.contentControl.createTemplatePropertyFor(this.elseTemplateId, this);
        
        // stores the template id if the condition is false
        this.__cachedTemplateId = this.templateId();
        
        this.registerDisposable(this.condition.subscribe(this.onConditionChanged, this).dispose);
        this.registerDisposable(this.templateId.subscribe(this.copyTemplateId, this).dispose);
        
        this.copyTemplateId(this.templateId());
    }, "_if");
    
    // picked up by wpfko.base.visual constructor
    _if.woInvisibleDefault = true;
    
    _if.prototype.elseTemplateChanged = function (newVal) {
        ///<summary>Resets the template id to the else template if condition is not met</summary>     
        if (!this.condition()) {
            this.templateId(newVal);
        }
    };
    
    _if.prototype.onConditionChanged = function (newVal) {
        ///<summary>Set the template based on whether the condition is met</summary>     
        if (this.__oldConditionVal && !newVal) {
            this.templateId(this.elseTemplateId());
        } else if (!this.__oldConditionVal && newVal) {
            this.templateId(this.__cachedTemplateId);
        }
        
        this.__oldConditionVal = !!newVal;
    };
    
    _if.prototype.copyTemplateId = function (templateId) {
        ///<summary>Cache the template id and check whether correct template is applied</summary>     
        if (templateId !== this.elseTemplateId())
            this.__cachedTemplateId = templateId;
    
        if (!this.condition() && templateId !== this.elseTemplateId()) {
            this.templateId(this.elseTemplateId());
        }
    };
    
    return _if;
});