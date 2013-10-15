
var wpfko = wpfko || {};
wpfko.base = wpfko.base || {};

(function () {    

    var contentControl = wpfko.base.view.extend(function (templateId) {
        this._super(wpfko.base.visual.getBlankTemplateId());
        
        this.setTemplate = ko.observable();
        
        // flag to stop progress of recursive code
        var setTemplate = {};
    
        // bind template and template id together
        this.setTemplate.subscribe(function (newValue) {
            if (newValue === setTemplate) return;
    
            this.templateId(contentControl.createAnonymousTemplate(newValue));
    
            // clear value. there is no reason to have large strings like this in memory
            this.setTemplate(setTemplate);
        }, this);
    });  
    
    contentControl.createAnonymousTemplate = (function () {
        var templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);

        return function (templateString) {

            // lazy create div to place anonymous templates
            if (!templateArea) {
                templateArea = wpfko.util.html.createElement("<div style='display: none'></div>");
                document.body.appendChild(templateArea);
            }

            templateString = templateString.replace(/^\s+|\s+$/g, '');
            var hash = contentControl.hashCode(templateString).toString();

            // if we can, reuse an existing anonymous template
            for (var j = 0, jj = templateArea.children.length; j < jj; j++) {
                if (templateArea.children[j].nodeName === "SCRIPT" &&
                templateArea.children[j].id &&
                // first use a hash to avoid computationally expensive string compare if possible
                templateArea.children[j].attributes["data-templatehash"] &&
                templateArea.children[j].attributes["data-templatehash"].nodeValue === hash &&
                templateArea.children[j].innerHTML === templateString) {
                    return children[j].id;
                }
            }

            var id = "AnonymousTemplate" + (++i);
            templateArea.innerHTML += '<script type="text/xml" id="' + id + '" data-templatehash="' + hash + '">' + templateString + '</script>';
            return id;
        };
    })();

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    contentControl.hashCode = function (str) {
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0, ii = str.length; i < ii; i++) {
            var ch = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };
    
    wpfko.base.contentControl = contentControl;
})();