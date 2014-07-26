
compiler.registerClass("Wipeout.Docs.ViewModels.HowDoIApplication", "Wipeout.Docs.ViewModels.Application", function() {
    
    var apiTemplateId;
    var staticConstructor= function() {
        if(apiTemplateId)
            return;
        
        apiTemplateId = wo.contentControl.createAnonymousTemplate('<h1 data-bind="text: $find(Wipeout.Docs.ViewModels.HowDoIApplication).apiPlaceholderName"></h1>\
<Wipeout.Docs.ViewModels.Components.DynamicRender model="$find(Wipeout.Docs.ViewModels.HowDoIApplication).apiPlaceholder" />');
    };
    
    function HowDoIApplication() {
        staticConstructor();
        
        this._super("Wipeout.Docs.ViewModels.HowDoIApplication", "/wipeout-0/how-do-i.html");
        
        this.contentTemplate = ko.observable(wo.contentControl.getBlankTemplateId());
        
        this.apiPlaceholder = ko.observable();
        this.apiPlaceholderName = ko.observable();
        
        var placeholder = document.getElementById("headerText");
        var textbox = wo.html.createElement('<input style="margin-top: 20px;" type="text" placeholder="Search Docs..."></input>');
        placeholder.parentElement.insertBefore(textbox, placeholder);
        
        var _this = this;
        textbox.addEventListener("keyup", function() {
            _this.model().search(textbox.value);
        });
        
        textbox.addEventListener("change", function() {
            _this.model().search(textbox.value);
        });
    };
    
    HowDoIApplication.prototype.route = function(query) { 
                
        if(query.article) {
            this.openArticle(query.article);
        } else if (query.type === "api") {
            this.apiPlaceholder(Wipeout.Docs.Models.ApiApplication.getModel(query));
            if(this.apiPlaceholder()) {
                this.apiPlaceholderName(this.apiPlaceholder() instanceof Wipeout.Docs.Models.Descriptions.Class ? this.apiPlaceholder().classFullName : "")
                this.contentTemplate(apiTemplateId);
            }
        } else {
            this.contentTemplate(wo.contentControl.getBlankTemplateId());
        }
    };
    
    HowDoIApplication.prototype.openArticle = function(article) { 
        $(".list-group-item-info", this.templateItems.leftNav).removeClass("list-group-item-info");
        
        this.contentTemplate("Articles." + article);
        
        var current, groups = this.templateItems.articles.items();
        for(var i = 0, ii = groups.length; i < ii; i++) {
            if(groups[i].templateItems.header && groups[i].templateItems.header.model().header.article === article) {
                this.scrollToArticle(groups[i].templateItems.header);
                return;
            }
            
            var items = groups[i].templateItems.items ? groups[i].templateItems.items.items() : [];
            for (var j = 0, jj = items.length; j < jj; j++) {
                if(items[j].model().article === article) {
                    this.scrollToArticle(items[j]);
                    return;
                }
            }
        }        
    };
    
    HowDoIApplication.prototype.scrollToArticle = function(articleVm) { 
                
        var articleElement = articleVm.getRootHtmlElement();
        while (articleElement && articleElement.nodeType !== 1)
            articleElement = articleElement.nextSibling;
        
        if(!articleElement) return;
        if(!$(articleElement).hasClass("active"))
            $(articleElement).addClass("list-group-item-info");
        
        var _do = function() {        
            $(this.templateItems.leftNav).animate({
                scrollTop: $(articleElement).offset().top + this.templateItems.leftNav.scrollTop - 80
            }, 500);
        };
        
        setTimeout(_do.bind(this), 100);
    };
    
    return HowDoIApplication;
});