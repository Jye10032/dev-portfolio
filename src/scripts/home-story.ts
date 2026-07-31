import { createHomeStoryController, type HomeStoryController } from '../utils/home-story-controller';

let controller: HomeStoryController | undefined;

function setupHomeStory() {
    controller?.destroy();
    const root = document.querySelector<HTMLElement>('[data-home-story]');
    controller = root ? createHomeStoryController(root) : undefined;
}

document.addEventListener('astro:page-load', setupHomeStory);
document.addEventListener('astro:before-swap', () => controller?.destroy());
