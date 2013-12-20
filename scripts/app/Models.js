
$.extend(NS("Wipeout.Docs.Models"), (function() {
    
    var application = wo.object.extend(function() {
        
        this.content = ko.observable(new landingPage());
        
        
        /*
        Introduction
            Quick demo
            Explanation/Diagrams
            
        API
            by namespace
         */
        
        this.menu = new treeViewBranch("branch 1", [
                        new treeViewBranch("branch 2", [
                            new treeViewBranch("branch 3", [new treeViewBranch("leaf1"), new treeViewBranch("leaf2")]),
                            new treeViewBranch("branch 4", [
                                new treeViewBranch("branch 5", [new treeViewBranch("leaf3"), new treeViewBranch("leaf4")]),
                                new treeViewBranch("branch 6", [new treeViewBranch("leaf5"), new treeViewBranch("leaf6")])
                            ])
                        ]),
                        new treeViewBranch("branch 7", [new treeViewBranch("leaf7"), new treeViewBranch("leaf8")])
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