let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;

function teardown() {
    cleanup?.();
    cleanup = undefined;
    activeRoot = null;
}

function setup() {
    const root = document.querySelector<HTMLElement>('.project-index');
    if (root === activeRoot) return;
    teardown();
    if (!root) return;
    activeRoot = root;

    const panels = Array.from(root.querySelectorAll<HTMLElement>('.project-index__item'));
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.project-index__directory a'));
    const directory = root.querySelector<HTMLElement>('.project-index__directory');
    const desktop = window.matchMedia('(min-width: 64rem)');
    let frame = 0;
    let current = '';

    // CSS owns scrolling. The script only keeps the directory in sync, including reduced-motion mode.
    const update = () => {
        frame = 0;
        const offset = desktop.matches ? 24 : (directory?.offsetHeight ?? 0) + 16;
        const readingLine = offset + Math.min(160, window.innerHeight * 0.2);
        let active = panels[0];
        for (const panel of panels) {
            if (panel.getBoundingClientRect().top <= readingLine) active = panel;
        }
        if (!active || active.id === current) return;
        current = active.id;
        for (const link of links) {
            if (link.hash !== `#${current}`) {
                link.removeAttribute('aria-current');
                continue;
            }
            link.setAttribute('aria-current', 'location');
            // Reveal the current title horizontally without moving the surrounding page.
            const list = link.closest('ol');
            if (!desktop.matches && list) {
                const linkRect = link.getBoundingClientRect();
                const listRect = list.getBoundingClientRect();
                if (linkRect.left < listRect.left) list.scrollLeft += linkRect.left - listRect.left;
                else if (linkRect.right > listRect.right) list.scrollLeft += linkRect.right - listRect.right;
            }
        }
    };

    const scheduleUpdate = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(root);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    update();

    cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener('scroll', scheduleUpdate);
        window.removeEventListener('resize', scheduleUpdate);
    };
}

setup();
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);
