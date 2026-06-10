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
  whatsapp: "5547989229588",
  whatsapp_options: ["5547989229588"],
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
  let localLeads: any[] = [];
  try {
    if (fs.existsSync(LEADS_FILE)) {
      localLeads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading local leads:", err);
  }

  try {
    const { data: supabaseLeads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn("Supabase fetch returned error (using local backup):", error.message);
      res.json(localLeads);
      return;
    }

    // Merge logic: merge supabaseLeads and localLeads by session_id/sessionId
    const mergedMap = new Map<string, any>();

    // First, load local leads as the baseline (contain accurate 'city', etc.)
    localLeads.forEach(lead => {
      const sId = lead.session_id || lead.sessionId;
      if (sId) {
        mergedMap.set(sId, lead);
      }
    });

    // Then, merge/update with any leads returned from Supabase
    if (Array.isArray(supabaseLeads)) {
      supabaseLeads.forEach(lead => {
        const sId = lead.session_id || lead.sessionId;
        if (sId) {
          const existing = mergedMap.get(sId);
          if (existing) {
            // Merge fields, preferring non-empty values
            mergedMap.set(sId, {
              ...existing,
              ...lead,
              // Retain values if they are present in existing but missing in Supabase due to schema
              city: existing.city || lead.city,
              date: existing.date || lead.date || lead.created_at,
            });
          } else {
            mergedMap.set(sId, lead);
          }
        }
      });
    }

    // Convert to sorted array (newest first)
    const mergedLeads = Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    res.json(mergedLeads);
  } catch (error: any) {
    console.error("Error fetching leads from Supabase:", error);
    res.json(localLeads);
  }
});

app.post("/api/leads", async (req, res) => {
  const newLead = req.body;
  const sId = newLead.sessionId || newLead.session_id;
  
  // Map fields to Supabase schema
  const supabaseLead: any = {
    name: newLead.name,
    phone: newLead.phone,
    vehicle: newLead.vehicle,
    plate: newLead.plate,
    city: newLead.city,
    date: newLead.date,
    session_id: sId
  };

  try {
    // Attempt standard upsert
    const { error } = await supabase
      .from('leads')
      .upsert(supabaseLead, { onConflict: 'session_id' });
    
    if (error) {
      const isMissingCity = error.code === 'PGRST204' || error.message?.includes('city');
      const isRLSViolation = error.code === '42501' || error.message?.includes('row-level security');

      if (isMissingCity) {
        console.warn("Supabase 'leads' is missing the 'city' column, retrying clean payload...");
        const { city, ...cleanLead } = supabaseLead;
        const retryResult = await supabase
          .from('leads')
          .upsert(cleanLead, { onConflict: 'session_id' });
        
        if (retryResult.error) {
          if (retryResult.error.code === '42501') {
            await supabase.from('leads').insert(cleanLead);
          } else {
            throw retryResult.error;
          }
        }
      } else if (isRLSViolation) {
        console.warn("Supabase RLS is targeting upsert, executing fall-back insert...");
        const insertResult = await supabase
          .from('leads')
          .insert(supabaseLead);
          
        if (insertResult.error) {
          if (insertResult.error.code === 'PGRST204' || insertResult.error.message?.includes('city')) {
            const { city, ...cleanLead } = supabaseLead;
            await supabase.from('leads').insert(cleanLead);
          } else {
            throw insertResult.error;
          }
        }
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.warn("Supabase sync issue (safely decoupled):", error.message || error);
  }

  // Always save locally as a guaranteed primary/backup store to leads.json
  let leads = [];
  try {
    if (fs.existsSync(LEADS_FILE)) {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading leads file:", e);
  }

  const existingLeadIndex = leads.findIndex((l: any) => {
    const itemSid = l.sessionId || l.session_id;
    return itemSid === sId;
  });

  const normalizedLead = {
    ...newLead,
    sessionId: sId,
    session_id: sId
  };

  if (existingLeadIndex >= 0) {
    leads[existingLeadIndex] = {
      ...leads[existingLeadIndex],
      ...normalizedLead
    };
  } else {
    leads.push(normalizedLead);
  }

  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (e) {
    console.error("Error writing leads file:", e);
  }
  
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
