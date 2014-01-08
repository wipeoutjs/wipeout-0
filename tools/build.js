window.wo = {};
enumerate(wpfko.base, function(item, i) {
    window.wo[i] = item;
});

window.wo.utils = wpfko.base.utils;

ko.setTemplateEngine(new wpfko.template.engine());