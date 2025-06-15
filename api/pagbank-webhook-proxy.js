// api/pagbank-webhook-proxy.js
import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser'; // Para lidar com o corpo da requisição

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Para PagBank, pode ser urlencoded também

// Seu ngrok URL (você precisará atualizá-la aqui cada vez que o ngrok mudar se não for pago)
// Para produção na Vercel, você pode querer que essa URL do Ngrok seja uma VARIÁVEL DE AMBIENTE na Vercel
// ou um endpoint de um servidor fixo.
const NGROK_WEBHOOK_URL = process.env.NGROK_WEBHOOK_URL || "https://SEU_NGROK_ATUAL.ngrok-free.app/webhook-pagbank"; // <-- MUDE ISSO!

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido. Apenas POST.');
  }

  console.log('Webhook do PagBank recebido no Vercel Proxy!');
  console.log('Payload:', JSON.stringify(req.body));
  console.log('Headers:', JSON.stringify(req.headers));

  try {
    // Repassa o webhook para a sua URL local do Ngrok
    const response = await axios.post(NGROK_WEBHOOK_URL, req.body, {
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json', // Mantém o tipo de conteúdo original
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip, // Opcional: passa o IP original
        // Copie outros headers importantes do PagBank se houver (ex: assinaturas)
      }
    });

    console.log('Webhook repassado para Ngrok com sucesso. Resposta:', response.status);
    res.status(response.status).send(response.data); // Repassa a resposta do Ngrok de volta para o PagBank
  } catch (error) {
    console.error('❌ Erro ao repassar webhook para Ngrok:', error.response ? error.response.data : error.message);
    res.status(500).send('Erro interno ao processar webhook.');
  }
};
