import * as pdfjsLib from "pdfjs-dist";

import pdfWorker
from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// ================= PDF WORKER =================

pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorker;

// ================= EXTRACT PDF TEXT =================

export async function extractPdfText(
  file
) {

  try {

    const arrayBuffer =
      await file.arrayBuffer();

    const pdf =
      await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

    let fullText = "";

    // ================= LOOP PAGES =================

    for (
      let pageNum = 1;
      pageNum <= pdf.numPages;
      pageNum++
    ) {

      const page =
        await pdf.getPage(pageNum);

      const textContent =
        await page.getTextContent();

      const pageText =
        textContent.items
          .map((item) => item.str)
          .join(" ");

      fullText += pageText + "\n";
    }

    return fullText;

  } catch (error) {

    console.log(
      "PDF Extraction Error:",
      error
    );

    return "";
  }
}