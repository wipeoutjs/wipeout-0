window.wo = {};
enumerate(wpfko.base, function(item, i) {
    window.wo[i] = item[i];
});

window.wo.utils = wpfko.base.utils;