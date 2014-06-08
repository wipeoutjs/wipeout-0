var $fixture;
var $application;
var application;

module("wipeout.tests.integration.problemsFoundInDev", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("cannot render binding twice", function() {
    
    // arrange
    window.views = {
        myView: wo.contentControl.extend({
            constructor: function() {
                this._super();

                this.template('<wo.contentControl>\
    <template>\
        <div id="theView"></div>\
    </template>\
</wo.contentControl>');
            }
        }, "myView")
    };

    var $fixture = $("#qunit-fixture");
    $fixture.html("<div data-bind='wipeout: views.myView'></div>");
    $application = $($fixture.children()[0]);
    
    // act
    ko.applyBindings({}, $application[0]);
    
    // assert
    ok(document.getElementById("theView"));    

    delete window.views;
    ko.cleanNode($application[0]);
    stop();
    wo.move(function() {
        $fixture.html("");
        $fixture = null;
        $application = null;
        application = null;
        start();
    });
});