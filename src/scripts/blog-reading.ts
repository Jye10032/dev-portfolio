let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;

function teardown() {
    cleanup?.();
    cleanup = undefined;
    activeRoot = null;
}

function setup() {
    const root = document.querySelector<HTMLElement>('[data-blog-reading]');
    if (root === activeRoot) return;
    teardown();
    if (!root) return;
    activeRoot = root;

    const listeners = new AbortController();
    const { signal } = listeners;
    const progressBar = document.getElementById('reading-progress');
    const tocLinks = [...root.querySelectorAll<HTMLAnchorElement>('.post-toc a')];
    const headings = [...root.querySelectorAll<HTMLElement>('.post-content h2')];
    const compactToc = root.querySelector<HTMLDetailsElement>('.post-toc--compact');
    const currentLabel = root.querySelector<HTMLElement>('[data-toc-current]');
    let frame = 0;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
        frame = 0;
        if (progressBar) {
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = height > 0 ? (window.scrollY / height) * 100 : 0;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
        const active = [...headings].reverse().find((heading) => heading.getBoundingClientRect().top <= 100) ?? headings[0];
        if (!active) return;
        tocLinks.forEach((link) => {
            if (decodeURIComponent(link.hash.slice(1)) === active.id) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        if (currentLabel) currentLabel.textContent = active.textContent;
    };
    const scheduleUpdate = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true, signal });
    window.addEventListener('resize', scheduleUpdate, { signal });
    compactToc?.addEventListener(
        'click',
        (event) => {
            // Collapse before native anchor scrolling measures the target's position.
            if ((event.target as Element).closest('a')) compactToc.open = false;
        },
        { signal }
    );

    const shareButton = root.querySelector<HTMLElement>('[data-share-url]');
    shareButton?.addEventListener(
        'click',
        async () => {
            const { shareUrl = '', shareIdle = '', shareDone = '' } = shareButton.dataset;
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch {
                return;
            }
            if (signal.aborted) return;
            shareButton.textContent = shareDone;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                shareButton.textContent = shareIdle;
            }, 2400);
        },
        { signal }
    );

    update();
    cleanup = () => {
        listeners.abort();
        cancelAnimationFrame(frame);
        clearTimeout(resetTimer);
    };
}

setup();
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);
