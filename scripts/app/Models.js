
$.extend(NS("Wipeout.Docs.Models"), (function() {
    
    var application = wo.object.extend(function() {
        
        this.content = ko.observable(new landingPage());
        
        this.menu = new treeViewBranch("branch 1", [
                        new treeViewBranch("branch 2", [
                            new treeViewBranch("branch 3", [{ text: "leaf1"}, {text: "leaf2"}]),
                            new treeViewBranch("branch 4", [
                                new treeViewBranch("branch 5", [{text: "leaf3"}, {text: "leaf4"}]),
                                new treeViewBranch("branch 6", [{text: "leaf5"}, {text: "leaf6"}])
                            ])
                        ]),
                        new treeViewBranch("branch 7", [{text: "leaf7"}, {text: "leaf8"}])
                    ]);        
    });
    
    var treeViewBranch =  wo.object.extend(function(name, branches) {
        this.name = name;
        this.branches = branches;
    });
    
    var landingPage =  wo.object.extend(function() {
        
    });
    
    var components = {
        TreeViewBranch: treeViewBranch
    };
    
    var pages = {
        LandingPage: landingPage
    };
    
    return {
        Application: application,
        Components: components,
        Pages: pages
    };
})());