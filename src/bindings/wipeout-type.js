
Binding("wipeout-type", true, function () {
        
    // placeholder for binding which does nothing    
    return {
        init: function() {
            ///<summary>Initialize the wipeout-type control binding. Calling this binding does not actually do anything. It is gererally called form the render binding</summary>
        },
        utils: {
            comment: function(element, text) {
                ///<summary>Initialize the wipeout-type control binding. This binding does not actually do anything</summary>
                text = wpfko.utils.ko.peek(text);
                
                if(element.nodeType === 1) {
                    if(element.childNodes.length)
                        element.insertBefore(document.createComment(text), element.childNodes[0]);
                    else
                        element.appendChild(document.createComment(text));
                } else if(element.parentElement) {
                    if(element.nextSibling)
                        element.parentElement.insertBefore(document.createComment(text), element.nextSibling);
                    else
                        element.parentElement.append(document.createComment(text));
                }
            }
        }
    };
});