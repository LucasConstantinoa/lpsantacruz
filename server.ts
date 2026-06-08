import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "config.json");
const LEADS_FILE = path.join(process.cwd(), "leads.json");

app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log("DEBUG: Request URL:", req.url, "NODE_ENV:", process.env.NODE_ENV);
  next();
});

// Initial data
const defaultData = {
  whatsapp: "",
  benefits: [
    { id: 1, title: "Furto / Roubo", tooltip: "Seja ressarcido em até 100% do valor de tabela FIPE caso seu veículo seja roubado ou furtado." },
    { id: 2, title: "Colisão", tooltip: "Em caso de acidente, nós providenciamos o conserto do seu veículo." },
    { id: 3, title: "Perda total", tooltip: "Se o estrago configurar Perda Total, nós iremos indenizá-lo por este prejuízo." },
    { id: 4, title: "Incêndio", tooltip: "Com a gente o seu veículo fica protegido em casos de incêndio com indenização total ou parcial." },
    { id: 5, title: "Fenômenos naturais", tooltip: "Se seu veículo for danificado por alagamentos, quedas de árvores ou chuvas de granizo, nós ressarcimos seu prejuízo." },
    { id: 6, title: "Cobertura em todo Brasil", tooltip: "Não importa onde aconteça o evento, você poderá contar conosco em todo o Brasil." },
    { id: 7, title: "Carro reserva", tooltip: "Disponha um carro reserva caso aconteça algum imprevisto e o seu precise ir para a oficina." },
    { id: 8, title: "Proteção para terceiros", tooltip: "Caso você se envolva em um acidente com outro veículo, os consertos são por nossa conta." },
    { id: 9, title: "Cobertura para vidros", tooltip: "Caso aconteça algum dano com seus vidros, podemos substituí-lo por outro novinho." }
  ]
};

// Ensure data files exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
}

if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
}

// API Routes
app.get("/api/config", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  res.json(data);
});

app.post("/api/config", (req, res) => {
  const newData = req.body;
  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
  res.json({ success: true });
});

app.get("/api/leads", (req, res) => {
  const data = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
  res.json(data);
});

app.post("/api/leads", (req, res) => {
  const newLead = req.body;
  let leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
  
  const existingLeadIndex = leads.findIndex((l: any) => l.sessionId === newLead.sessionId);
  if (existingLeadIndex >= 0) {
    leads[existingLeadIndex] = newLead;
  } else {
    leads.push(newLead);
  }
  
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  res.json({ success: true });
});

app.delete("/api/leads", (req, res) => {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "brtreino@gmail.com" && password === "Escroto12.") {
    res.json({ success: true, token: "admin-token-123" });
  } else {
    res.status(401).json({ success: false, message: "Acesso negado" });
  }
});

  app.get("/trabalheconosco", (req, res) => {
  res.redirect(301, "https://trabalheprosulblumenau.vercel.app/");
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log("DEBUG: Serving static files from:", distPath);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      console.log("DEBUG: Serving index.html from:", indexPath);
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
