
import { Capacitor } from '@capacitor/core';
import { LiveUpdate } from '@capawesome/capacitor-live-update';

const BUNDLED_VERSION = '__MEALMATE_BUILD_VERSION__';

const MANIFEST_URL =
  'https://raw.githubusercontent.com/arafatahm/mealmatesync/gh-pages/latest.json';

async function checkMealMateUpdate() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await LiveUpdate.ready();

    const response = await fetch(
      MANIFEST_URL + '?t=' + Date.now(),
      { cache: 'no-store' }
    );

    if (!response.ok) return;

    const latest = await response.json();

    if (!latest.bundleId || !latest.url) return;

    const current = await LiveUpdate.getCurrentBundle();
    const currentVersion = current.bundleId || BUNDLED_VERSION;

    if (String(latest.bundleId) === String(currentVersion)) return;

    await LiveUpdate.downloadBundle({
      url: latest.url,
      bundleId: String(latest.bundleId),
      artifactType: 'zip'
    });

    await LiveUpdate.setNextBundle({
      bundleId: String(latest.bundleId)
    });

    await LiveUpdate.reload();

  } catch (error) {
    console.log('Meal Mate update unavailable:', error);
  }
}

checkMealMateUpdate();
