
Class("wipeout.base.contentControl", function () {    

    var contentControl = wipeout.base.view.extend(function (templateId, model) {
        ///<summary>Expands on visual and view functionality to allow the setting of anonymous templates</summary>
        ///<param name="templateId" type="string" optional="true">The template id. If not set, defaults to a blank template</param>
        ///<param name="model" type="Any" optional="true">The initial model to use</param>
        this._super(templateId || wipeout.base.visual.getBlankTemplateId(), model);

        //The template which corresponds to the templateId for this item
        this.template = contentControl.createTemplatePropertyFor(this.templateId, this);
    }, "contentControl");    
    
    contentControl.createTemplatePropertyFor = function(templateIdObservable, owner) {
        ///<summary>Creates a computed for a template property which is bound to the templateIdObservable property</summary>
        ///<param name="templateIdObservable" type="ko.observable" generic0="String" optional="false">The observable containing the templateId to create a template property for</param>
        ///<param name="owner" type="Object" optional="false">The new owner of the created template property</param>
        ///<returns type="String">A template property bound to the template id</returns>
        var output = ko.dependentObservable({
            read: function () {
                var script = document.getElementById(templateIdObservable());
                return script ? script.textContent : "";
            },
            write: function (newValue) {
                templateIdObservable(wipeout.base.contentControl.createAnonymousTemplate(newValue));
            },
            owner: owner
        });
        
        if(owner instanceof wipeout.base.visual)
            owner.registerDisposable(output);
        
        return output;
    };
    
    var dataTemplateHash = "data-templatehash";  
    var tmp = (function () {
        
        var getTemplateArea = (function() {
            var templateArea = null;
            return function() {
                if(!templateArea) {
                    templateArea = wipeout.utils.html.createElement("<div style='display: none'></div>");
                    document.body.appendChild(templateArea);
                }
                
                return templateArea;
            };
        })();
        
        var i = Math.floor(Math.random() * 1000000000); 
        
        return { 
            create: function (templateString, forceCreate) {
                ///<summary>Creates an anonymous template within the DOM and returns its id</summary>
                ///<param name="templateString" type="String" optional="false">Gets a template id for an anonymous template</param>
                ///<param name="forceCreate" type="Boolean" optional="true">Force the creation of a new template, regardless of whether there is an existing clone</param>
                ///<returns type="String">The template id</returns>
                
                var templateArea = getTemplateArea();

                templateString = trim(templateString || "");
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
                contentControl.createTemplate(id, templateString, hash);
                return id;
            },
            del: function(templateId) {
                ///<summary>Deletes an anonymous template with the given id</summary>
                ///<param name="templateId" type="String" optional="false">The id of the template to delete</param>
                ///<returns type="void"></returns>
                var templateArea = getTemplateArea();
            
                for (var j = 0; j < templateArea.childNodes.length; j++) {
                    if (templateArea.childNodes[j].nodeType === 1 &&
                    templateArea.childNodes[j].nodeName === "SCRIPT" &&
                    templateArea.childNodes[j].id === templateId) {
                        templateArea.removeChild(templateArea.childNodes[j]);
                        j--;
                    }
                }
            },
            createTemplate: function(templateId, template, templateHash) {
                ///<summary>Create a template and add it to the DOM</summary>
                ///<param name="templateId" type="String" optional="false">The id for the new template</param>
                ///<param name="template" type="String" optional="false">The template itself</param>
                ///<param name="templateHash" type="String" optional="true">A hash for the template</param>                
                ///<returns type="String">A template property bound to the template id</returns>
                if(contentControl.templateExists(templateId))
                    throw "Template: \"" + templateId + "\" already exists";

                var templateArea = getTemplateArea();

                var script = document.createElement("script");
                
                var att1 = document.createAttribute("type");
                att1.value = "text/xml";
                script.setAttributeNode(att1);

                var att2 = document.createAttribute("id");
                att2.value = templateId;
                script.setAttributeNode(att2);
                
                templateHash = templateHash || contentControl.hashCode(trim(template) || "").toString();                
                var att3 = document.createAttribute(dataTemplateHash);
                att3.value = templateHash;
                script.setAttributeNode(att3);
                
                script.textContent = template;
                templateArea.appendChild(script);
            }
        };
    })();  
    
    contentControl.createAnonymousTemplate = tmp.create;
    contentControl.deleteAnonymousTemplate = tmp.del;
    contentControl.createTemplate = tmp.createTemplate;
    contentControl.templateExists = function(templateId) {
        ///<summary>Describs whether a template exists</summary>
        ///<param name="templateId" type="String" optional="false">The id of the template</param>
        ///<returns type="Boolean"></returns>
        
        return !!document.getElementById(templateId);
    };

    //http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
    contentControl.hashCode = function (str) {        
        ///<summary>Creates a rough has code for the given string</summary>
        ///<param name="str" type="String" optional="false">The string to hash</param>
        ///<returns type="Number">The hash code</returns>
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