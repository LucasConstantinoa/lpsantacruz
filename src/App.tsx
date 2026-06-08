import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { AppTooltip } from './components/AppTooltip';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import Lenis from 'lenis';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

import cleanCarImg from './assets/carro-novo.png';
import crashedCarImg from './assets/carro-batido.png';


import { 
  Shield, 
  Truck, 
  Key, 
  Clock, 
  Smartphone, 
  Briefcase, 
  Heart, 
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  MapPin,
  Menu,
  X,
  Star,
  ArrowRight,
  ChevronDown,
  Rocket,
  User,
  ShieldCheck,
  Flame, 
  CloudRain, 
  Map, 
  Car, 
  Users, 
  LayoutGrid, 
  Zap, 
  ShieldAlert,
  Instagram,
  Hash,
  Lock,
  Filter,
  Search,
  Trash2
} from 'lucide-react';

import susepLogo from './assets/susep_approved_seal_final_1780531757778.png';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const SparksBackground = () => {
  const [particles] = useState(() => 
    [...Array(10)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 40 + 30,
      delay: Math.random() * -40,
      moveX: (Math.random() - 0.5) * 400,
      moveY: (Math.random() - 0.5) * 400,
      opacity: Math.random() * 0.3 + 0.1
    }))
  );

  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 5000], [0, -400]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden ">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#236172]/30 to-[#236172]" />
      
      {/* Spark Particles */}
      <motion.div style={{ y: yParallax }} className="absolute inset-0">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#ffcc00] rounded-full "
            style={{ 
              left: `${p.left}%`, 
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity
            }}
            animate={{
              x: [0, p.moveX, 0],
              y: [0, p.moveY, 0],
              opacity: [p.opacity, p.opacity * 1.5, p.opacity],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </motion.div>

      {/* Large Blurred Orbs */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#ffcc00] rounded-full blur-[48px] opacity-10"
      />
      <div 
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-[#ffcc00] rounded-full blur-[48px] opacity-[0.05]"
      />
    </div>
  );
};

const AnimatedCheckmark = ({ size = 24 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      d="M20 6L9 17L4 12"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </svg>
);

const NavItem = ({ href, children, mobile, onClick, target }: { href: string; children: React.ReactNode; mobile?: boolean; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; target?: string; }) => (
  <motion.a
    href={href}
    onClick={onClick}
    target={target}
    rel={target === "_blank" ? "noopener noreferrer" : undefined}
    whileHover={mobile ? {} : { y: -2 }}
    whileTap={{ scale: 0.95 }}
    className={mobile 
      ? "text-3xl font-black text-white hover:text-[#ffcc00] transition-all tracking-tighter block py-2" 
      : "text-sm font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
    }
  >
    {children}
  </motion.a>
);

const ParallaxImage = ({ src, alt, className, speed = 0.2 }: { src: string; alt: string; className?: string; speed?: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Balance translation to range from -speed*50% to +speed*50% 
  // and scale the image appropriately so edges are never exposed.
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 50}%`, `${speed * 50}%`]);
  const requiredScale = 1 + Math.abs(speed);
  
  return (
    <div ref={ref} className={cn("overflow-hidden relative flex items-center justify-center ", className)}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale: requiredScale }}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-full h-full object-cover origin-center shadow-2xl "
      />
    </div>
  );
};

const BenefitCard = ({ icon: Icon, title, description, tooltip, delay = 0 }: { icon: any; title: string; description: string; tooltip: string; delay?: number }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.8 }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="prosul-card p-10 flex flex-col items-start gap-8 group cursor-default relative overflow-hidden "
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 blur-sm group-hover:blur-none">
        <Icon className="w-32 h-32" />
      </div>

      <div className="w-16 h-16 bg-[#ffcc00]/5 rounded-2xl flex items-center justify-center text-[#ffcc00] group-hover:scale-110 group-hover:bg-[#ffcc00] group-hover:text-[#236172] transition-all duration-700 shadow-inner">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      
      <div className="space-y-4 relative z-10 w-full">
        <h3 className="text-2xl font-black text-white group-hover:text-[#ffcc00] transition-colors tracking-tight">{title}</h3>
        <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/70 transition-colors font-light">{description}</p>
        
        {/* Animated Expanding Tooltip */}
        <AnimatePresence>
          {showTooltip && tooltip && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="bg-[#ffcc00]/10 border border-[#ffcc00]/20 rounded-xl p-4 text-[#ffcc00] text-xs font-medium italic">
                {tooltip}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden mt-auto">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "40%" }}
          transition={{ delay: delay + 0.5, duration: 1.5 }}
          className="h-full bg-[#ffcc00]/20 group-hover:bg-[#ffcc00] transition-colors duration-700"
        />
      </div>
    </motion.div>
  );
};

const StatItem = ({ value, suffix, label }: { value: string; suffix: string; label: string }) => (
  <div className="text-center px-6 py-4 group">
    <div className="text-6xl font-black text-white flex items-center justify-center tracking-tighter font-mono">
      <span className="group-hover:text-[#ffcc00] transition-colors duration-500">{value}</span>
      <span className="text-[#ffcc00]/40 group-hover:text-[#ffcc00] transition-colors duration-700 ml-1">{suffix}</span>
    </div>
    <div className="flex items-center justify-center gap-2 mt-4">
      <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-[#ffcc00]/50 transition-all duration-500" />
      <p className="text-[#ffcc00] text-[10px] sm:text-xs uppercase font-black tracking-[0.15em] sm:tracking-widest whitespace-nowrap">{label}</p>
      <div className="w-8 h-[1px] bg-white/10 group-hover:w-12 group-hover:bg-[#ffcc00]/50 transition-all duration-500" />
    </div>
  </div>
);

function ErrorPage({ code, title, message, btnText, btnLink }: { code: string, title: string, message: string, btnText: string, btnLink: string }) {
  return (
    <div className="min-h-screen bg-[#236172] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <SparksBackground />
      
      {/* Background Big Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <h1 className="text-[40vw] font-black text-white/[0.03] leading-none tracking-tighter mix-blend-overlay whitespace-nowrap select-none">
          {code}
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 max-w-2xl w-full flex flex-col items-center"
      >
        <div className="mb-8 group">
          <span className="text-2xl font-black text-white tracking-widest uppercase italic leading-none block">PROSUL<span className="text-[#ffcc00] text-xs align-top">®</span></span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-[#ffcc00] mb-2 tracking-tighter italic uppercase leading-none drop-shadow-[0_0_50px_rgba(255,204,0,0.2)]">
          Erro {code}
        </h1>
        
        <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-6 leading-tight italic">
          {title}
        </h2>

        <p className="text-white/50 mb-12 leading-relaxed text-base md:text-xl font-light px-4 max-w-lg">
          {message}
        </p>

        <motion.div
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
        >
          <Link 
            to={btnLink} 
            className="inline-block bg-[#ffcc00] text-[#236172] px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,204,0,0.2)] hover:shadow-[0_30px_60px_rgba(255,204,0,0.3)] hover:bg-[#f7d54d]"
          >
            {btnText}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

function NotFound() {
  return (
    <ErrorPage 
      code="404"
      title="Ops! Você desviou do caminho"
      message="A pagina não foi encontrada, mas a melhor proteção do sul do Brasil está logo aqui"
      btnText="Voltar para a Segurança"
      btnLink="/"
    />
  );
}

function TrabalheConoscoRedirect() {
  useEffect(() => {
    window.location.href = "https://trabalheprosulblumenau.vercel.app/";
  }, []);
  
  return (
    <div className="min-h-screen bg-[#236172] flex items-center justify-center text-white font-black italic tracking-tighter text-3xl">
      Redirecionando...
    </div>
  );
}

export default function App() {
  console.log("DEBUG: App rendering, current path:", window.location.pathname);
  return (
    <Routes>
      <Route path="/trabalheconosco" element={<TrabalheConoscoRedirect />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/400" element={<ErrorPage code="400" title="Sinalização Confusa" message="Não conseguimos processar sua solicitação. Parece que houve um erro na comunicação entre o seu navegador e nossos servidores." btnText="Voltar ao Início" btnLink="/" />} />
      <Route path="/401" element={<ErrorPage code="401" title="Acesso Restrito" message="Você precisa estar autorizado para acessar esta área. Por favor, realize o login para continuar." btnText="Ir para o Login" btnLink="/admin" />} />
      <Route path="/403" element={<ErrorPage code="403" title="Barreira de Proteção" message="Você não possui permissão para visualizar esta página. Esta é uma área restrita para associados autorizados." btnText="Voltar para a Segurança" btnLink="/" />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/500" element={<ErrorPage code="500" title="Imprevistos acontecem" message="Pedimos desculpas, mas tivemos uma pane seca em nossos servidores. Nossa equipe já está trabalhando para retomar a rota." btnText="Tentar novamente" btnLink="/" />} />

      <Route path="/errors/400" element={<ErrorPage code="400" title="Sinalização Confusa" message="Não conseguimos processar sua solicitação. Parece que houve um erro na comunicação entre o seu navegador e nossos servidores." btnText="Voltar ao Início" btnLink="/" />} />
      <Route path="/errors/401" element={<ErrorPage code="401" title="Acesso Restrito" message="Você precisa estar autorizado para acessar esta área. Por favor, realize o login para continuar." btnText="Ir para o Login" btnLink="/admin" />} />
      <Route path="/errors/403" element={<ErrorPage code="403" title="Barreira de Proteção" message="Você não possui permissão para visualizar esta página. Esta é uma área restrita para associados autorizados." btnText="Voltar para a Segurança" btnLink="/" />} />
      <Route path="/errors/500" element={<ErrorPage code="500" title="Imprevistos acontecem" message="Pedimos desculpas, mas tivemos uma pane seca em nossos servidores. Nossa equipe já está trabalhando para retomar a rota." btnText="Tentar novamente" btnLink="/" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (signInError) {
      setError(signInError.message);
    } else if (data.session) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#236172] flex items-center justify-center p-6">
      <SparksBackground />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md bg-[#2d7c91]/40 p-10 rounded-[40px] shadow-2xl border border-white/10"
      >
        <Link 
          to="/" 
          className="absolute top-8 right-8 text-white/20 hover:text-[#ffcc00] transition-colors"
        >
          <X size={24} />
        </Link>

        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-[#ffcc00] mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Admin <span className="text-[#ffcc00]">Prosul</span></h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffcc00]/60 ml-4">E-mail</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#236172] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#ffcc00]/50 outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffcc00]/60 ml-4">Senha</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#236172] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#ffcc00]/50 outline-none transition-all"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center font-bold px-4">{error}</p>}
          <button type="submit" className="btn-primary w-full py-6 shadow-2xl">Entrar no Painel</button>
        </form>
      </motion.div>
    </div>
  );
}

function AdminDashboard() {
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'leads' | 'users'>('leads');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'called' | 'not_called'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin');
        return;
      }
      loadConfig();
    };
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin');
      }
    });

    const loadConfig = async () => {
      const { data, error } = await supabase.from('config').select('*').eq('id', 1).single();
      if (data) {
        setConfig(data);
      } else {
        setConfig({ 
          id: 1,
          whatsapp: '5547989229588',
          benefits: [
            { id: '1', title: 'Assistência 24h', tooltip: 'Socorro elétrico, mecânico e reboque disponível 24 horas.' },
            { id: '2', title: 'Proteção contra Roubo', tooltip: 'Cobertura completa contra roubo e furto qualificado.' }
          ],
          cleanCarImg: '',
          crashedCarImg: '',
          google_sheets_url: '',
          google_sheets_active: false
        });
      }
    };

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const { data, error } = await supabase.from('leads').select('*').order('date', { ascending: false });
        if (data) setLeads(data);
      } catch (e) {}
    };
    loadLeads();

    const loadAdmins = async () => {
      const { data } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
      if (data) setAdmins(data);
    };
    loadAdmins();
    
    // Poll for changes in case Realtime is not enabled
    const intervalId = setInterval(() => {
      loadLeads();
      loadAdmins();
    }, 500);

    // Subscribe to changes in the 'leads' table
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        loadLeads();
      })
      .subscribe();

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAdmins(true);
    try {
      const { data, error } = await supabase.rpc('create_new_admin', {
        new_email: newAdminEmail,
        new_password: newAdminPassword
      });
      if (error) throw error;
      setNewAdminEmail('');
      setNewAdminPassword('');
      alert('Administrador criado com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar administrador: ' + err.message);
    }
    setLoadingAdmins(false);
  };

  const handleDeleteAdmin = async (email: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o acesso de ${email}?`)) return;
    try {
      const { error } = await supabase.rpc('delete_admin', { target_email: email });
      if (error) throw error;
      alert('Administrador removido com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao remover administrador: ' + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.from('config').upsert(config);
      if (error) {
          console.error("Supabase Error:", error);
          throw error;
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações.');
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'cleanCarImg' | 'crashedCarImg') => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${key}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('somente carro')
        .upload(filePath, file);

      if (uploadError) {
        alert('Erro ao fazer upload da imagem: ' + uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('somente carro')
        .getPublicUrl(filePath);

      setConfig({ ...config, [key]: publicUrl });
    }
  };

  const toggleCalled = async (leadId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ called: !currentStatus })
        .eq('id', leadId);
      
      if (error) throw error;
      // loadLeads() will be called by the interval or realtime channel
    } catch (err) {
      console.error("Error toggling called status:", err);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!leadId) {
      alert("Erro: ID do lead não encontrado.");
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja excluir este lead permanentemente?')) return;
    
    try {
      console.log("LOG: Deletando lead ID:", leadId);
      const { data, error, status } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)
        .select();
      
      if (error) {
        console.error("Supabase Error:", error);
        alert(`Erro do Banco: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        console.log("LOG: Lead excluído com sucesso do banco.");
        setLeads(prev => prev.filter(l => l.id !== leadId));
        alert("Lead excluído com sucesso!");
      } else {
        console.log("LOG: Nenhum lead foi excluído. Status:", status);
        alert("Aviso: O banco de dados não removeu nenhum registro. Verifique se você tem permissão (RLS).");
      }
    } catch (err: any) {
      console.error("LOG: Erro inesperado:", err);
      alert(`Erro inesperado: ${err.message}`);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesCity = !cityFilter || (lead.city && lead.city.toLowerCase().includes(cityFilter.toLowerCase()));
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'called' 
        ? lead.called 
        : !lead.called;
    return matchesCity && matchesStatus;
  });

  const uniqueCities = Array.from(new Set(leads.map(l => l.city).filter(Boolean))).sort();

  if (!config) return <div className="min-h-screen bg-[#236172] flex items-center justify-center text-white font-black italic tracking-tighter text-3xl">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[#236172] p-10 relative">
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            onClick={() => setSaveSuccess(false)}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-[#ffcc00] text-[#236172] px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl border-2 border-[#236172] cursor-pointer"
          >
            ✓ Configurações Salvas
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Dashboard <span className="text-[#ffcc00]">Elite</span></h2>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/admin'); }} className="text-white/40 hover:text-red-500 text-xs font-black uppercase tracking-widest transition-colors">Sair</button>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('config')}
            className={cn("px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all", activeTab === 'config' ? "bg-[#ffcc00] text-[#236172]" : "bg-[#2d7c91]/40 text-white")}
          >
            Configurações
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={cn("px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all", activeTab === 'leads' ? "bg-[#ffcc00] text-[#236172]" : "bg-[#2d7c91]/40 text-white")}
          >
            Leads ({leads.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={cn("px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all", activeTab === 'users' ? "bg-[#ffcc00] text-[#236172]" : "bg-[#2d7c91]/40 text-white")}
          >
            Usuários
          </button>
        </div>

        {activeTab === 'config' ? (
          <div className="prosul-card p-10 rounded-[40px] space-y-8 bg-[#2d7c91]/40">
            <div className="space-y-4">
              <h3 className="text-[#ffcc00] font-black uppercase tracking-widest text-sm">Geral e Imagens</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">WhatsApp (DDI + DDD + Numero)</label>
                <input 
                  type="text"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  className="w-full bg-[#236172] border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-[#ffcc00]/50 outline-none transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Carro Novo (Upload)</label>
                  <input type="file" onChange={(e) => handleImageUpload(e, 'cleanCarImg')} className="w-full bg-[#236172] border border-white/5 rounded-2xl py-4 px-6 text-white" />
                  {config.cleanCarImg && <img src={config.cleanCarImg} className="w-20 h-20 object-contain mt-2" alt="Preview"/>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Carro Batido (Upload)</label>
                  <input type="file" onChange={(e) => handleImageUpload(e, 'crashedCarImg')} className="w-full bg-[#236172] border border-white/5 rounded-2xl py-4 px-6 text-white" />
                  {config.crashedCarImg && <img src={config.crashedCarImg} className="w-20 h-20 object-contain mt-2" alt="Preview"/>}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-[#ffcc00] font-black uppercase tracking-widest text-sm">Integração Google Sheets</h3>
                <p className="text-[10px] text-white/30 italic">Envie os leads automaticamente para uma planilha externa.</p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#236172] p-6 rounded-3xl border border-white/5">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-2">Webhook URL (Google Apps Script)</label>
                    <input 
                      type="text"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={config.google_sheets_url || ''}
                      onChange={(e) => setConfig({ ...config, google_sheets_url: e.target.value })}
                      className="w-full bg-[#2d7c91]/40 border border-white/5 rounded-xl py-3 px-4 text-white text-xs outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2 sm:pt-0">
                    <span className="text-[10px] font-black uppercase text-white/40">Status:</span>
                    <button 
                      onClick={() => setConfig({ ...config, google_sheets_active: !config.google_sheets_active })}
                      className={cn("w-12 h-6 rounded-full transition-all relative", config.google_sheets_active ? "bg-[#25D366]" : "bg-white/10")}
                    >
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full shadow-md bg-white transition-all", config.google_sheets_active ? "left-7" : "left-1")} />
                    </button>
                    <span className="text-[10px] font-black uppercase text-white/40">{config.google_sheets_active ? 'ATIVO' : 'INATIVO'}</span>
                  </div>
                </div>
                
                <div className="p-6 bg-white/5 rounded-3xl text-[10px] text-white/50 space-y-3 leading-relaxed border border-white/5">
                  <p className="font-black text-[#ffcc00] uppercase tracking-widest">Guia de Configuração:</p>
                  <ol className="list-decimal ml-4 space-y-2">
                    <li>Crie uma Planilha no Google Sheets.</li>
                    <li>Vá em <strong>Extensões</strong> {'>'} <strong>Apps Script</strong>.</li>
                    <li>Apague tudo lá e cole este código (ele evita duplicados): 
                      <pre className="bg-black/40 p-3 rounded-xl text-[#ffcc00] my-2 overflow-x-auto whitespace-pre-wrap font-mono text-[10px]">
{`function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];
  var data = JSON.parse(e.postData.contents);
  var values = sheet.getDataRange().getValues();
  var rowIdx = -1;
  for(var i=0; i<values.length; i++) {
    if(values[i][6] == data.session_id) { rowIdx = i + 1; break; }
  }
  var rowData = [new Date(), data.name, data.phone, data.vehicle, data.plate, data.city, data.session_id];
  if(rowIdx > 0) {
    sheet.getRange(rowIdx, 1, 1, 7).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return ContentService.createTextOutput("Success");
}`}
                      </pre>
                    </li>
                    <li>Clique em <strong>Implantar</strong> {'>'} <strong>Nova Implantação</strong>.</li>
                    <li>Selecione "App da Web", coloque uma descrição, mude "Quem pode acessar" para <strong>"Qualquer Pessoa"</strong> e Implante.</li>
                    <li>Copie a URL e cole acima.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#ffcc00] font-black uppercase tracking-widest text-sm">Benefícios & Tooltips</h3>
              {Array.isArray(config?.benefits) && config.benefits.map((benefit: any, index: number) => (
                <div key={benefit.id} className="p-6 bg-[#236172] rounded-3xl border border-white/5 space-y-4">
                  <p className="text-[10px] font-black text-[#ffcc00] uppercase tracking-widest">ID: {benefit.id}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-2">Título</label>
                      <input 
                        type="text"
                        value={benefit.title}
                        onChange={(e) => {
                          const newBenefits = [...config.benefits];
                          newBenefits[index].title = e.target.value;
                          setConfig({ ...config, benefits: newBenefits });
                        }}
                        className="w-full bg-[#2d7c91]/40 border border-white/5 rounded-xl py-3 px-4 text-white text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-white/20 ml-2">Mensagem do Tooltip</label>
                      <textarea 
                        value={benefit.tooltip}
                        onChange={(e) => {
                          const newBenefits = [...config.benefits];
                          newBenefits[index].tooltip = e.target.value;
                          setConfig({ ...config, benefits: newBenefits });
                        }}
                        className="w-full bg-[#2d7c91]/40 border border-white/5 rounded-xl py-3 px-4 text-white text-sm outline-none h-20 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              disabled={saving}
              onClick={handleSave}
              className="btn-primary w-full py-6 shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? 'Gravando...' : 'Salvar Alterações'}
            </button>
          </div>
        ) : activeTab === 'leads' ? (
          <div className="prosul-card p-10 rounded-[40px] space-y-8 bg-[#2d7c91]/40">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <h3 className="text-[#ffcc00] font-black uppercase tracking-widest text-sm flex items-center gap-2 text-white">
                <Users size={18} /> Leads Capturados ({filteredLeads.length})
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                {/* City Filter */}
                <div className="relative flex-1 md:flex-none min-w-[150px]">
                  <Filter size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <select 
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full bg-[#236172] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-white text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-[#236172]/80 transition-all"
                  >
                    <option value="">Todas as Cidades</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex bg-[#236172] p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'all' ? "bg-[#ffcc00] text-[#236172]" : "text-white/40 hover:text-white")}
                  >
                    Todos
                  </button>
                  <button 
                    onClick={() => setStatusFilter('not_called')}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'not_called' ? "bg-red-500 text-white" : "text-white/40 hover:text-white")}
                  >
                    Pendentes
                  </button>
                  <button 
                    onClick={() => setStatusFilter('called')}
                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'called' ? "bg-green-500 text-white" : "text-white/40 hover:text-white")}
                  >
                    Chamados
                  </button>
                </div>

                <button 
                  onClick={async () => {
                    if(window.confirm('Apagar todos os leads?')) {
                      await supabase.from('leads').delete().not('id', 'is', null);
                      setLeads([]);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-widest transition-colors ml-auto md:ml-0"
                >
                  Limpar Todos
                </button>
              </div>
            </div>

              {filteredLeads.length === 0 ? (
                <div className="p-10 border border-dashed border-white/20 rounded-3xl text-center text-white/50 font-light italic">
                  Nenhum lead corresponde aos filtros selecionados.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead, idx) => (
                    <div key={idx} className={cn("bg-[#236172] border rounded-2xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center transition-all", lead.called ? "border-green-500/30 opacity-60" : "border-white/5")}>
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <button 
                          onClick={() => toggleCalled(lead.id, lead.called)}
                          className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all shrink-0", lead.called ? "bg-green-500 border-green-400 text-white" : "bg-white/5 border-white/10 text-white/20 hover:border-[#ffcc00]/50 hover:text-[#ffcc00]")}
                          title={lead.called ? "Marcado como chamado" : "Marcar como chamado"}
                        >
                          <PhoneCall size={18} />
                        </button>
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-white font-black text-lg">{lead.name || 'Sem nome (Digitando...)'}</h4>
                            {lead.called && <span className="bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-500/20">Chamado</span>}
                          </div>
                          <p className="text-white/50 text-sm">{lead.phone || 'Sem telefone'}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                            {lead.city && (
                              <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><MapPin size={10} className="text-[#ffcc00]" /> {lead.city}</p>
                            )}
                            {lead.vehicle && (
                              <p className="text-[#ffcc00] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Car size={10} /> {lead.vehicle}</p>
                            )}
                            {lead.plate && (
                              <p className="text-[#ffcc00] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Hash size={10} /> {lead.plate}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-end items-center md:items-end gap-4">
                        <p className="text-white/30 text-[10px] font-mono">
                           {new Date(lead.date).toLocaleString('pt-BR')}
                        </p>
                        <div className="flex gap-2">
                           {lead.phone && lead.phone.replace(/\D/g,'').length >= 10 ? (
                            <a 
                              href={`https://wa.me/${lead.phone.replace(/\D/g,'').startsWith('55') ? lead.phone.replace(/\D/g,'') : '55' + lead.phone.replace(/\D/g,'')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => !lead.called && toggleCalled(lead.id, false)}
                              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-[#25D366]/20"
                            >
                              WhatsApp <ArrowRight size={14} />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 bg-white/10 text-white/30 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                              WhatsApp <ArrowRight size={14} />
                            </span>
                          )}

                          <button 
                            onClick={() => {
                              console.log("Delete button clicked for lead:", lead);
                              deleteLead(lead.id);
                            }}
                            className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all border border-red-500/20"
                            title="Excluir Lead"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ) : (
          <div className="prosul-card p-10 rounded-[40px] space-y-8 bg-[#2d7c91]/40">
            <div className="flex justify-between items-center">
              <h3 className="text-[#ffcc00] font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <Users size={18} /> Administradores do Sistema ({admins.length})
              </h3>
            </div>

            <div className="bg-[#236172] border border-white/5 rounded-2xl p-6">
              <h4 className="text-white font-black text-lg mb-4">Adicionar Novo Administrador</h4>
              <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  required
                  placeholder="Email"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-white focus:bg-white/[0.07] outline-none"
                />
                <input 
                  type="password" 
                  required
                  placeholder="Senha"
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl py-3 px-4 text-white focus:bg-white/[0.07] outline-none"
                />
                <button 
                  type="submit"
                  disabled={loadingAdmins}
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50"
                >
                  {loadingAdmins ? 'Criando...' : 'Adicionar'}
                </button>
              </form>
            </div>

            {admins.length === 0 ? (
              <div className="bg-[#236172] border border-white/5 rounded-2xl p-6 text-white/50 text-center text-sm font-bold uppercase tracking-widest">
                Nenhum administrador encontrado (você deve criar a tabela primeiro).
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin, idx) => (
                  <div key={idx} className="bg-[#236172] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div>
                      <h4 className="text-white font-black text-lg">{admin.email}</h4>
                      <p className="text-white/30 text-[10px] font-mono mt-1">
                        Criado em: {new Date(admin.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleDeleteAdmin(admin.email)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-white/10 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left group"
      >
        <span className="text-lg lg:text-xl font-bold text-white group-hover:text-[#ffcc00] transition-colors">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#ffcc00] shrink-0 ml-4 group-hover:scale-110 transition-transform"
        >
          <X className={`w-5 h-5 ${isOpen ? 'rotate-90' : 'rotate-45'}`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-white/50 text-basis leading-relaxed max-w-3xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SafetyComparisonSection = ({ cleanImg, crashedImg }: { cleanImg: string, crashedImg: string }) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Base parallax transforms
  const carYBase = useTransform(scrollYProgress, [0, 1], [-100, 100]);
  const scaleBase = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0.85, 1, 0.85]);
  
  // Smooth spring physics for fluid motion
  const springConfig = { stiffness: 60, damping: 20 };
  const carY = useSpring(carYBase, springConfig);
  const carScale = useSpring(scaleBase, springConfig);

  // Adjust mapping bounds explicitly so the swap happens when section is centered
  const cleanOpacity = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]);
  const crashOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);

  const topTextOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.8, 1], [0, 1, 1, 0]);
  const bottomTextOpacity = useTransform(scrollYProgress, [0.15, 0.35, 0.8, 1], [0, 1, 1, 0]);

  const topTextYBase = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const bottomTextYBase = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const topTextY = useSpring(topTextYBase, springConfig);
  const bottomTextY = useSpring(bottomTextYBase, springConfig);

  useGSAP(() => {
    // Entrance Animation
    gsap.fromTo('.gsap-car-container', {
      x: 300,
      opacity: 0,
      rotation: 5
    }, {
      x: 0,
      opacity: 1,
      rotation: 0,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse"
      }
    });

    // Continuous float animation
    gsap.to('.gsap-car-float', {
      y: -15,
      rotation: 1,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 lg:py-48 bg-gradient-to-b from-transparent via-[#2d7c91]/80 to-transparent relative z-30 w-full overflow-hidden">
      <div className="container-prosul flex flex-col items-center">
        
        {/* Top Text Content */}
        <motion.div 
          style={{ opacity: topTextOpacity, y: topTextY }}
          className="mb-4 md:mb-10 text-center max-w-4xl px-6 flex flex-col items-center"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter italic mb-8">
            Não espere ser <span className="text-[#ffcc00]">tarde demais...</span>
          </h2>
          
          {/* Status Badges with Parallax */}
          <div className="relative z-40 h-10 flex items-center justify-center">
            <motion.div 
              style={{ opacity: cleanOpacity }}
              className="absolute bg-[#ffcc00] text-[#236172] px-6 sm:px-10 py-3 rounded-full font-black text-[10px] sm:text-[14px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,204,0,0.6)] border border-[#ffcc00]/50 whitespace-nowrap min-w-[240px] sm:min-w-[300px] text-center"
            >
              Proteção a partir de R$ 79,90
            </motion.div>
            <motion.div 
              style={{ opacity: crashOpacity }}
              className="absolute bg-white/10 backdrop-blur-md text-white/50 px-6 sm:px-10 py-3 rounded-full font-black text-[9px] sm:text-[12px] uppercase tracking-[0.2em] border border-white/10 whitespace-nowrap min-w-[240px] sm:min-w-[300px] text-center"
            >
              O Custo do Imprevisto
            </motion.div>
          </div>
        </motion.div>

        {/* Car Display Container */}
        <div className="relative w-full max-w-5xl aspect-[16/9] min-h-[250px] md:min-h-[550px] ">
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none gsap-car-container">
            <div className="w-full h-full gsap-car-float flex items-center justify-center">
              <motion.div 
                style={{ y: carY, scale: carScale }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* IMG1: Clean Car (Initially Visible) */}
                <motion.img 
                  style={{ opacity: cleanOpacity }}
                  src={cleanImg}
                  alt="Veículo Novo"
                  className="absolute w-[90%] md:w-[80%] h-auto max-h-[90%] md:max-h-[80%] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-transform duration-300"
                />
                {/* IMG2: Crashed Car (Visible on Scroll) */}
                <motion.img 
                  style={{ opacity: crashOpacity }}
                  src={crashedImg}
                  alt="Veículo Sinistrado"
                  className="absolute w-[90%] md:w-[80%] h-auto max-h-[90%] md:max-h-[80%] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-transform duration-300 scale-[1.15] md:scale-[1.18]"
                />
              </motion.div>
            </div>
          </div>

          {/* Label below the car - specifically for the crash state */}
          <div className="absolute bottom-4 md:bottom-20 w-full flex justify-center pointer-events-none">
             <motion.div
               style={{ opacity: crashOpacity, scale: useTransform(scrollYProgress, [0.4, 0.5], [0.8, 1]) }}
               className="bg-red-600 text-white px-6 sm:px-10 py-3 rounded-full font-black text-xs sm:text-sm md:text-xl shadow-[0_0_40px_rgba(220,38,38,0.7)] border border-red-500 uppercase tracking-tighter min-w-[240px] sm:min-w-[300px] text-center"
             >
               Prejuízo de R$ 43.000,00
             </motion.div>
          </div>
        </div>

        {/* Bottom Text Content */}
        <motion.div 
          style={{ opacity: bottomTextOpacity, y: bottomTextY }}
          className="mt-4 md:mt-10 text-center max-w-4xl px-6 flex flex-col items-center"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 italic">
            para fazer a sua <span className="text-[#ffcc00] underline decoration-[#ffcc00]/20 underline-offset-8">proteção.</span>
          </h2>
          <p className="text-white/40 text-base md:text-2xl font-light italic max-w-2xl mx-auto leading-relaxed border-l-2 md:border-l-0 md:border-t-2 border-[#ffcc00]/20 pl-6 md:pl-0 md:pt-8 text-left md:text-center">
            "Acidentes não marcam hora. Ter a tranquilidade de estar protegido faz toda a diferença quando o inesperado acontece. Decida pela sua paz hoje."
          </p>
        </motion.div>

      </div>
    </section>
  );
};

function LandingPage() {
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const loadingMessages = [
    "Consultando tabela FIPE...",
    "Analisando perfil do veículo...",
    "Calculando cobertura ideal..."
  ];
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '', plate: '', city: '' });
  const [leadId, setLeadId] = useState<string | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 9));
  const [config, setConfig] = useState<any>(null);
  const [cleanCarImgUrl, setCleanCarImgUrl] = useState<string>(cleanCarImg);
  const [crashedCarImgUrl, setCrashedCarImgUrl] = useState<string>(crashedCarImg);
  const lenisRef = useRef<Lenis | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo('.gsap-hero-anim', {
      opacity: 0,
      y: 80,
      filter: 'blur(20px)'
    }, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.5,
      stagger: 0.2,
      ease: 'power4.out',
      delay: 0.2
    });

    const sections = gsap.utils.toArray('.gsap-section');
    sections.forEach((section: any) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 100 }, 
        {
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    gsap.fromTo('.gsap-benefit-card', 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.gsap-benefits-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );

    gsap.fromTo('.gsap-faq-item', 
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.gsap-faq-grid',
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, { scope: pageRef });

  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase.from('config').select('*').eq('id', 1).single();
      if (data) {
        console.log("DEBUG: Config fetched:", data);
        setConfig(data);
        if (data.cleanCarImg) {
            console.log("DEBUG: Setting cleanCarImgUrl:", data.cleanCarImg);
            setCleanCarImgUrl(data.cleanCarImg);
        }
        if (data.crashedCarImg) {
            console.log("DEBUG: Setting crashedCarImgUrl:", data.crashedCarImg);
            setCrashedCarImgUrl(data.crashedCarImg);
        }
      }
    };
    fetchConfig();

    const localConfig = localStorage.getItem('prosul-config');
    if (localConfig) {
      try {
        const parsed = JSON.parse(localConfig);
        setConfig(parsed);
        if (parsed.cleanCarImg) setCleanCarImgUrl(parsed.cleanCarImg);
        if (parsed.crashedCarImg) setCrashedCarImgUrl(parsed.crashedCarImg);
      } catch (e) {
        setConfig(null);
      }
    }
    
    // Initialize Lenis...
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Check cookie consent
    const consent = localStorage.getItem('prosul-cookie-consent');
    if (!consent) {
      setShowCookieBanner(true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
    };
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    lenisRef.current?.scrollTo(id, {
      offset: -100,
      duration: 1.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  };

  useEffect(() => {
    if (formData.name || formData.phone || formData.vehicle || formData.plate || formData.city) {
      const timeoutId = setTimeout(() => {
        console.log("DEBUG: Upserting lead to Supabase:", formData);
        const currentLead = {
          name: formData.name,
          phone: formData.phone,
          vehicle: formData.vehicle,
          plate: formData.plate,
          city: formData.city,
          date: new Date().toISOString(),
          session_id: sessionId
        };

        supabase
          .from('leads')
          .upsert(currentLead, { onConflict: 'session_id' })
          .then(({ data, error }) => {
            if (error) {
              console.error("DEBUG: Upsert error:", error);
            } else {
              console.log("DEBUG: Upsert success, data:", data);
            }
          })
          .catch(e => console.error("DEBUG: Upsert catch:", e));
      }, 50); // Gravar instantaneamente
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, sessionId]);

  useEffect(() => {
    if (config?.google_sheets_active && config?.google_sheets_url && (formData.name || formData.phone || formData.vehicle || formData.plate || formData.city)) {
      const timeoutId = setTimeout(() => {
        fetch(config.google_sheets_url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, session_id: sessionId })
        }).catch(() => {});
      }, 5000); // 5 seconds debounce for sheets
      return () => clearTimeout(timeoutId);
    }
  }, [formData, config?.google_sheets_url, config?.google_sheets_active, sessionId]);

  useEffect(() => {
    if (leadStatus === 'loading') {
      let msgIndex = 0;
      setLoadingMsgIdx(0);
      const interval = setInterval(() => {
        msgIndex++;
        if (msgIndex < loadingMessages.length) {
          setLoadingMsgIdx(msgIndex);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [leadStatus]);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadStatus('loading');
    setModalOpen(true);
    
    // Wait 3 seconds simulating query before showing success blur card
    setTimeout(() => {
      setLeadStatus('success');
      
      // Enviar versão final para Google Sheets
      if (config?.google_sheets_active && config?.google_sheets_url) {
        fetch(config.google_sheets_url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            session_id: sessionId,
            status: 'final'
          })
        }).catch(() => {});
      }
    }, 3000);
  };

  const openModal = () => {
    setModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('prosul-cookie-consent', 'true');
    setShowCookieBanner(false);
  };

  const whatsapp = config?.whatsapp || "5551981853517";

  return (
    <div className="min-h-screen bg-[#236172] selection:bg-[#ffcc00] selection:text-[#236172] overflow-x-hidden relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#ffcc00] origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />
      <SparksBackground />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-50 flex flex-col gap-4 md:gap-6 items-end justify-end pointer-events-none">
        <motion.div
          className="icon-3d icon-ig pointer-events-auto group relative cursor-pointer"
          tabIndex={0}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, type: "spring" }}
        >
          <div className="layer-3d">
            <span />
            <span />
            <span />
            <span />
            <span>
              <Instagram className="text-white w-6 h-6 md:w-7 md:h-7" />
            </span>
          </div>
          
          <div className="absolute right-full mr-5 bottom-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all duration-300 flex flex-col bg-gradient-to-br from-[#E1306C]/10 to-[#833AB4]/10 backdrop-blur-md border border-[#E1306C]/20 rounded-xl shadow-[0_0_20px_rgba(225,48,108,0.2)] overflow-hidden pointer-events-auto min-w-[140px] z-50 max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-2 bg-[#E1306C]/20 text-[9px] font-black text-white/80 uppercase tracking-[0.2em] border-b border-[#E1306C]/20 text-center">INSTAGRAM</div>
            <a href="https://www.instagram.com/prosul.venancioaires/" target="_blank" rel="noreferrer" className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:text-white hover:bg-[#E1306C]/40 transition-colors text-center flex items-center justify-center gap-2 block w-full"><Instagram size={12}/> Venâncio Aires</a>
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${isScrolled ? 'bg-[#236172] py-4 shadow-2xl' : 'bg-transparent py-8'}`}
      >
        {/* Brand/Logo */}
        <div className="container-prosul flex items-center justify-between">
          <Link to="/admin" className="flex flex-col items-start leading-none group cursor-pointer">
            <span className="text-3xl font-black tracking-tight text-white flex items-center gap-1 group-hover:text-[#ffcc00] transition-colors">
              PROSUL<span className="text-[#ffcc00] text-[0.4em] align-top"></span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.4em] text-white/70 uppercase mt-1">Proteção Veicular</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            <NavItem href="#beneficios" onClick={(e) => scrollToSection(e, '#beneficios')}>Benefícios</NavItem>
            
            <div className="relative group py-4">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                Localização <ChevronDown size={14} className="group-hover:rotate-180 transition-transform"/>
              </span>
              <div className="absolute top-full left-0 mt-0 w-48 bg-[#236172] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden">
                <a href="https://www.google.com/maps?vet=10CAAQoqAOahcKEwiQubGo-PWUAxUAAAAAHQAAAAAQGg..i&rlz=1C1VDKB_enBR1207BR1207&sca_esv=47b14df0f15d899c&pvq=Cg0vZy8xMXE0MDE1bnh5&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=br&sa=X&geocode=KcPkPLgaoxyVMUSiMHie3rXe&daddr=R.+Gaspar+Silveira+Martins,+2159+-+Margarida,+Santa+Cruz+do+Sul+-+RS,+96825-145" target="_blank" rel="noreferrer" className="px-4 py-3 text-xs font-black uppercase tracking-widest text-white/50 hover:text-[#ffcc00] hover:bg-white/5 transition-colors">Santa Cruz</a>
              </div>
            </div>

            <NavItem href={`https://wa.me/${whatsapp}`} target="_blank">Contato</NavItem>
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/admin" className="text-xs font-black text-white/50 hover:text-[#ffcc00] transition-colors uppercase tracking-[0.2em]">Painel</Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModal}
              className="btn-primary py-3 px-8"
            >
              Cotação Imediata
            </motion.button>
          </div>

          <button 
            className="lg:hidden text-white w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu - Enhanced Slide-in Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-[#2d7c91]/95 lg:hidden pointer-events-auto"
            />
            
            <motion.div
              initial={{ x: "100%", skewX: 8, scale: 0.95, opacity: 0 }}
              animate={{ x: 0, skewX: 0, scale: 1, opacity: 1 }}
              exit={{ x: "100%", skewX: -8, scale: 0.95, opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 32, 
                stiffness: 280,
                mass: 1
              }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-sm bg-[#236172] shadow-[-30px_0_60px_rgba(0,0,0,0.8)] p-10 flex flex-col lg:hidden border-l border-white/5 overflow-hidden origin-right"
            >
              {/* Subtle Parallax Background directly applied to the drawer interior */}
              <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
                <motion.img
                  src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800"
                  alt="Background Texture"
                  className="w-full h-full object-cover opacity-[0.06] grayscale mix-blend-overlay"
                  initial={{ scale: 1.2, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 1.2, x: 20 }}
                  transition={{ type: "spring", damping: 30, stiffness: 100 }}
                />
              </div>

              <div className="flex justify-between items-center mb-16 relative z-10">
                <Link to="/admin" className="flex flex-col items-start leading-none" onClick={() => setMobileMenuOpen(false)}>
                  <span className="text-2xl font-black text-white tracking-tighter">PROSUL<span className="text-[#ffcc00] text-[0.4em] align-top"></span></span>
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-[#ffcc00]/50 mt-1">Elite Protection</span>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-white/40 hover:text-[#ffcc00] transition-all hover:scale-110 active:scale-95 border border-white/10"
                >
                  <X size={24}/>
                </button>
              </div>
              
              <motion.div 
                className="flex flex-col gap-6 mb-auto text-left relative z-10"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
                  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                }}
              >
                {[
                  { label: 'Vantagens', id: '#beneficios' },
                  { label: 'Localização (Santa Cruz)', id: 'https://www.google.com/maps?vet=10CAAQoqAOahcKEwiQubGo-PWUAxUAAAAAHQAAAAAQGg..i&rlz=1C1VDKB_enBR1207BR1207&sca_esv=47b14df0f15d899c&pvq=Cg0vZy8xMXE0MDE1bnh5&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=br&sa=X&geocode=KcPkPLgaoxyVMUSiMHie3rXe&daddr=R.+Gaspar+Silveira+Martins,+2159+-+Margarida,+Santa+Cruz+do+Sul+-+RS,+96825-145', external: true },
                  { label: 'Contato', id: `https://wa.me/${whatsapp}`, external: true },
                ].map((item, idx) => (
                  <motion.div key={idx} variants={{
                    open: { opacity: 1, x: 0, scale: 1, rotate: 0 },
                    closed: { opacity: 0, x: 40, scale: 0.9, rotate: 2 }
                  }}>
                    <NavItem 
                      mobile 
                      href={item.id} 
                      target={item.external ? "_blank" : undefined}
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        if (!item.external) {
                          scrollToSection(e, item.id);
                        }
                      }}
                    >
                      {item.label}
                    </NavItem>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="pt-10 border-t border-white/5 relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openModal}
                  className="btn-primary w-full py-6 flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(255,204,0,0.2)]"
                >
                  Proteger meu Carro 
                  <ArrowRight size={18} />
                </motion.button>
                <div className="flex justify-center gap-4 mt-8 opacity-20">
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
                <p className="text-[10px] text-center text-white/20 mt-6 font-black uppercase tracking-[0.3em]">Atendimento VIP 24h</p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 overflow-y-auto pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => leadStatus === 'idle' && setModalOpen(false)}
              className="fixed inset-0 bg-black/90"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
              className="relative z-[90] w-full max-w-lg max-h-[90vh] flex flex-col bg-[#2d7c91]/40 rounded-[30px] sm:rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden  "
            >
              {/* Decorative Header Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-50 shrink-0" />
              
              <button 
                onClick={() => setModalOpen(false)} 
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/40 hover:text-[#ffcc00] hover:rotate-90 transition-all duration-500 z-50 p-2 sm:p-0 bg-[#1a4a58]/80 sm:bg-transparent rounded-full backdrop-blur-md"
              >
                <X size={20} />
              </button>

              <div className="p-5 sm:p-10 overflow-y-auto flex-1 no-scrollbar">
                {leadStatus === 'loading' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 flex flex-col items-center text-center justify-center min-h-[300px]"
                  >
                    <svg className="animate-spin h-20 w-20 text-[#ffcc00] mb-8" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <motion.p 
                      key={loadingMsgIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white text-base font-black uppercase tracking-widest italic"
                    >
                      {loadingMessages[loadingMsgIdx]}
                    </motion.p>
                    <div className="mt-8 text-[48px] font-black text-[#ffcc00] italic leading-none">
                      {Math.round(((loadingMsgIdx + 1) / loadingMessages.length) * 100)}%
                    </div>
                  </motion.div>
                )}

                {leadStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="py-6 flex flex-col items-center text-center"
                  >
                    <div className="relative mb-8 w-full max-w-sm">
                      <div className="bg-white/5 border border-white/10 rounded-[30px] p-8 sm:p-10 relative overflow-hidden shadow-2xl flex flex-col items-center">
                         <div className="w-16 h-16 rounded-full bg-[#ffcc00]/10 flex items-center justify-center mb-6 border border-[#ffcc00]/20">
                            <Lock className="text-[#ffcc00] w-8 h-8" />
                         </div>
                         <h4 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">Cotação Concluída</h4>
                         <p className="text-sm font-light text-white/50 mb-6 px-4">O valor ideal para o seu perfil foi calculado com sucesso.</p>
                         
                         <div className="relative w-full max-w-[200px] mx-auto">
                            <div className="filter blur-[12px] opacity-40 text-4xl font-black text-center text-white select-none whitespace-nowrap">
                              R$ 149,90
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-black text-[#ffcc00] uppercase tracking-widest shadow-2xl bg-[#236172]/80 px-4 py-2 rounded-xl backdrop-blur-sm border border-[#ffcc00]/30 shadow-[0_0_20px_rgba(255,204,0,0.2)]">
                                Bloqueado
                              </span>
                            </div>
                         </div>
                      </div>
                    </div>
                    
                    <p className="text-white/60 mb-8 max-w-sm leading-relaxed text-sm italic">
                      Tabela completa encontrada. Para descobrir a cotação exata e as condições exclusivas, fale direto com seu consultor.
                    </p>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const message = `Olá! Sou ${formData.name}. Gostaria de ver o valor da cotação para o meu perfil.${formData.vehicle ? ` Carro: ${formData.vehicle},` : ''} Meu contato é ${formData.phone}`;
                        const encoded = encodeURIComponent(message);
                        const whatsappNumber = config?.whatsapp || "5547989229588";
                        window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
                        setModalOpen(false);
                        setTimeout(() => setLeadStatus('idle'), 500);
                        setFormData({ name: '', phone: '', vehicle: '', plate: '', city: '' });
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-5 rounded-2xl shadow-[0_15px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_20px_40px_rgba(37,211,102,0.4)] flex items-center justify-center gap-3 transition-colors text-sm sm:text-base uppercase tracking-widest"
                    >
                      REALIZAR COTAÇÃO <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                )}

                {leadStatus === 'idle' && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-[#ffcc00]/80 mb-6 focus-within:animate-pulse">
                        <ShieldCheck size={10} /> Ativação Imediata
                      </div>
                      <h3 className="text-4xl sm:text-5xl font-black text-white mb-2 sm:mb-4 tracking-tighter uppercase leading-[0.95] italic">
                        Cotação <br/><span className="text-[#ffcc00] underline decoration-[#ffcc00]/20 underline-offset-8">Personalizada</span>
                      </h3>
                      <p className="text-white/30 text-xs sm:text-sm font-light max-w-xs mx-auto">Experiência simplificada para quem exige o melhor em proteção.</p>
                    </div>

                    <form onSubmit={handleModalSubmit} className="space-y-4">
                      <div className="grid gap-3 sm:gap-4">
                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            id="lead-name"
                            placeholder=" "
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="peer w-full bg-white/[0.08] border border-white/20 rounded-2xl pt-7 pb-3 px-6 text-white font-medium focus:bg-white/[0.12] focus:border-[#ffcc00]/60 outline-none transition-all duration-300 shadow-inner"
                          />
                          <label htmlFor="lead-name" className="absolute left-6 top-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 transition-all duration-200 peer-focus:-translate-y-3 peer-focus:text-[9px] peer-focus:tracking-[0.3em] peer-focus:text-[#ffcc00] peer-valid:-translate-y-3 peer-valid:text-[9px] peer-valid:tracking-[0.3em] peer-valid:text-white/80 pointer-events-none">
                            <User size={10} className="text-[#ffcc00] opacity-0 peer-focus:opacity-100 peer-valid:opacity-100 transition-opacity duration-300" /> Nome
                          </label>
                        </div>

                        <div className="relative">
                          <input 
                            required
                            type="tel" 
                            id="lead-phone"
                            placeholder=" "
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="peer w-full bg-white/[0.08] border border-white/20 rounded-2xl pt-7 pb-3 px-6 text-white font-medium focus:bg-white/[0.12] focus:border-[#ffcc00]/60 outline-none transition-all duration-300 shadow-inner"
                          />
                          <label htmlFor="lead-phone" className="absolute left-6 top-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 transition-all duration-200 peer-focus:-translate-y-3 peer-focus:text-[9px] peer-focus:tracking-[0.3em] peer-focus:text-[#ffcc00] peer-valid:-translate-y-3 peer-valid:text-[9px] peer-valid:tracking-[0.3em] peer-valid:text-white/80 pointer-events-none">
                            <Smartphone size={10} className="text-[#ffcc00] opacity-0 peer-focus:opacity-100 peer-valid:opacity-100 transition-opacity duration-300" /> Telefone
                          </label>
                        </div>

                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            id="lead-city"
                            placeholder=" "
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="peer w-full bg-white/[0.08] border border-white/20 rounded-2xl pt-7 pb-3 px-6 text-white font-medium focus:bg-white/[0.12] focus:border-[#ffcc00]/60 outline-none transition-all duration-300 shadow-inner"
                          />
                          <label htmlFor="lead-city" className="absolute left-6 top-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 transition-all duration-200 peer-focus:-translate-y-3 peer-focus:text-[9px] peer-focus:tracking-[0.3em] peer-focus:text-[#ffcc00] peer-valid:-translate-y-3 peer-valid:text-[9px] peer-valid:tracking-[0.3em] peer-valid:text-white/80 pointer-events-none">
                            <MapPin size={10} className="text-[#ffcc00] opacity-0 peer-focus:opacity-100 peer-valid:opacity-100 transition-opacity duration-300" /> Cidade
                          </label>
                        </div>

                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            id="lead-vehicle"
                            placeholder=" "
                            value={formData.vehicle}
                            onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                            className="peer w-full bg-white/[0.08] border border-white/20 rounded-2xl pt-7 pb-3 px-6 text-white font-medium focus:bg-white/[0.12] focus:border-[#ffcc00]/60 outline-none transition-all duration-300 shadow-inner"
                          />
                          <label htmlFor="lead-vehicle" className="absolute left-6 top-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/50 transition-all duration-200 peer-focus:-translate-y-3 peer-focus:text-[9px] peer-focus:tracking-[0.3em] peer-focus:text-[#ffcc00] peer-valid:-translate-y-3 peer-valid:text-[9px] peer-valid:tracking-[0.3em] peer-valid:text-white/80 pointer-events-none">
                            <Truck size={10} className="text-[#ffcc00] opacity-0 peer-focus:opacity-100 peer-valid:opacity-100 transition-opacity duration-300" /> Modelo do veículo
                          </label>
                        </div>
                      </div>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#ffcc00] to-[#e6b800] text-[#236172] font-black py-5 sm:py-6 rounded-2xl shadow-[0_15px_30px_rgba(255,204,0,0.2)] hover:shadow-[0_20px_40px_rgba(255,204,0,0.3)] flex items-center justify-center gap-3 transition-all duration-500 uppercase tracking-widest text-xs sm:text-sm border border-white/50"
                      >
                        RECEBER COTAÇÃO AGORA <ArrowRight size={18} />
                      </motion.button>
                      
                      <div className="flex flex-col items-center gap-2 pt-2 hover:opacity-100 transition-opacity">
                        <img 
                          src={susepLogo} 
                          alt="Susep Logo" 
                          className="h-16 sm:h-20 lg:h-24 w-auto"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60">Entidade Autorizada</span>
                      </div>
                    </form>
                    
                    <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-3">
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Proteção & Confidencialidade</p>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main ref={pageRef}>
        {/* HERO - DIGITAL & DIRECT (LOOVI STYLE) */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90svh] flex items-center bg-gradient-to-b from-transparent to-[#2d7c91]/80 relative z-10 w-full">
          {/* Parallax Hero Background */}
          <div className="absolute inset-0 z-0">
            <ParallaxImage 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000" 
              alt="Performance Cover" 
              className="w-full h-full opacity-20 grayscale  "
              speed={0.15}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#236172] via-[#236172]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2d7c91]/40 to-[#2d7c91]/80" />
          </div>

          <div className="container-prosul relative z-10 w-full pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* Left text block: Direct Copy */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left py-10">
                <div className="gsap-hero-wrapper">
                  <div className="gsap-hero-anim inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-8">
                    <span className="w-2 h-2 rounded-full bg-[#ffcc00] animate-pulse" />
                    Proteção em tempo real
                  </div>
                  
                  <h1 className="gsap-hero-anim text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tighter text-white">
                    Proteção que <span className="text-[#ffcc00]">Resolve</span> <br />de verdade
                  </h1>
                  
                  <p className="gsap-hero-anim text-lg sm:text-xl text-white/50 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                    Cobertura contra roubo, furto, colisão e perda total com até 100% Tabela FIPE. Sem análise de perfil e sem burocracia
                  </p>
                  
                  <div className="gsap-hero-anim flex items-center gap-6 justify-center lg:justify-start">
                    <div className="flex -space-x-4">
                      {[1,2,3,4].map(i => (
                        <img key={i} src={`https://picsum.photos/seed/person${i}/100/100`} className="w-12 h-12 rounded-full border-4 border-[#236172] grayscale" referrerPolicy="no-referrer" loading="lazy" alt="Associado" />
                      ))}
                    </div>
                    <div className="text-sm font-light text-white/50">
                      Junte-se a mais de <strong className="text-white">100.000</strong> associados
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Block: Inline Conversion Form */}
              <div className="relative z-20 flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="neon-border-wrapper shadow-[0_0_40px_rgba(255,204,0,0.2)]"
                >
                  <div className="w-full max-w-md prosul-card p-8 relative overflow-hidden">
                    {/* Glowing top line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffcc00] to-transparent opacity-80" />
                    
                    <div className="text-center mb-8">
                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                        Descubra quanto custa proteger seu carro
                      </h3>
                      <p className="text-sm text-white/40">Cotação gratuita, rápida e sem burocracia.</p>
                    </div>

                  <form onSubmit={handleModalSubmit} className="space-y-4">
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="Nome"
                        className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white font-bold focus:bg-white/20 focus:border-[#ffcc00]/60 outline-none transition-all placeholder:text-white/60"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        required
                        type="tel" 
                        placeholder="Telefone"
                        className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white font-bold focus:bg-white/20 focus:border-[#ffcc00]/60 outline-none transition-all placeholder:text-white/60"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="Cidade"
                        className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white font-bold focus:bg-white/20 focus:border-[#ffcc00]/60 outline-none transition-all placeholder:text-white/60"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="Modelo do veículo"
                        className="w-full bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white font-bold focus:bg-white/20 focus:border-[#ffcc00]/60 outline-none transition-all placeholder:text-white/60"
                        value={formData.vehicle}
                        onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                      />
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-[#ffcc00] hover:bg-[#e6b800] text-[#236172] font-black py-4 rounded-xl flex justify-center items-center gap-2 transition-colors uppercase tracking-widest text-sm mt-4"
                    >
                      RECEBER COTAÇÃO NO WHATSAPP <ArrowRight size={18} />
                    </motion.button>

                    <div className="flex flex-col items-center gap-2 mt-6 transition-all duration-500">
                      <img 
                        src={susepLogo} 
                        alt="Susep" 
                        className="h-20 sm:h-24 lg:h-32 w-auto"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Regularizado SUSEP</span>
                    </div>
                  </form>
                  <p className="text-center text-[10px] text-white/30 uppercase mt-4 flex justify-center items-center gap-1">
                    <ShieldCheck size={12} /> Dados criptografados e seguros
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

        {/* COMPARISON / OBJECTION BREAK (Diga adeus ao tradicional) */}
        <section className="py-24 bg-gradient-to-b from-[#2d7c91]/80 to-transparent relative z-10 w-full">
          <div className="container-prosul text-center">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-[1.1]">
              Você não pode escolher o problema <br/>
              <span className="text-[#ffcc00]">mas pode escolher estar protegido</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-16 font-light">Na PROSUL, você não é um perfil de risco. Você é um associado que merece respeito, agilidade e o preço justo.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="prosul-card p-10 flex flex-col items-center text-center  ">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffcc00] mb-6 shadow-inner"><User size={24} /></div>
                  <h4 className="text-xl font-bold text-white mb-3">Sem análise de perfil</h4>
                  <p className="text-white/40 text-sm font-light">Não importa quem dirige ou onde você mora. O preço é com base na FIPE do seu carro.</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="prosul-card p-10 flex flex-col items-center text-center  ">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffcc00] mb-6 shadow-inner"><Shield size={24} /></div>
                  <h4 className="text-xl font-bold text-white mb-3">Sem consulta SPC/Serasa</h4>
                  <p className="text-white/40 text-sm font-light">A sua proteção não pode esperar. Aprovamos sua integração sem burocracia bancária.</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="prosul-card p-10 flex flex-col items-center text-center  ">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#ffcc00] mb-6 shadow-inner"><Briefcase size={24} /></div>
                  <h4 className="text-xl font-bold text-white mb-3">100% Indenização FIPE</h4>
                  <p className="text-white/40 text-sm font-light">Em caso de perda total, roubo ou furto não localizado, receba o valor integral da FIPE do veículo.</p>
               </motion.div>
            </div>
          </div>
        </section>

        <SafetyComparisonSection cleanImg={cleanCarImgUrl} crashedImg={crashedCarImgUrl} />

        {/* BENEFITS GRID (Coberturas Completas) */}
        <section id="beneficios" className="gsap-section py-24 lg:py-32 bg-gradient-to-b from-transparent to-[#2d7c91]/40 relative z-10 w-full">
          <div className="container-prosul">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-6 tracking-tight">Proteção Veicular <br/><span className="text-[#ffcc00]">Completa</span></h2>
              <p className="text-white/40 text-lg font-light">Com indenização de até 100% da tabela FIPE</p>
            </div>

            <div className="gsap-benefits-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Truck, title: "Furto / Roubo", desc: "Seja ressarcido em até 100% do valor de tabela FIPE caso seu veículo seja roubado ou furtado." },
                { icon: Zap, title: "Colisão", desc: "Em caso de acidente, nós providenciamos o conserto do seu veículo." },
                { icon: ShieldAlert, title: "Perda total", desc: "Se o estrago configurar Perda Total, nós iremos indenizá-lo por este prejuízo." },
                { icon: Flame, title: "Incêndio", desc: "Com a gente o seu veículo fica protegido em casos de incêndio com indenização total ou parcial." },
                { icon: CloudRain, title: "Fenômenos naturais", desc: "Se seu veículo for danificado por alagamentos, quedas de árvores ou chuvas de granizo, nós ressarcimos seu prejuízo." },
                { icon: Map, title: "Cobertura em todo Brasil", desc: "Não importa onde aconteça o evento, você poderá contar conosco em todo o Brasil." },
                { icon: Car, title: "Carro reserva", desc: "Disponha um carro reserva caso aconteça algum imprevisto e o seu precise ir para a oficina." },
                { icon: Users, title: "Proteção para terceiros", desc: "Caso você se envolva em um acidente com outro veículo, os consertos são por nossa conta." },
                { icon: LayoutGrid, title: "Cobertura para vidros", desc: "Caso aconteça algum dano com seus vidros, podemos substituí-lo por outro novinho." }
              ].map((b, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="gsap-benefit-card bg-white/5 border border-white/5 rounded-[30px] p-8 hover:bg-white/10 hover:shadow-2xl hover:border-white/10 group cursor-pointer"
                >
                  <b.icon className="w-10 h-10 text-[#ffcc00] mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-bold text-white mb-3">{b.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed font-light">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* APP SECTION (Na palma da mão) */}
        <section className="gsap-section py-20 lg:py-40 bg-[#2d7c91]/40 overflow-hidden relative z-10 w-full">
          <div className="container-prosul grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
               <div className="relative rounded-[40px] [clip-path:inset(0_round_40px)] overflow-hidden shadow-2xl border border-white/10 h-[400px] lg:h-[550px]  ">
                 <ParallaxImage 
                   src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800" 
                   alt="App Digital"
                   className="w-full h-full rounded-[40px] grayscale opacity-80"
                   speed={-0.1}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#236172] via-transparent to-transparent opacity-80" />
               </div>
               {/* Digital App Card Overlay */}
               <motion.div 
                 initial={{ y: 50, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 className="absolute -bottom-8 -right-4 sm:-right-8 prosul-card p-6 border-white/20 bg-[#2d7c91]/40   shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer min-w-[280px]"
                 onClick={() => setShowAppOptions(!showAppOptions)}
               >
                 <div className="flex items-center gap-4 min-h-[50px] justify-center">
                    {showAppOptions ? (
                      <div className="w-full flex justify-center py-2 relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setShowAppOptions(false)}
                          className="absolute -top-6 -right-2 text-white/50 hover:text-white bg-black/20 p-1 rounded-full"
                        >
                          <X size={16} />
                        </button>
                        <AppTooltip />
                      </div>
                    ) : (
                      <>
                        <div className="bg-[#ffcc00] p-3 rounded-2xl text-[#236172] shadow-inner"><Smartphone size={24} /></div>
                        <div>
                          <h5 className="font-bold text-white">App PROSUL</h5>
                          <p className="text-xs text-white/50">Disponível em iOS e Android</p>
                        </div>
                      </>
                    )}
                 </div>
               </motion.div>
            </div>
            
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">Tudo direto na <br/><span className="text-[#ffcc00]">palma da mão.</span></h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed max-w-md mx-auto lg:mx-0 font-light">O controle absoluto sobre a sua proteção. Acione atendimento, baixe a 2ª via de boleto e acesse seu clube de benefícios em segundos.</p>
              <ul className="space-y-5 max-w-md mx-auto lg:mx-0 text-left">
                {[
                  'Carteirinha digital instantânea', 
                  'Acionamento de assistência 24h com 1 clique', 
                  'Acompanhamento do status de veículo', 
                  'Rede de descontos em parceiros VIP'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-[#ffcc00]/10 flex items-center justify-center shrink-0 border border-[#ffcc00]/20">
                      <CheckCircle2 className="text-[#ffcc00]" size={14} />
                    </div>
                    <span className="font-light text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="gsap-section py-24 bg-gradient-to-b from-[#2d7c91]/40 to-transparent relative z-10 w-full">
          <div className="container-prosul max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">Perguntas <span className="text-[#ffcc00]">Frequentes</span></h2>
              <p className="text-white/40 font-light text-lg">Tudo o que você precisa saber sobre a PROSUL.</p>
            </div>
            <div className="gsap-faq-grid space-y-2">
              <div className="gsap-faq-item">
                <FaqItem 
                  question="A Prosul é uma Proteção Veícular Tradicional?"
                  answer="Não, Somos uma associação de proteção veicular, que oferece uma alternativa mais acessível ao seguro tradicional, com proteção completa e atendimento humanizado."
                />
              </div>
              <div className="gsap-faq-item">
                <FaqItem 
                  question="Vocês fazem análise de perfil ou consultam SPC/Serasa?"
                  answer="Não! Acreditamos que a proteção deve ser acessível para todos. Seu valor é calculado exclusivamente pela FIPE do veículo selecionado. Não há variação por idade, gênero, endereço de garagem, CEP, nem restrição de uso para negativados."
                />
              </div>
              <div className="gsap-faq-item">
                <FaqItem 
                  question="Como é feito o acionamento em caso de sinistro?"
                  answer="Basta abrir o app da PROSUL ou ligar na central 24h. O time te auxilia em tempo real com liberação do guincho, encaminhamento a oficinas verificadas e no preenchimento do aviso de evento, garantindo agilidade extrema em todo o processo."
                />
              </div>
              <div className="gsap-faq-item">
                <FaqItem 
                  question="Carros de Leilão ou recuperados são aceitos?"
                  answer="Sim! Avaliaremos o veículo mediante vistoria digital simples para confirmar seu estado atual. Sendo aprovado, ele participa do plano com indenização referenciada ao percentual contratual da tabela FIPE correspondente."
                />
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER CTA SECTION */}
        <section id="contato" className="gsap-section py-24 lg:py-40 bg-gradient-to-b from-transparent to-[#2d7c91]/40 relative z-10 w-full text-center">
          <div className="container-prosul max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-8xl font-black text-white mb-6 lg:mb-8 tracking-tighter leading-[1.1]">
              Faça parte da proteção <br className="hidden sm:block" />que <span className="text-[#ffcc00] underline decoration-[#ffcc00]/30 decoration-4 underline-offset-8">mais cresce</span> no Sul do Brasil.
            </h2>
            <p className="text-white/50 text-lg md:text-2xl mb-10 lg:mb-12 font-light px-4 sm:px-0">
              Agora é sua vez de dirigir com mais tranquilidade e menos burocracia.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModal} /* Fallback hook */
              className="bg-[#ffcc00] hover:bg-[#e6b800] text-[#236172] text-sm md:text-lg lg:text-xl font-black py-5 sm:py-6 px-6 sm:px-12 w-full sm:w-auto rounded-xl transition-all shadow-[0_20px_40px_rgba(255,204,0,0.3)] hover:shadow-[0_30px_60px_rgba(255,204,0,0.4)] uppercase tracking-widest sm:tracking-normal"
            >
              RECEBER COTAÇÃO NO WHATSAPP
            </motion.button>

            <div className="mt-12 flex flex-col items-center gap-3 transition-all duration-700">
              <img 
                src={susepLogo} 
                alt="Logo Susep" 
                className="h-32 sm:h-48 lg:h-64 w-auto"
                referrerPolicy="no-referrer"
              />
              <p className="text-[10px] font-black tracking-[0.4em] text-white uppercase">Regulamentação Nacional</p>
            </div>
          </div>
        </section>
      </main>

      {/* FINAL FOOTER */}
      <footer className="py-16 lg:py-24 bg-[#2d7c91]/40">
        <div className="container-prosul grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
          <div className="sm:col-span-2">
            <Link to="/admin" className="flex flex-col items-start leading-none mb-8 lg:mb-10 group">
              <span className="text-3xl lg:text-4xl font-black text-white tracking-tighter group-hover:text-[#ffcc00] transition-colors">PROSUL<span className="text-[#ffcc00] text-[0.4em] align-top">®</span></span>
              <span className="text-[10px] font-bold tracking-[0.5em] text-[#ffcc00]/60 uppercase mt-2">a melhor do sul do brasil</span>
            </Link>
            <p className="text-white/30 max-w-md leading-relaxed text-sm">
              Mais de uma década provendo segurança, ética e transparência para o mercado de proteção automotiva no Brasil.
            </p>
          </div>
          
          <div className="space-y-6">
            <h5 className="font-black text-white uppercase tracking-widest text-xs">Filial especializada</h5>
            <ul className="text-white/30 text-xs space-y-4 uppercase tracking-[0.2em] font-black">
              <li>
                <a href="https://www.google.com/maps?vet=10CAAQoqAOahcKEwiQubGo-PWUAxUAAAAAHQAAAAAQGg..i&rlz=1C1VDKB_enBR1207BR1207&sca_esv=47b14df0f15d899c&pvq=Cg0vZy8xMXE0MDE1bnh5&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=br&sa=X&geocode=KcPkPLgaoxyVMUSiMHie3rXe&daddr=R.+Gaspar+Silveira+Martins,+2159+-+Margarida,+Santa+Cruz+do+Sul+-+RS,+96825-145" target="_blank" rel="noreferrer" className="hover:text-[#ffcc00] transition-colors cursor-pointer block">Santa Cruz</a>
              </li>
            </ul>
          </div>


        </div>
        
        <div className="container-prosul mt-16 lg:mt-24 pt-10 lg:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black tracking-widest uppercase text-center lg:text-left">
          <span>PROSUL® - 2026</span>
          <a 
            href="https://www.instagram.com/olucasconstantino/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#ffcc00] transition-all py-2 md:py-0"
          >
            © 2026 Lucas Constantino
          </a>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[60] p-4 lg:p-6"
          >
            <div className="max-w-4xl mx-auto bg-[#2d7c91]/40 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center text-[#ffcc00] shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Utilizamos cookies para personalizar sua experiência e analisar nosso tráfego. Ao continuar navegando, você concorda com nossa política de privacidade.
                </p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setShowCookieBanner(false)}
                  className="px-6 py-3 text-xs font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                >
                  Recusar
                </button>
                <button 
                  onClick={handleAcceptCookies}
                  className="btn-primary py-3 px-10 text-xs w-full md:w-auto"
                >
                  Aceitar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#236172]/95 backdrop-blur-md border-t border-white/10 z-[55] md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <button onClick={() => setModalOpen(true)} className="w-full bg-[#ffcc00] hover:bg-yellow-400 focus:scale-[0.98] active:scale-[0.98] text-[#236172] font-black py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(255,204,0,0.3)] text-[13px] uppercase tracking-widest flex items-center justify-center gap-2">
          Cotação Imediata
        </button>
      </div>
    </div>
  );
}
