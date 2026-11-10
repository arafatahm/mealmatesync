
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
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Could not read report image.'));
    };

    reader.readAsDataURL(blob);
  });
}

// Share as Text
window.mealMateNativeShareText = async function (title, text) {
  ensureNativePlatform();

  return Share.share({
    title: title || 'Meal Mate Report',
    text: String(text || ''),
    dialogTitle: 'Share Meal Mate Report'
  });
};

// Share as Picture
window.mealMateNativeSharePicture = async function (blob, fileName, title) {
  ensureNativePlatform();

  const safeName = (fileName || 'Meal-Mate-Report.png')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  const base64 = await blobToBase64(blob);

  const saved = await Filesystem.writeFile({
    path: safeName,
    data: base64,
    directory: Directory.Cache,
    recursive: true
  });

  let fileUri = saved.uri;

  if (!fileUri) {
    const result = await Filesystem.getUri({
      path: safeName,
      directory: Directory.Cache
    });
    fileUri = result.uri;
  }

  return Share.share({
    title: title || 'Meal Mate Report',
    text: title || 'Meal Mate Report',
    files: [fileUri],
    dialogTitle: 'Share Meal Mate Report'
  });
};
