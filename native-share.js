
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

function ensureNativePlatform() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Native sharing is available only in the installed app.');
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    if (!(blob instanceof Blob)) {
      reject(new Error('Invalid report image.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const commaIndex = result.indexOf(',');

      if (commaIndex < 0) {
        reject(new Error('Image conversion failed.'));
        return;
      }

      resolve(result.substring(commaIndex + 1));
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Could not read report image.'));
    };

    reader.readAsDataURL(blob);
  });
}

// TEXT SHARE
window.mealMateNativeShareText = async function (title, text) {
  ensureNativePlatform();

  return await Share.share({
    title: title || 'Meal Mate Report',
    text: String(text || ''),
    dialogTitle: 'Share with'
  });
};

// PICTURE SHARE
window.mealMateNativeSharePicture = async function (
  blob,
  fileName,
  title
) {
  ensureNativePlatform();

  const cleanName = String(fileName || 'Meal-Mate-Report.png')
    .replace(/[^a-zA-Z0-9.-]/g, '');

  const safeName =
    (cleanName || 'Meal-Mate-Report.png').replace(/\.png$/i, '') +
    '-' + Date.now() + '.png';

  const base64 = await blobToBase64(blob);

  const saved = await Filesystem.writeFile({
    path: safeName,
    data: base64,
    directory: Directory.Cache,
    recursive: true
  });

  if (!saved.uri) {
    throw new Error('Could not create report image file.');
  }

  return await Share.share({
    title: title || 'Meal Mate Report',
    text: title || 'Meal Mate Report',
    files: [saved.uri],
    dialogTitle: 'Share with'
  });
};

console.log('Meal Mate Native Share Loaded');
