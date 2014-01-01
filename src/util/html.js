
var wpfko = wpfko || {};
wpfko.util = wpfko.util || {};

(function () { 
        
    var outerHTML = function(element) {
        if(!element) return null;
        
        var tagName = element.nodeType === 1 ? (specialTags[element.tagName.toLowerCase()] || "div") : "div";
        var div = document.createElement(tagName);
        div.innerHTML = element.outerHTML;
        
        return div.innerHTML;        
    };  
        
    //TODO: div might not be appropriate, eg, if html string is <li />
    var createElement = function(htmlString) {
        if(!htmlString) return null;
        var parent = document.createElement(specialTags[getTagName(htmlString)] || "div");
        parent.innerHTML = htmlString;
        var element = parent.firstChild;
        parent.removeChild(element);
        return element;        
    }; 
    
    var validHtmlCharacter = /[a-zA-Z0-9]/;
    var getTagName = function(openingTag) {
        openingTag = openingTag.replace(/^\s+|\s+$/g, "");
        if(!openingTag || openingTag[0] !== "<")
            throw "Invalid html tag";
        
        openingTag = openingTag.substring(1).replace(/^\s+|\s+$/g, "");
        
        for(var i = 0, ii = openingTag.length; i < ii; i++) {
            if(!validHtmlCharacter.test(openingTag[i]))
                break;
        }
        
        return openingTag.substring(0, i);
    };
    
    var stripHtmlComments = /<\!--[^>]*-->/g;
    var getFirstTagName = function(htmlContent) {
        htmlContent = htmlContent.replace(stripHtmlComments, "").replace(/^\s+|\s+$/g, "");
        var i = 0;
        if((i = htmlContent.indexOf("<")) === -1)
            return null;
        
        return getTagName(htmlContent.substring(i));
    };
    
    //TODO: More tags
    var specialTags = {
        td: "tr",
        th: "tr",
        tr: "tbody",
        tbody: "table",
        thead: "table",
        li: "ul"
    };
       
    //TODO: div might not be appropriate, eg, if html string is <li />
    var createElements = function(htmlString) {
        if(htmlString == null) return null;
        
        var parent1 = getFirstTagName(htmlString) || "div";
        var parent2 = getTagName("<" + parent1 + "/>") || "div";
        
        // add wrapping elements so that text element won't be trimmed
        htmlString = "<" + parent1 + "></" + parent1 + ">" + htmlString + "<" + parent1 + "></" + parent1 + ">";
        
        var div = document.createElement(parent2);
        div.innerHTML = htmlString;
        
        var output = [];
        while(div.firstChild) {
            output.push(div.firstChild);
            div.removeChild(div.firstChild);
        }
        
        // remove added divs
        output.splice(0, 1);
        output.splice(output.length - 1, 1);
        
        return output;
    };  
    
    var createWpfkoComment = function() {
        
        var open = document.createComment(" ko ");   
        var close = document.createComment(" /ko ");
        
        open.__wpfko = {
            open: open,
            close: close,
            "delete": function() {
                var elements = open.__wpfko.allElements();
                for(var i = 0, ii = elements.length; i < ii; i++) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            },
            allElements: function() {
                var output = [];
                var current = open;
                while(true) {
                    output.push(current);
                    if(current === close)
                        break;
                    
                    current = current.nextSibling;
                }
                
                return output;
            },
            insertAfter: function(element) {
                return close.nextSibling ? close.parentNode.insertBefore(element, close.nextSibling) : close.parentNode.appendChild(element);
            }
        };
        
        return open.__wpfko;        
    };
 
    var getAllChildren = function (element) {
        var children = [];
        if (wpfko.util.ko.virtualElements.isVirtual(element)) {
            var parent = wpfko.util.ko.virtualElements.parentElement(element);
            
            // find index of "element"
            for (var i = 0, ii = parent.childNodes.length; i < ii; i++) {
                if (parent.childNodes[i] === element)
                    break;
            }
 
            i++;
 
            // use previous i
            // get all children of the virtual element. It is ok to get more than
            // just the children as the next block will break out when un wanted nodes are reached
            for (var ii = parent.childNodes.length; i < ii; i++) {
                children.push(parent.childNodes[i]);
            }
        } else {
            children = element.childNodes;
        }
 
        var output = [];
        var depth = 0;
 
        for (var i = 0, ii = children.length; i < ii; i++) {
            if (wpfko.util.ko.virtualElements.isVirtualClosing(children[i])) {
                depth--;
                
                // we are in a virtual parent element
                if (depth < 0) return output;
                continue;
            }
 
            // we are in a virtual child element
            if (depth > 0)
                continue;
 
            output.push(children[i]);
            
            // the next element will be in a virtual child
            if (wpfko.util.ko.virtualElements.isVirtual(children[i]))
                depth++;
        }
 
        return output;
    };
    
    wpfko.util.html = {
        specialTags: specialTags,
        getFirstTagName: getFirstTagName,
        getTagName: getTagName,
        getAllChildren: getAllChildren,
        outerHTML: outerHTML,
        createElement: createElement,
        createElements: createElements,
        createWpfkoComment: createWpfkoComment
    };    
})();