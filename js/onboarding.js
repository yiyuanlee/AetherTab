import { storageGet, storageSet } from './storage.js';

const STORAGE_KEY = 'onboardingComplete';

const steps = [
  {
    eyebrow: '01 — Save your flow',
    title: 'Turn open tabs into a focused workspace.',
    body: 'Drag a tab into a collection, or save your whole session in one click. AetherTab closes the saved tab so your browser stays clear.',
  },
  {
    eyebrow: '02 — Make it yours',
    title: 'Create collections for the work you return to.',
    body: 'Use collections for projects, reading lists, trips, or anything you want to keep within reach.',
  },
  {
    eyebrow: '03 — Keep it with you',
    title: 'Enable sync when you are ready.',
    body: 'Turn on Chrome Sync from the sidebar to keep your collections and preferences consistent across your signed-in browsers.',
  },
];

export async function initOnboarding() {
  const { [STORAGE_KEY]: complete } = await storageGet([STORAGE_KEY]);
  if (complete) return;

  const overlay = document.getElementById('onboarding');
  const eyebrow = overlay.querySelector('[data-onboarding-eyebrow]');
  const title = overlay.querySelector('[data-onboarding-title]');
  const body = overlay.querySelector('[data-onboarding-body]');
  const progress = overlay.querySelector('[data-onboarding-progress]');
  const next = overlay.querySelector('[data-onboarding-next]');
  const skip = overlay.querySelector('[data-onboarding-skip]');
  let index = 0;

  const finish = async () => {
    await storageSet({ [STORAGE_KEY]: true });
    overlay.classList.add('hidden');
  };

  const render = () => {
    const step = steps[index];
    eyebrow.textContent = step.eyebrow;
    title.textContent = step.title;
    body.textContent = step.body;
    progress.textContent = `${index + 1} / ${steps.length}`;
    next.textContent = index === steps.length - 1 ? 'Start organizing' : 'Continue';
  };

  next.addEventListener('click', async () => {
    if (index === steps.length - 1) return finish();
    index += 1;
    render();
  });
  skip.addEventListener('click', finish);
  render();
  overlay.classList.remove('hidden');
}
