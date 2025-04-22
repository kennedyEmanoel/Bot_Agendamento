const venom = require("venom-bot");
const checkAvailability = require("./src/googleAgenda/checkAvailability");

const { processMessage, loadModel } = require("./src/nlp/nlp");

venom
  .create({
    session: "session-name",
    headless: "new",
  })
  .then(async (client) => {
    await loadModel();
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage(async (message) => {
    if (
      message.body &&
      message.isGroupMsg === false &&
      message.from === "553598794340@c.us"
    ) {
      const response = await processMessage(message.body);
      console.log(response);

      if (response.intent === "None" || response.score < 0.6) {
        await client.sendText(
          message.from,
          "Desculpe, não entendi. Pode repetir?"
        );
        return;
      }

      if (response.intent === "mark_consultation") {
        if (response.intent === "mark_consultation") {
          const data = new Date().toISOString().substring(0, 10);

          try {
            const horarios = await checkAvailability(data);

            if (horarios.length === 0) {
              await client.sendText(
                message.from,
                "Infelizmente não temos horários disponíveis para hoje."
              );
            } else {
              const textoHorarios = horarios.map((h) => `🕒 ${h}`).join("\n");
              await client.sendText(
                message.from,
                `Temos os seguintes horários disponíveis para hoje:\n\n${textoHorarios}\n\nDigite o horário desejado para confirmar.`
              );
            }
          } catch (error) {
            await client.sendText(
              message.from,
              "Erro ao verificar a agenda. Tente novamente mais tarde."
            );
            console.error(error);
          }
        }
      }

      const answer = response.answer;

      if (answer) {
        await client.sendText(message.from, answer);
      } else {
        await client.sendText(
          setTimeout(() => {
            message.from, "Estou aqui para ajudar! Pode repetir?";
          }, "2000")
        );
      }
    }
  });
}
