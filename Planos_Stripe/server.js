// Importa os módulos necessários
import express from "express";  // Framework para criar o servidor HTTP e rotas
import Stripe from "stripe";    // Biblioteca oficial do Stripe para pagamentos
import dotenv from "dotenv";    // Permite usar variáveis de ambiente (arquivo .env)
import cors from "cors";        // Libera acesso à API de origens diferentes (front-end)

// Carrega as variáveis do arquivo .env para o process.env
dotenv.config();

// Cria uma instância do servidor Express
const app = express();

// Configura o servidor para receber e interpretar dados em JSON
app.use(express.json());

// Libera o acesso à API (evita erros de CORS ao conectar o front-end)
app.use(cors());

// Cria uma instância do Stripe com a chave secreta armazenada no .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rota POST responsável por criar uma sessão de pagamento no Stripe
app.post("/create-checkout-session", async (req, res) => {
  // Extrai o ID do preço (priceId) enviado pelo front-end
  const { priceId } = req.body;

  try {
    // Cria uma nova sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // Define o tipo de pagamento (assinatura)
      payment_method_types: ["card"], // Aceita pagamento com cartão
      line_items: [
        {
          price: priceId, // ID do plano/preço configurado no Stripe
          quantity: 1,    // Quantidade de planos (normalmente 1 por vez)
        },
      ],
      // URL para onde o usuário será redirecionado se o pagamento der certo
      success_url: "http://localhost:5500/public/pagina-inicial/sucesso.html",

      // URL para onde o usuário será redirecionado se cancelar o pagamento
      cancel_url: "http://localhost:5500/public/pagina-inicial/planos.html",
    });

    // Retorna para o front-end a URL gerada da sessão de pagamento
    res.json({ url: session.url });
  } catch (err) {
    // Caso ocorra algum erro, retorna a mensagem de erro com status 500
    res.status(500).json({ error: err.message });
  }
});

// Inicia o servidor na porta 3000 e exibe uma mensagem no console
app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);
