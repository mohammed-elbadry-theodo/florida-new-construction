// @ts-check

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const config = require(path.join(process.cwd(), "check-filesize.config"));

const { directoriesRelativePaths, excludeGlobPatterns, includeGlobPatterns, maxFileSizeInBytes } = config;

/**
 * @typedef {object} FileSizeCheckerConfig - Config type
 * @property {string[]} directoriesRelativePaths - List of directories relative paths to be processed.
 * @property {number} maxFileSizeInBytes - Maximum file size allowed in bytes.
 * @property {string[]} includeGlobPatterns - List of file patterns to include files.
 * @property {string[]} excludeGlobPatterns - List of file patterns to exclude files.
 */

/**
 * @typedef {object} FileInfo
 * @property {number} size - The file size in megabytes.
 * @property {string} file - The relative path of the file.
 */

/**
 * Returns the absolute path of a directory.
 * @param {string} directory - The directory relative path.
 * @returns {string} The absolute path of the directory.
 */
const getAbsolutePath = (directory) => path.resolve(directory);

/**
 * Returns the size of a file in bytes.
 * @param {string} filePath - The absolute path of the file.
 * @returns {number} The size of the file in bytes.
 */
const getSizeInBytes = (filePath) => fs.statSync(filePath).size;

/**
 * Returns the size of a file in megabytes.
 * @param {number} sizeInBytes - The file size in bytes.
 * @returns {number} The file size in megabytes.
 */
const toMegaBytes = (sizeInBytes) => sizeInBytes / (1024 * 1024);

/**
 * Checks whether a file exceeds the maximum allowed size.
 * @param {number} fileSizeInBytes - The file size in bytes.
 * @returns {boolean} `true` if the file exceeds the maximum allowed size, otherwise `false`.
 */
const isFileExceedsMaxSize = (fileSizeInBytes) => fileSizeInBytes > maxFileSizeInBytes;

/**
 * Returns FileInfo.
 * @param {string} filePath - The absolute path of the file.
 * @returns {FileInfo} A FileInfo object representing the file size and path.
 */
const getFileInfo = (filePath) => {
  const sizeInBytes = getSizeInBytes(filePath);
  const sizeInMegaBytes = Number(toMegaBytes(sizeInBytes).toFixed(3));
  const fileRelativePath = path.relative(process.cwd(), filePath);
  return {
    size: sizeInMegaBytes,
    file: fileRelativePath,
  };
};

/**
 * Returns an array of files in a directory that match the include regex and do not match the exclude regex.
 * @param {string} directory - The directory relative path.
 * @returns {FileInfo[]} An array of files in the directory that match the include regex and do not match the exclude regex.
 */
const getFiles = (directory) => {
  const directoryPath = getAbsolutePath(directory);
  const files = glob.sync(includeGlobPatterns, {
    cwd: directoryPath,
    absolute: true,
    ignore: excludeGlobPatterns,
  });
  if (files) {
    return files
      .filter((filePath) => {
        const sizeInBytes = getSizeInBytes(filePath);
        return isFileExceedsMaxSize(sizeInBytes);
      })
      .map((filePath) => getFileInfo(filePath));
  }
  return [];
};

const filteredFiles = directoriesRelativePaths.flatMap((directory) => getFiles(directory));

if (filteredFiles.length == 0) {
  console.log("\x1b[32m%s\x1b[0m", "All specified files are under max filesize\n");
} else {
  console.log("\x1b[31m%s\x1b[0m", `Files shoudn't exceeds ${maxFileSizeInBytes} Bytes\n`);
  const dataTable = filteredFiles.map(({ size, file }) => ({ "Size (MB)": size, File: file }));
  console.table(dataTable);
  process.exit(1);
}
