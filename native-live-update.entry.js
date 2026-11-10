import { Capacitor } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

const BUNDLED_VERSION = '__MEALMATE_BUILD_VERSION__';

const MANIFEST_URL =
  'https://raw.githubusercontent.com/arafatahm/mealmatesync/gh-pages/latest.json';

async function checkMealMateUpdate() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // আগে বর্তমান ভার্সনকে সচল হিসেবে নিশ্চিত করবে
    await LiveUpdate.ready();

    const response = await fetch(MANIFEST_URL + '?t=' + Date.now(), {
      cache: 'no-store'
    });

    if (!response.ok) return;

    const latest = await response.json();

    if (!latest.bundleId || !latest.url) return;

    const current = await LiveUpdate.getCurrentBundle();
    const currentVersion = current.bundleId || BUNDLED_VERSION;

    if (String(latest.bundleId) === String(currentVersion)) return;

    // নতুন ভার্সন ডাউনলোড করবে
    await LiveUpdate.downloadBundle({
      url: latest.url,
      bundleId: String(latest.bundleId),
      artifactType: 'zip'
    });

    // পরের চালুতে নতুন ভার্সন ব্যবহার করবে
    await LiveUpdate.setNextBundle({
      bundleId: String(latest.bundleId)
    });

    await LiveUpdate.reload();

  } catch (error) {
    // ইন্টারনেট বা ডাউনলোড সমস্যা হলে আগের ভার্সন চলবে
    console.log('Meal Mate update unavailable:', error);
  }
}

checkMealMateUpdate();
