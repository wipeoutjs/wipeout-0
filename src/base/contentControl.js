
Class("wpfko.base.contentControl", function () {    

    var contentControl = wpfko.base.view.extend(function (templateId) {
        ///<summary>Expands on visual and view functionality to allow the setting of anonymous templates</summary>
        this._super(templateId || wpfko.base.visual.getBlankTemplateId());

        //The template which corresponds to the templateId for this item
        this.template = contentControl.createTemplatePropertyFor(this.templateId, this);
    });
    
    contentControl.createTemplatePropertyFor = function(templateIdObservable, owner) {
        ///<summary>Creates a computed for a template property which is bound to the templateIdObservable property</summary>
        return ko.dependentObservable({
            read: function () {
                var script = document.getElementById(templateIdObservable());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                templateIdObservable(wpfko.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: owner
        });
    };
    
    var dataTemplateHash = "data-templatehash";    
    contentControl.createAnonymousTemplate = (function () {
        var templateArea = null;
        var i = Math.floor(Math.random() * 1000000000);

        return function (templateString, forceCreate) {
            ///<summary>Creates an anonymous template within the DOM and returns its id</summary>

            // lazy create div to place anonymous templates
            if (!templateArea) {
                templateArea = wpfko.utils.html.createElement("<div style='display: none'></div>");
                document.body.appendChild(templateArea);
            }

            templateString = templateString.replace(/^\s+|\s+$/g, '');
            var hash = contentControl.hashCode(templateString).toString();

            if(!forceCreate) {
                // if we can, reuse an existing anonymous template
                for (var j = 0, jj = templateArea.childNodes.length; j < jj; j++) {
                    if (templateArea.childNodes[j].nodeType === 1 &&
                    templateArea.childNodes[j].nodeName === "SCRIPT" &&
                    templateArea.childNodes[j].id &&
                    // first use a hash to avoid computationally expensive string compare if possible
                    templateArea.childNodes[j].attributes[dataTemplateHash] &&
                    templateArea.childNodes[j].attributes[dataTemplateHash].nodeValue === hash &&
                    templateArea.childNodes[j].innerHTML === templateString) {
                        return templateArea.childNodes[j].id;
                    }
                }
            }

            var id = "AnonymousTemplate" + (++i);
            templateArea.innerHTML += '<script type="text/xml" id="' + id + '" ' + dataTemplateHash + '="' + hash + '">' + templateString + '</script>';
            return id;
        };
    })();

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    contentControl.hashCode = function (str) {        
        ///<summary>Creates a rough has code for the given string</summary>
        var hash = 0;
        for (var i = 0, ii = str.length; i < ii; i++) {
            var ch = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash;
    };
    
    return contentControl;
});