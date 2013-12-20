
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
            new treeViewBranch("API", [new treeViewBranch("wo", [
                new treeViewBranch("contentControl"),
                new treeViewBranch("event"),
                new treeViewBranch("itemsControl"),
                new treeViewBranch("object"),
                new treeViewBranch("routedEvent"),
                new treeViewBranch("view"),
                new treeViewBranch("visual")
            ])]),
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