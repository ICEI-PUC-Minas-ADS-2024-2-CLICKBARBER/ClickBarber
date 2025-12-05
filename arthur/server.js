import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Rota para criar sessão de pagamento
app.post("/create-checkout-session", async (req, res) => {
  const { priceId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: "http://localhost:5500/public/paginadesucesso.html",
      cancel_url: "http://localhost:5500/public/paginadeplanos.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3002, () => {
  console.log("Servidor rodando em http://localhost:3002");
});
