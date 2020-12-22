module.exports = function shortenPaths(files, commonPrefix) {
  Object.keys(files).forEach((file) => {
    files[file].shortened = files[file].resolved.replace(commonPrefix, '').replace(/\\/g, '/');
  });

  return files;
};
