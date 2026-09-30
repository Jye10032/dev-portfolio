/**
 * Colour-scheme switching. Loaded un-deferred from <head> so the stored choice
 * applies before first paint, which avoids a flash of the wrong palette.
 *
 * Storage access may throw (Safari private mode, blocked cookies), so every
 * read and write is guarded and degrades to the system preference.
 */
(function () {
    var STORAGE_KEY = 'theme';
    var root = document.documentElement;

    function readPreference() {
        try {
            var stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored === 'dark' || stored === 'light') return stored;
        } catch (error) {
            /* fall through to the system preference */
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function savePreference(theme) {
        try {
            window.localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            /* the choice still applies for this page view */
        }
    }

    function render(theme) {
        root.classList.toggle('dark', theme === 'dark');
    }

    function bindControls() {
        var controls = document.querySelectorAll('[data-theme-toggle]');
        for (var i = 0; i < controls.length; i += 1) {
            controls[i].onclick = function () {
                var next = root.classList.contains('dark') ? 'light' : 'dark';
                render(next);
                savePreference(next);
            };
        }
    }

    render(readPreference());

    document.addEventListener('astro:page-load', bindControls);

    // View transitions replace <body>, so the class on <html> survives but the
    // control itself is a fresh node that needs rebinding.
    document.addEventListener('astro:after-swap', function () {
        render(readPreference());
        bindControls();
    });
})();
