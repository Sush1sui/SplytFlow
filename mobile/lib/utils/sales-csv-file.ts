import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import ReactNativeBlobUtil from "react-native-blob-util";

const APP_EXPORT_DIRECTORY_NAME = "splytflow-exports";
const ANDROID_EXPORT_FOLDER_NAME = "SplytFlow Exports";
const CSV_MIME_TYPE = "text/csv";

type SaveSalesCsvResult = {
  fileUri: string;
  savedPathLabel: string;
};

type AndroidMediaFileDescriptor = {
  name: string;
  parentFolder: string;
  mimeType: string;
};

function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.csv$/i, "");
}

async function ensureAppExportDirectory(): Promise<string> {
  if (!FileSystem.documentDirectory) {
    throw new Error("CSV_EXPORT_DOCUMENT_DIRECTORY_UNAVAILABLE");
  }

  const exportDirectoryUri = `${FileSystem.documentDirectory}${APP_EXPORT_DIRECTORY_NAME}/`;

  await FileSystem.makeDirectoryAsync(exportDirectoryUri, {
    intermediates: true,
  });

  return exportDirectoryUri;
}

async function saveSalesCsvOnAndroid(
  fileName: string,
  csvContent: string,
): Promise<SaveSalesCsvResult> {
  const safeFileName = `${getFileNameWithoutExtension(fileName)}.csv`;
  const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeFileName}`;

  await ReactNativeBlobUtil.fs.writeFile(tempPath, csvContent, "utf8");

  try {
    // Using Android MediaStore avoids SAF folder picker and places files in public Downloads.
    const descriptor: AndroidMediaFileDescriptor = {
      name: safeFileName,
      parentFolder: ANDROID_EXPORT_FOLDER_NAME,
      mimeType: CSV_MIME_TYPE,
    };

    const contentUri =
      await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        descriptor,
        "Download",
        tempPath,
      );

    return {
      fileUri: contentUri,
      savedPathLabel: "Downloads/SplytFlow Exports",
    };
  } finally {
    try {
      await ReactNativeBlobUtil.fs.unlink(tempPath);
    } catch {
      // Temp cleanup is best-effort only.
    }
  }
}

async function saveSalesCsvOnIos(
  fileName: string,
  csvContent: string,
): Promise<SaveSalesCsvResult> {
  const exportDirectoryUri = await ensureAppExportDirectory();
  const fileUri = `${exportDirectoryUri}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return {
    fileUri,
    savedPathLabel:
      Platform.OS === "ios"
        ? "On My iPhone/SplytFlow/splytflow-exports"
        : "App Files/splytflow-exports",
  };
}

export async function saveSalesCsvToDevice(
  fileName: string,
  csvContent: string,
): Promise<SaveSalesCsvResult> {
  if (Platform.OS === "android") {
    return saveSalesCsvOnAndroid(fileName, csvContent);
  }

  return saveSalesCsvOnIos(fileName, csvContent);
}
