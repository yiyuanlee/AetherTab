import { storageGet, storageSet } from './storage.js';

const STORAGE_KEY = 'onboardingComplete';

const steps = [
  {
    eyebrow: '01 — Clear the noise',
    title: 'Save what matters. Close the rest.',
    body: 'Drag a tab into a collection, or save your entire session in one click. Your browser stays calm while your work remains close.',
  },
  {
    eyebrow: '02 — Keep it together',
    title: 'Give every project a home.',
    body: 'Create collections for your work, reading, plans, and everything you return to. The right link is always where you expect it.',
  },
  {
    eyebrow: '03 — Take it with you',
    title: 'Your workspace, on every device.',
    body: 'Enable Chrome Sync whenever you are ready to keep your collections and preferences in step across your signed-in browsers.',
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
