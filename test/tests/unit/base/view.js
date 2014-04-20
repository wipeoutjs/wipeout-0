module("wipeout.base.view", {
    setup: function() {
    },
    teardown: function() {
    }
});

test("binding subscriptions one way", function() {
    // arrange
    var view = new wo.view();
    view.prop = ko.observable();
    
    var obs = ko.observable();
    
    view.bind("prop", function() { return obs; }, false);
    
    var props = [];
    view.prop.subscribe(function() {
        props.push(arguments[0]);
    });
    
    var obss = [];
    obs.subscribe(function() {
        obss.push(arguments[0]);
    });
    
    
    // act
    view.prop(1);
    obs(2);
    view.prop(3);
    obs(4);
    view.prop(5);
    obs(6);
    view.prop(7);
    
    // assert
    deepEqual(props, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(obss, [2, 4, 6]);
});

test("binding subscriptions two way", function() {
    // arrange
    var view = new wo.view();
    view.prop = ko.observable();
    
    var obs = ko.observable();
    
    view.bind("prop", function() { return obs; }, true);
    
    var props = [];
    view.prop.subscribe(function() {
        props.push(arguments[0]);
    });
    
    var obss = [];
    obs.subscribe(function() {
        obss.push(arguments[0]);
    });
    
    
    // act
    view.prop(1);
    obs(2);
    view.prop(3);
    obs(4);
    view.prop(5);
    obs(6);
    view.prop(7);
    
    // assert
    deepEqual(props, [1, 2, 3, 4, 5, 6, 7]);
    deepEqual(obss, [1, 2, 3, 4, 5, 6, 7]);
});