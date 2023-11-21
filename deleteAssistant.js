const OpenAI = require("openai");
// Create a OpenAI connection
const secretKey = "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";
const openai = new OpenAI({
  apiKey: secretKey,
});

async function main() {
  const response = await openai.beta.assistants.del("asst_t5zB7rxifX5KMrezMdAoUe6t");

  console.log(response);
}
main();