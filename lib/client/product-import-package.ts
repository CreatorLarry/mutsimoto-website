const workbookMimeType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const maximumPackageSize = 250 * 1024 * 1024;

const imageMimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export interface PreparedProductImportPackage {
  workbook: File;
  images: File[];
  sourceName: string;
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

function extension(path: string): string {
  return fileName(path).split(".").pop()?.toLowerCase() ?? "";
}

function unzipArchive(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  return import("fflate").then(
    ({ unzip }) =>
      new Promise((resolve, reject) => {
        unzip(data, (error, entries) => {
          if (error) reject(error);
          else resolve(entries);
        });
      }),
  );
}

export async function prepareProductImportPackage(
  source: File,
): Promise<PreparedProductImportPackage> {
  const sourceExtension = extension(source.name);
  if (sourceExtension === "xlsx") {
    return { workbook: source, images: [], sourceName: source.name };
  }
  if (sourceExtension !== "zip") {
    throw new Error("Choose the Mutsimoto XLSX workbook or its ZIP import package.");
  }
  if (source.size > maximumPackageSize) {
    throw new Error("The ZIP import package must be smaller than 250 MB.");
  }

  let entries: Record<string, Uint8Array>;
  try {
    entries = await unzipArchive(new Uint8Array(await source.arrayBuffer()));
  } catch {
    throw new Error("The ZIP package could not be opened. Create it again and retry.");
  }

  const files = Object.entries(entries).filter(
    ([path, data]) => data.length > 0 && !path.startsWith("__MACOSX/"),
  );
  const workbookEntries = files.filter(([path]) => extension(path) === "xlsx");
  if (workbookEntries.length !== 1) {
    throw new Error("The ZIP package must contain exactly one XLSX workbook.");
  }

  const [workbookPath, workbookData] = workbookEntries[0];
  const images = files.flatMap(([path, data]) => {
    const mimeType = imageMimeTypes[extension(path)];
    if (!mimeType) return [];
    return [new File([Uint8Array.from(data)], fileName(path), { type: mimeType })];
  });

  return {
    workbook: new File([Uint8Array.from(workbookData)], fileName(workbookPath), {
      type: workbookMimeType,
    }),
    images,
    sourceName: source.name,
  };
}
