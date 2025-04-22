const { NlpManager } = require("node-nlp");
const path = require("path");
const intents = require("./base-intents.json");

const manager = new NlpManager({ languages: ["pt"], forceNER: true });
const modelPath = path.join(__dirname, "model.nlp");

async function trainSave() {
  for (const intent of intents) {
    for (const utterance of intent.utterances) {
      manager.addDocument("pt", utterance, intent.intent);
    }

    for (const answer of intent.answers) {
      manager.addAnswer("pt", intent.intent, answer);
    }
  }

  await manager.train();
  manager.save(modelPath);
}

async function loadModel() {
  await manager.load(modelPath);
}

async function processMessage(text) {
  const response = await manager.process("pt", text);
  return response;
}

module.exports = {
  trainSave,
  loadModel,
  processMessage,
};
