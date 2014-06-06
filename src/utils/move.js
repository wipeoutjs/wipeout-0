
Class("wipeout.utils.move", function () { 
    return function(moveFunctionality) {
        wipeout.utils.moveAsync(function(cleanupCallback) {
            moveFunctionality();
            cleanupCallback();
        });
    };
});