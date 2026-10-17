const imageAssets = import.meta.glob<string>('../assets/images/*', {
  eager: true,
  import: 'default',
  query: '?url',
});

export const resolveImageUrl = (imagePath: string): string => {
  const sourcePrefix = '/src/assets/images/';
  if (!imagePath.startsWith(sourcePrefix)) return imagePath;

  const assetKey = `../assets/images/${imagePath.slice(sourcePrefix.length)}`;
  return imageAssets[assetKey] ?? imagePath;
};
