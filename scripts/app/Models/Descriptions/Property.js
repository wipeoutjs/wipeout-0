compiler.registerClass("Wipeout.Docs.Models.Descriptions.Property", "Wipeout.Docs.Models.Descriptions.ClassItem", function() {
    var property = function(constructorFunction, propertyName, classFullName) {
        this._super(propertyName, property.getPropertySummary(constructorFunction, propertyName, classFullName));
        
        this.propertyName = propertyName;
        this.classFullName = classFullName;
                
        this.fullyQualifiedName = ko.computed(function() {
            return this.classFullName + "." + this.propertyName;
        }, this);
    };
    
    var inlineCommentOnly = /^\/\//;
    property.getPropertySummary = function(constructorFunction, propertyName, classFullName) {
        var result;
        if(result = property.getPropertyDescriptionOverride(classFullName + "." + propertyName))
            return result.description;
        
        constructorFunction = constructorFunction.toString();
                
        var search = function(regex) {
            var i = constructorFunction.search(regex);
            if(i !== -1) {
                var func = constructorFunction.substring(0, i);
                var lastLine = func.lastIndexOf("\n");
                if(lastLine > 0) {
                    func = func.substring(lastLine);
                } 
                
                func = func.replace(/^\s+|\s+$/g, '');
                if(inlineCommentOnly.test(func))
                    return func.substring(2);
                else
                    return null;
            }
        }
         
        result = search(new RegExp("\\s*this\\s*\\.\\s*" + propertyName + "\\s*="));
        if(result)
            return result;
                
        return search(new RegExp("\\s*this\\s*\\[\\s*\"" + propertyName + "\"\\s*\\]\\s*="));        
    };
    
    property.getPropertyDescriptionOverride = function(classDelimitedPropertyName) {
        
        var current = property.descriptionOverrides;
        enumerate(classDelimitedPropertyName.split("."), function(item) {
            if(!current) return;
            current = current[item];
        });
        
        return current;
    };
        
    property.descriptionOverrides = {
        wo: {
            'if': {
                woInvisibleDefault: { 
                    description: "The default value for woInvisible for the wo.if class."
                }
            },
            html: {
                specialTags: { 
                    description: "A list of html tags which cannot be placed inside a div element."
                }
            },
            ko: {
                array: { 
                    description: "Utils for operating on observableArrays",
                    diff: {
                        description: "ko constants for operating on array changes (\"added\", \"deleted\", \"retained\")."
                    }
                }
            },
            object: {
                useVirtualCache: { 
                    description: "When _super methods are called, the result of the lookup is cached for next time. Set this to false and call clearVirtualCache() to disable this feature."
                }
            },
            view: {
                //TODO: give this a page
                objectParser: { 
                    description: "Used to parse string values into a given type"
                },
                //TODO: give this a page
                reservedPropertyNames: { 
                    description: "Properties which cannot be set on a wipeout object via the template"
                }
            },
            visual: {
                reservedTags: { 
                    description: "A list of names which cannot be used as wipeout object names. These are mostly html tag names"
                },
                woInvisibleDefault: { 
                    description: "The default value for woInvisible for the wo.visual class."
                }
            }
        },
        wipeout: {
            template: {
                engine: {
                    closeCodeTag: { 
                        description: "Signifies the end of a wipeout code block: \"" + wipeout.template.engine.closeCodeTag + "\"."
                    },
                    instance: { 
                        description: "An instance of a wipeout.template.engine which is used by the render binding."
                    },
                    openCodeTag: { 
                        description: "Signifies the beginning of a wipeout code block: \"" + wipeout.template.engine.openCodeTag + "\"."
                    },
                    scriptCache: { 
                        description: "A placeholder for precompiled scripts."
                    },
                    scriptHasBeenReWritten: { 
                        description: "Regex to determine whether knockout has rewritten a template."
                    }
                }
            },
            bindings: {
                bindingBase: {
                    dataKey: {
                        description: "A key for dom data related to wipeout bindings"
                    },
                    registered: {
                        description: "A cache of all bindings created"
                    }
                },
                itemsControl: {
                    utils: {
                        description: "Utils used by the itemsControl binding"                            
                    }
                },
                wipeout: {
                    utils: {
                        description: "Utils used by the wipeout binding"                            
                    }
                },
                'wipeout-type': {
                    utils: {
                        description: "Utils used by the wipeout-type binding"
                    }
                }
            },
            template: {
                asyncLoader: {                    
                    instance: {
                        description: "A static instance of the async loader"
                    }
                },
                engine: {
                    closeCodeTag: { 
                        description: "Signifies the end of a wipeout code block: \"" + wipeout.template.engine.closeCodeTag + "\"."
                    },
                    instance: { 
                        description: "An instance of a wipeout.template.engine which is used by the render binding."
                    },
                    openCodeTag: { 
                        description: "Signifies the beginning of a wipeout code block: \"" + wipeout.template.engine.openCodeTag + "\"."
                    },
                    scriptCache: { 
                        description: "A placeholder for precompiled scripts."
                    },
                    scriptHasBeenReWritten: { 
                        description: "Regex to determine whether knockout has rewritten a template."
                    },
                    prototype: {
                        isTemplateRewritten: {
                            description: "A knockout native function"
                        },
                        makeTemplateSource: {
                            description: "A knockout native function"
                        },
                        renderTemplate: {
                            description: "A knockout native function"
                        }
                    }
                }
            },
            utils: {
                find: {
                    regex: {
                        description: "Regular expressions used by $find"
                    }
                },
                html: {
                    cannotCreateTags: {
                        description: "A list of html tags which wipeout refuses to create, for example <html>."
                    },
                    specialTags: {
                        description: "A list of html tags which cannot be placed inside a div element."
                    }
                }
            }
        }
    };
    
    return property;  
}); 