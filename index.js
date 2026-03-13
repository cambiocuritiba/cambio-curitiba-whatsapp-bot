const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const message =
    req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    return res.sendStatus(200);
  }

  const from = message.from;
  const text = message.text?.body?.toLowerCase();

  let response = "";

  if (!text) return res.sendStatus(200);

  if (text.includes("oi") || text.includes("olá")) {
    response = `Olá, tudo bem? Somos a Câmbio Curitiba! A operadora de câmbio com mais avaliações positivas no Sul do Brasil (Google, 2025).

Agradecemos seu contato, como podemos te ajudar?

1️⃣ COMPRA
2️⃣ VENDA
3️⃣ RETIRADA`;
  }

  else if (text === "1" || text.includes("compra")) {
    response = `Certo! Por gentileza, informe o valor e qual moeda estrangeira deseja comprar.

Com isso nossos operadores vão preparar a nossa melhor cotação!

Antes de comparecer a loja certifique-se da disponibilidade da moeda e ter seu cadastro efetivado. Trabalhamos com horário agendado.`;
  }

  else if (text === "2" || text.includes("venda")) {
    response = `Perfeito! Por gentileza, informe o valor e qual moeda estrangeira deseja vender.

Com isso nossos operadores vão preparar a nossa melhor cotação!

Antes de comparecer a loja certifique-se da disponibilidade da moeda e ter seu cadastro efetivado - Trabalhamos com horário agendado`;
  }

  else if (text === "3" || text.includes("retirada")) {
    response = `Para dar continuidade na compra é simples!

- Primeiro conferimos o seu cadastro via CPF.
- Depois enviamos o resumo da operação.
- Você envia o comprovante.
- Agendamos retirada ou entrega.

*Consulte taxa de entrega para seu bairro.`;
  }

  else if (text.includes("boletim")) {
    response = `Quer receber o nosso boletim diário?

Participe do canal:

https://whatsapp.com/channel/0029Vb6sVcpEquiHRB1Ty93p`;
  }

  if (response) {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: response },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});