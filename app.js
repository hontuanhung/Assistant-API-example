// import the required dependencies
require("dotenv").config();
const OpenAI = require("openai");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a OpenAI connection
const secretKey = "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";
const openai = new OpenAI({
  apiKey: secretKey,
});

async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  try {
    // const assistant = await openai.beta.assistants.update({
    //   name: "Copin Analyzer",
    //   instructions:
    //     "My website is Copin, a platform designed for analyzing and copying on-chain traders. You are an intelligent bot dedicated to answering user questions related to my website. If users inquire about topics unrelated to Copin, you will inform them that you are only here to respond to questions about Copin. You automatically utilize the files & functions I've uploaded and search for information to provide accurate and relevant responses. Answers should not contain details related to your operational processes and files.",
    //   tools: [
    //     { type: "code_interpreter" },
    //     {
    //       type: "function",
    //         function: {
    //           name: "get alert",
    //           description:
    //             "Get the array of string with the given volume, the string with a structure that is nearly like this.: \\n 🚨 $1,002,990.14 Opened LONG #BNB at $263.11 on #KWENTA\n\n\n [website]",
    //           parameters: {
    //             type: "object",
    //             properties: {
    //               volume: {
    //                 type: "number",
    //                 description: "The amount of volume",
    //               },
    //               date: {
    //                 type: "number",
    //                 description:
    //                   "The timestamp of the given date is used for querying up to the current date.",
    //               },
    //               limit: {
    //                 type: "number",
    //                 description: "The limit of orders returned upon request.",
    //               },
    //             },
    //             required: ["volume"],
    //           },
    //         },
    //     },
    //   ],
    //   model: "gpt-3.5-turbo-1106",
    // });

    

    // Log the first greeting
    console.log(
      "\nHello there, I'm your personal math tutor. Ask some complicated questions.\n"
    );

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Use keepAsking as state for keep asking questions
    let keepAsking = true;
    while (keepAsking) {
      const userQuestion = await askQuestion("\nWhat is your question? ");

      // Pass in the user question into the existing thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userQuestion,
      });
      

      // Use runs to wait for the assistant response and then retrieve it
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: 'asst_JMQjV8YIsECpsYl8AUIr0LJq',
      });

      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      // Polling mechanism to see if runStatus is completed
      // This should be made more robust.
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      // Get the last assistant message from the messages array
      const messages = await openai.beta.threads.messages.list(thread.id);

      // Find the last message for the current run
      const lastMessageForRun = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      // If an assistant message is found, console.log() it
      if (lastMessageForRun) {
        console.log(`${lastMessageForRun.content[0].text.value} \n`);
      }

      // Then ask if the user wants to ask another question and update keepAsking state
      const continueAsking = await askQuestion(
        "Do you want to ask another question? (y/n) "
      );
      keepAsking = continueAsking.toLowerCase() === "y";

      // If the keepAsking state is falsy show an ending message
      if (!keepAsking) {
        console.log("Alrighty then, I hope you learned something!\n");
      }
    }

    // close the readline
    readline.close();
  } catch (error) {
    console.error(error);
  }
}

// Call the main function
main();
