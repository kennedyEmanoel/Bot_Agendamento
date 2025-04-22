const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "token.json";

function autorizar(callback) {
  const credentials = JSON.parse(fs.readFileSync("credentials.json"));
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    callback(oAuth2Client);
  } else {
    obterNovoToken(oAuth2Client, callback);
  }
}

function obterNovoToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("👉 Acesse esta URL para autorizar o app:\n", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("\nCole aqui o código de autorização: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Erro ao obter token", err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("✅ Token salvo com sucesso.");
      callback(oAuth2Client);
    });
  });
}

// Cria o evento no Google Calendar
function criarEvento(auth, data, hora) {
  const calendar = google.calendar({ version: "v3", auth });

  const startDateTime = `${data}T${hora}:00-03:00`;
  const endHour = String(parseInt(hora.split(":")[0]) + 1).padStart(2, "0");
  const endDateTime = `${data}T${endHour}:00:00-03:00`;

  const evento = {
    summary: "Consulta Agendada",
    description: "Agendada automaticamente pelo bot.",
    start: { dateTime: startDateTime, timeZone: "America/Sao_Paulo" },
    end: { dateTime: endDateTime, timeZone: "America/Sao_Paulo" },
  };

  calendar.events.insert(
    {
      calendarId: "primary",
      resource: evento,
    },
    (err, event) => {
      if (err) return console.log("❌ Erro ao criar evento:", err);
      console.log("✅ Evento criado com sucesso!");
      console.log("🔗 Link:", event.data.htmlLink);
    }
  );
}

// Teste: agendar consulta
autorizar((auth) => {
  criarEvento(auth, "2025-04-25", "14:00");
});
