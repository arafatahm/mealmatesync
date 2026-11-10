
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

      resolve(
        commaIndex >= 0
          ? result.substring(commaIndex + 1)
          : result
      );
    };

    reader.onerror = () => {
      reject(reader.error || new Error('Could not read report image.'));
    };

    reader.readAsDataURL(blob);
  });
}

// SHARE TEXT
window.mealMateNativeShareText = async function (title, text) {
  ensureNativePlatform();

  return Share.share({
    title: title || 'Meal Mate Report',
    text: String(text || ''),
    dialogTitle: 'Share with'
  });
};

// SHARE PICTURE
window.mealMateNativeSharePicture = async function (
  blob,
  fileName,
  title
) {
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

  if (!saved.uri) {
    throw new Error('Could not create report image file.');
  }

  return Share.share({
    title: title || 'Meal Mate Report',
    text: title || 'Meal Mate Report',
    files: [saved.uri],
    dialogTitle: 'Share with'
  });
};
