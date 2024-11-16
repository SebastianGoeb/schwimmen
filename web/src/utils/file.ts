export async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (!(file instanceof File)) {
    throw new Error("Input must be a File object");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as ArrayBuffer);
      } else {
        reject("unable to read file");
      }
    };
    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
}
