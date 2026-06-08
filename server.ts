import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "config.json");
const LEADS_FILE = path.join(process.cwd(), "leads.json");

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || "https://cnpfppmypopjaofmjako.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucGZwcG15cG9wamFvZm1qYWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTc3OTEsImV4cCI6MjA5Mjk5Mzc5MX0.1VmiNcdBmk572lR5x5DdWBq_79XaF7YqOhvdF7LgL6E";
const supabase = createClient(supabaseUrl, supabaseKey);

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

app.get("/api/leads", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error("Error fetching leads from Supabase:", error);
    // Fallback to local file if Supabase fails
    const localData = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    res.json(localData);
  }
});

app.post("/api/leads", async (req, res) => {
  const newLead = req.body;
  
  // Map fields to Supabase schema
  const supabaseLead = {
    name: newLead.name,
    phone: newLead.phone,
    vehicle: newLead.vehicle,
    plate: newLead.plate,
    city: newLead.city,
    date: newLead.date,
    session_id: newLead.sessionId
  };

  try {
    const { error } = await supabase
      .from('leads')
      .upsert(supabaseLead, { onConflict: 'session_id' });
    
    if (error) throw error;
  } catch (error: any) {
    console.error("Error saving lead to Supabase:", error);
  }

  // Still save locally as a backup
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

app.delete("/api/leads", async (req, res) => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
    
    if (error) throw error;
  } catch (error: any) {
    console.error("Error deleting leads from Supabase:", error);
  }

  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
  res.json({ success: true });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  
  // Clean inputs
  const cleanEmail = (email || "").toString().trim().toLowerCase();
  const cleanPassword = (password || "").toString().trim();

  // Reference values
  const adminEmail = (process.env.ADMIN_EMAIL || "admincaio@prosul.com").toLowerCase().trim();
  const adminPassword = (process.env.ADMIN_PASSWORD || "Santacruz12.").trim();

  if (cleanEmail === adminEmail && cleanPassword === adminPassword) {
    res.json({ success: true, token: "admin-token-authenticated" });
  } else {
    // Keep old admin as fallback
    if (cleanEmail === "brtreino@gmail.com" && cleanPassword === "Escroto12.") {
      res.json({ success: true, token: "admin-token-legacy" });
    } else {
      res.status(401).json({ success: false, message: "Acesso negado. Verifique suas credenciais." });
    }
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
