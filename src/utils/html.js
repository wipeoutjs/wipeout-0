

Class("wipeout.utils.html", function () { 
        
    var outerHTML = function(element) {
        ///<summary>Browser agnostic outerHTML function</summary>
        if(!element) return null;
        
        if(element.constructor === HTMLHtmlElement) throw "Cannot serialize a Html element using outerHTML";
        
        var tagName = element.nodeType === 1 ? (specialTags[element.tagName.toLowerCase()] || "div") : "div";
        var div = document.createElement(tagName);
        div.innerHTML = element.outerHTML;
        
        return div.innerHTML;        
    };  
    
    var validHtmlCharacter = /[a-zA-Z0-9]/;
    var getTagName = function(openingTag) {
        ///<summary>Get the tag name of the first element in the string</summary>
        
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
        ///<summary>Get the tag name of the first element in the string</summary>
        
        htmlContent = htmlContent.replace(stripHtmlComments, "").replace(/^\s+|\s+$/g, "");
        var i = 0;
        if((i = htmlContent.indexOf("<")) === -1)
            return null;
        
        return getTagName(htmlContent.substring(i));
    };
    
    var specialTags = {
        area: "map",
        base: "head",
        basefont: "head",
        body: "html",
        caption: "table",
        col: "colgroup",
        colgroup: "table",
        command : "menu",
        frame: "frameset",
        frameset: "html",
        head: "html",
        li: "ul",
        tbody: "table",
        td: "tr",
        tfoot: "table",
        th: "tr",
        thead: "table",
        tr: "tbody"
    };
        
    var createElement = function(htmlString) {
        ///<summary>Create a html element from a string</summary>
        
        if(!htmlString) return null;
        var parent = document.createElement(specialTags[getTagName(htmlString)] || "div");
        parent.innerHTML = htmlString;
        var element = parent.firstChild;
        parent.removeChild(element);
        return element;        
    }; 
       
    var createElements = function(htmlString) {
        ///<summary>Create an array of html elements from a string</summary>
        
        if(htmlString == null) return [];
        
        var sibling = getFirstTagName(htmlString) || "div";
        var parent = specialTags[getTagName("<" + sibling + "/>")] || "div";
        
        // add wrapping elements so that text element won't be trimmed
        htmlString = "<" + sibling + "></" + sibling + ">" + htmlString + "<" + sibling + "></" + sibling + ">";
        
        var div = document.createElement(parent);
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
 
    var getAllChildren = function (element) {
        ///<summary>Get all of the children of a html element or knockout virtual element</summary>
        
        var children = [];
        if (wipeout.utils.ko.virtualElements.isVirtual(element)) {
            var parent = wipeout.utils.ko.virtualElements.parentElement(element);
            
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
            if (wipeout.utils.ko.virtualElements.isVirtualClosing(children[i])) {
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
            if (wipeout.utils.ko.virtualElements.isVirtual(children[i]))
                depth++;
        }
 
        return output;
    };
    
    var getViewModel = function(forHtmlNode) {
        ///<summary>Get the view model associated with a html node</summary>
        return ko.utils.domData.get(forHtmlNode, wipeout.bindings.wipeout.utils.wipeoutKey);        
    };
    
    return {
        specialTags: specialTags,
        getFirstTagName: getFirstTagName,
        getTagName: getTagName,
        getAllChildren: getAllChildren,
        outerHTML: outerHTML,
        createElement: createElement,
        createElements: createElements,
        getViewModel: getViewModel
    };    
});

//legacy
Class("wipeout.util.html", function () { 
    return wipeout.utils.html;
});