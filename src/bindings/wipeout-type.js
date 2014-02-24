
Binding("wipeout-type", true, function () {
    
    var wipeoutTypeKey = "wipeout-type";    
    
    // placeholder for binding which does nothing    
    return {
        init: function() {
            ///<summary>Initialize the wipeout-type control binding. Calling this binding does not actually do anything. It is gererally called from the render binding</summary>
        },
        utils: {
            comment: function(element, text) {
                ///<summary>Initialize the wipeout-type control binding. This binding does not actually do anything</summary>
                text = wipeout.utils.ko.peek(text);
                
                if(element.nodeType === 1) {
                    if(element.childNodes.length)
                        element.insertBefore(document.createComment(text), element.childNodes[0]);
                    else
                        element.appendChild(document.createComment(text));
                } else if(element.nodeType === 8) {
                    var originalText;
                    if(!(originalText = ko.utils.domData.get(element, wipeoutTypeKey))) {
                        ko.utils.domData.set(element, wipeoutTypeKey, originalText = element.textContent);
                    }
                    
                    element.textContent = originalText + " wipeout-type: " + text;
                }
            }
        }
    };
});