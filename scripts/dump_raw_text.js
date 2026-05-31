import { PDFParse } from "pdf-parse";
import fs from "fs";

async function run() {
  const buffer = fs.readFileSync("C:/Users/romit/OneDrive/Desktop/MAIN RESUME.pdf");
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  fs.writeFileSync("C:/Users/romit/.gemini/antigravity-ide/brain/3c52c809-0828-4719-86f0-f6249d61cfea/scratch/raw_text.txt", textResult.text ?? "");
  console.log("Raw text written to scratch/raw_text.txt");
  await parser.destroy();
}

run().catch(console.error);
