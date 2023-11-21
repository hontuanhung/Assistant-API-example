const OpenAI = require('openai')
const fs = require('fs')

// Khởi tạo OpenAI client với API key
const openai = new OpenAI({
  apiKey: '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'
});

async function uploadFile() {
  try {
    const file = await openai.files.create({
      file: fs.createReadStream("./docs/about-copin.pdf"),
      purpose: "assistants",
    });

    console.log("File uploaded:", file);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

uploadFile();
