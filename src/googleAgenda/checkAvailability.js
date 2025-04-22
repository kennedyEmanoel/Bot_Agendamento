const { google } = require("googleapis");
const fs = require("fs");

const path = require("path");

const TOKEN_PATH = path.join(__dirname, "./token.json");

function carregarCredenciais() {
  const credentialsPath = path.join(__dirname, "./credentials.json");
  const credentials = JSON.parse(fs.readFileSync(credentialsPath));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function checkAvailability(data) {
  return new Promise((resolve, reject) => {
    const auth = carregarCredenciais();
    if (!fs.existsSync(TOKEN_PATH)) {
      return reject("Token não encontrado.");
    }

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    auth.setCredentials(token);

    const calendar = google.calendar({ version: "v3", auth });

    const startOfDay = `${data}T00:00:00-03:00`;
    const endOfDay = `${data}T23:59:59-03:00`;

    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: startOfDay,
        timeMax: endOfDay,
        singleEvents: true,
        orderBy: "startTime",
      },
      (err, res) => {
        if (err) {
          console.error("Erro ao listar eventos:", err);
          return reject(err);
        }

        const eventos = res.data.items || [];
        const ocupados = eventos.map((evento) =>
          new Date(evento.start.dateTime).toISOString().substring(11, 16)
        );

        const horariosDisponiveis = [
          "09:00",
          "10:00",
          "14:00",
          "15:00",
          "16:00",
        ];
        const livres = horariosDisponiveis.filter((h) => !ocupados.includes(h));

        resolve(livres);
      }
    );
  });
}

module.exports = checkAvailability;
