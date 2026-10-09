import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let activeRoot: HTMLElement | null = null;
let cleanup: (() => void) | undefined;

function teardown() {
    cleanup?.();
    cleanup = undefined;
    activeRoot = null;
}

function setup() {
    const root = document.querySelector<HTMLElement>('.project-index__list');
    if (root === activeRoot) return;
    teardown();
    if (!root) return;
    activeRoot = root;

    const media = gsap.matchMedia();
    media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
            const panels = Array.from(root.querySelectorAll<HTMLElement>('.project-index__item'));
            if (!panels.length) return;
            document.documentElement.classList.add('project-motion-active');

            panels.forEach((panel) => {
                const intro = panel.querySelector<HTMLElement>('.project-showcase__intro');
                const demo = panel.querySelector<HTMLElement>('.project-demo');
                const timeline = gsap.timeline({
                    scrollTrigger: {
                        trigger: panel,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 0.5
                    }
                });

                if (intro) {
                    timeline.fromTo(intro.children, { y: 28, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.22, stagger: 0.025, ease: 'power2.out' }, 0.04);
                }
                if (demo) {
                    timeline.fromTo(
                        demo,
                        { y: 64, scale: 0.95, opacity: 0.4, transformOrigin: 'center center' },
                        { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' },
                        0.07
                    );
                }
                timeline.to([intro, demo].filter(Boolean), { y: -24, opacity: 0.6, duration: 0.2, ease: 'none' }, 0.8);
            });

            let stops: number[] = [];
            const snap = ScrollTrigger.create({
                start: 0,
                end: () => Math.max(1, ScrollTrigger.maxScroll(window)),
                onRefresh: (self) => {
                    stops = [0, ...panels.map((panel) => gsap.utils.clamp(0, self.end, panel.getBoundingClientRect().top + window.scrollY - 16)), self.end];
                },
                snap: {
                    snapTo: (progress, self) => {
                        // Never move the surrounding page while someone is operating an embedded app.
                        if (!self || root.querySelector('iframe:hover') || !stops.length) return progress;
                        const position = self.scroll();
                        const nearest = gsap.utils.snap(stops, position);
                        const radius = Math.min(window.innerHeight * 0.24, 240);
                        return Math.abs(nearest - position) <= radius ? nearest / self.end : progress;
                    },
                    inertia: false,
                    directional: false,
                    delay: 0.18,
                    duration: { min: 0.28, max: 0.65 },
                    ease: 'power3.out'
                }
            });

            const stopSnap = () => snap.getTween(true)?.kill();
            const frames = Array.from(root.querySelectorAll('iframe'));
            frames.forEach((frame) => {
                frame.addEventListener('pointerenter', stopSnap);
                frame.addEventListener('focus', stopSnap);
            });

            let live = true;
            const refresh = requestAnimationFrame(() => ScrollTrigger.refresh());
            document.fonts.ready.then(() => {
                if (live) ScrollTrigger.refresh();
            });

            return () => {
                live = false;
                cancelAnimationFrame(refresh);
                frames.forEach((frame) => {
                    frame.removeEventListener('pointerenter', stopSnap);
                    frame.removeEventListener('focus', stopSnap);
                });
                document.documentElement.classList.remove('project-motion-active');
            };
        },
        root
    );

    cleanup = () => media.revert();
}

setup();
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);
