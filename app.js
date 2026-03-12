/**
 * ELITEMARKET - CORE ENGINE V7 (NO TRUNCATION - FULL LOGIC)
 */

// 1. STATE
let currentUser = null; 
let currentView = 'home';
let selectedColor = 'black';
let selectedTheme = 'minimal';
let targetRole = null;
let chats = []; 
let transactions = []; 

const COLOR_MAP = { black: '#000000', red: '#ef4444', yellow: '#f59e0b', blue: '#3b82f6', green: '#10b981', white: '#ffffff' };

const MOCK_SELLERS = [
    { id: 1, full_name: "Alex Rivera", category: "UX/UI", bio: "Sistemas escalables.", rating: 4.9, avatar: "Felix", is_verified: true, services: [{name: "Auditoría UX", price: 150}], color: 'black', theme: 'minimal', whatsapp: '50688888888' }
];

// 2. NAVIGATION
function showView(viewId) {
    console.log("Nav to:", viewId);
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('view-active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) { target.classList.add('view-active'); currentView = viewId; }

    const nav = document.getElementById('main-nav');
    if (['auth', 'onboarding', 'convo'].includes(viewId)) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden'); nav.classList.add('flex');
        const sBtn = document.getElementById('nav-seller-btn');
        if (currentUser && currentUser.role === 'seller') sBtn.classList.remove('hidden'); else sBtn.classList.add('hidden');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isM = btn.getAttribute('data-view') === viewId;
            btn.classList.toggle('text-black', isM); btn.classList.toggle('text-slate-300', !isM);
        });
    }

    if (viewId === 'home') { updateGreeting(); renderResults(); }
    if (viewId === 'profile') updateProfileUI();
    if (viewId === 'seller') renderSellerPanel();
    if (viewId === 'chat') renderChatList();
}

// 3. ONBOARDING & DESIGN (THE FIX)
window.nextOBStep = (s) => {
    document.querySelectorAll('.onboarding-step').forEach(el => { el.classList.add('hidden'); el.classList.remove('block'); });
    document.getElementById(`step-${s}`).classList.remove('hidden'); document.getElementById(`step-${s}`).classList.add('block');
};

window.selectColor = (el, color) => {
    selectedColor = color;
    document.querySelectorAll('.color-dot').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    console.log("Color selected:", color);
};

window.selectTheme = (el, theme) => {
    selectedTheme = theme;
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    console.log("Template selected:", theme);
};

window.simulateAIVerification = () => {
    const modal = document.getElementById('ai-modal');
    const status = document.getElementById('ai-status');
    document.getElementById('ai-modal-title').innerText = "AI Identity Scan";
    modal.classList.remove('hidden'); modal.classList.add('flex');
    const steps = ["Escaneando rostro...", "Validando reputación...", "Verificado ✓"];
    let i = 0;
    const it = setInterval(() => {
        status.innerText = steps[i]; i++;
        if (i >= steps.length) { clearInterval(it); setTimeout(() => { modal.classList.add('hidden'); if(currentUser) currentUser.is_verified = true; nextOBStep(3); }, 1000); }
    }, 1000);
};

window.finishOnboarding = () => {
    currentUser.seller_data = {
        id: Date.now(), full_name: currentUser.full_name, category: document.getElementById('ob-category').value,
        bio: document.getElementById('ob-bio').value, color: selectedColor, theme: selectedTheme,
        is_verified: currentUser.is_verified, avatar: currentUser.avatar, rating: 5.0, whatsapp: '50600000000',
        services: [{ name: document.getElementById('ob-service-name').value || "Item Elite", price: document.getElementById('ob-service-price').value || "0" }]
    };
    MOCK_SELLERS.push(currentUser.seller_data);
    alert("¡Puesto publicado con éxito!");
    showView('home');
};

// 4. TRANSACTION ENGINE
window.handleHire = (seller, service) => {
    if (!currentUser) { alert("Debes iniciar sesión para contratar."); return showView('auth'); }
    
    // Registrar Transacción
    transactions.push({ id: Date.now(), sellerId: seller.id, itemName: service.name, price: service.price, status: 'pending' });

    // Iniciar Chat Automático
    let convo = chats.find(c => c.sellerId === seller.id);
    if (!convo) {
        convo = { id: Date.now(), sellerId: seller.id, sellerName: seller.full_name, avatar: seller.avatar, messages: [{ text: `Solicitud de: ${service.name} ($${service.price})`, sender: 'me', time: 'Ahora' }] };
        chats.push(convo);
    } else {
        convo.messages.push({ text: `Nueva orden: ${service.name} ($${service.price})`, sender: 'me', time: 'Ahora' });
    }

    // Escrow Simulation
    const modal = document.getElementById('ai-modal');
    const status = document.getElementById('ai-status');
    document.getElementById('ai-modal-title').innerText = "Escrow AI Audit";
    modal.classList.remove('hidden'); modal.classList.add('flex');
    const steps = ["Protegiendo fondos...", "Generando contrato inteligente...", "¡Escrow Activo!"];
    let i = 0;
    const it = setInterval(() => {
        status.innerText = steps[i]; i++;
        if (i >= steps.length) { 
            clearInterval(it); 
            setTimeout(() => { modal.classList.add('hidden'); alert("Fondos retenidos. Coordina el envío en Mensajes."); showView('chat'); }, 1000); 
        }
    }, 1000);
};

// 5. RENDERING (BOOTH & LISTS)
window.openFullBooth = (id) => {
    const s = MOCK_SELLERS.find(x => x.id == id);
    if (!s) return;
    const c = COLOR_MAP[s.color || 'black'];
    const isL = s.color === 'white' || s.color === 'yellow';
    const content = document.getElementById('booth-full-content');
    
    content.innerHTML = `
        <div class="relative h-72 shadow-xl" style="background-color: ${c}">
            <button onclick="showView('home')" class="absolute top-12 left-6 z-20 bg-white/20 backdrop-blur-md p-4 rounded-3xl ${isL?'text-black':'text-white'} shadow-xl transition-all active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg></button>
            <div class="absolute bottom-10 left-10 flex items-center gap-8 z-20">
                <div class="relative w-28 h-28">
                    <div class="w-full h-full bg-white rounded-[44px] overflow-hidden shadow-2xl border-4 border-white"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${s.avatar}" class="w-full h-full"></div>
                    ${s.is_verified ? `<div class="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-xl border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M16.403 12.652a5.5 5.5 0 0 0 0-5.304 5.5 5.5 0 0 0-3.751-3.751 5.5 5.5 0 0 0-5.304 0 5.5 5.5 0 0 0-3.751 3.751 5.5 5.5 0 0 0 0 5.304 5.5 5.5 0 0 0 3.751 3.751 5.5 5.5 0 0 0 5.304 0 5.5 5.5 0 0 0 3.751-3.751ZM10 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" clip-rule="evenodd" /></svg></div>`: ''}
                </div>
                <div class="${isL?'text-black':'text-white'} text-left"><h2 class="text-4xl font-black tracking-tight">${s.full_name}</h2><p class="text-xs font-bold uppercase opacity-70">${s.category}</p></div>
            </div>
        </div>
        <div class="p-10 space-y-12 bg-white rounded-t-[50px] -mt-10 relative z-10 text-left">
            <section><h3 class="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-4">Estrategia [${s.theme || 'minimal'}]</h3><p class="text-xl text-slate-800 leading-relaxed italic">"${s.bio}"</p></section>
            <section>
                <div class="space-y-6">${s.services.map(ser => `
                    <div class="p-8 bg-slate-50 border border-slate-100 rounded-[40px] space-y-6">
                        <div><h4 class="font-bold text-xl tracking-tight mb-1">${ser.name}</h4><p class="text-xs text-slate-400">Garantía Escrow AI.</p></div>
                        <div class="flex items-center justify-between pt-4 border-t border-slate-200/50">
                            <p class="text-2xl font-black text-black mt-1">$${ser.price}</p>
                            <div class="flex gap-2">
                                <button onclick='handleHire(${JSON.stringify(s).replace(/'/g, "&apos;")}, ${JSON.stringify(ser).replace(/'/g, "&apos;")})' class="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg">Contratar</button>
                                <a href="https://wa.me/${s.whatsapp}" target="_blank" class="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg></a>
                            </div>
                        </div>
                    </div>`).join('')}
                </div>
            </section>
        </div>
    `;
    showView('booth');
};

function renderResults() {
    const container = document.getElementById('results-container');
    container.innerHTML = MOCK_SELLERS.map(s => `<div class="p-6 rounded-[32px] border border-slate-100 flex items-center gap-5 bg-white shadow-sm cursor-pointer active:scale-95 transition-all" onclick="openFullBooth(${s.id})"><div class="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${s.avatar}" class="w-full h-full"></div><div class="flex-grow text-left"><div class="flex items-center justify-between mb-1"><h3 class="font-bold text-base tracking-tight">${s.full_name} ${s.is_verified?'<span class="text-blue-500">✓</span>':''}</h3><span class="text-[10px] text-slate-400">★ ${s.rating}</span></div><p class="text-xs text-slate-500 line-clamp-1">${s.bio}</p></div></div>`).join('');
}

function renderChatList() {
    const container = document.getElementById('chat-list-container');
    if (chats.length === 0) return container.innerHTML = `<p class="text-slate-300 py-20 text-sm italic">Sin conversaciones.</p>`;
    container.innerHTML = chats.map(c => `<div class="p-5 bg-white border border-slate-100 rounded-[32px] flex items-center gap-4 cursor-pointer active:bg-slate-50 shadow-sm" onclick="alert('Abriendo chat...')"><div class="w-12 h-12 bg-slate-50 rounded-2xl overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${c.avatar}" class="w-full h-full"></div><div class="text-left flex-grow"><h4 class="font-bold text-sm text-black">${c.sellerName}</h4><p class="text-[11px] text-slate-400 line-clamp-1">${c.messages[c.messages.length-1].text}</p></div></div>`).join('');
}

// 6. AUTH & ACCOUNT LOGIC
window.handleAuth = () => {
    const email = document.getElementById('auth-email').value;
    const role = document.getElementById('auth-role').value;
    if (!email) return alert("Email requerido");
    currentUser = { email, full_name: document.getElementById('auth-name').value || "Zeledón", role: role || 'buyer', avatar: "User", is_verified: false, seller_data: null };
    if (currentUser.role === 'seller') showView('onboarding'); else showView('home');
};

window.toggleAuthMode = () => {
    const reg = document.getElementById('register-only');
    const btn = document.getElementById('btn-auth-main');
    reg.classList.toggle('hidden');
    btn.innerText = reg.classList.contains('hidden') ? "Entrar" : "Crear Cuenta";
};

window.handleRoleChange = (newRole) => {
    if (newRole === currentUser.role) return;
    targetRole = newRole;
    document.getElementById('target-role-name').innerText = newRole === 'seller' ? 'Vendedor' : 'Comprador';
    const modal = document.getElementById('modal-reauth');
    modal.classList.remove('hidden'); modal.classList.add('flex');
    document.getElementById('role-dropdown').value = currentUser.role;
};

window.confirmRoleSwitch = () => {
    if (document.getElementById('reauth-pass').value.length < 4) return alert("Clave insuficiente");
    currentUser.role = targetRole;
    document.getElementById('reauth-pass').value = '';
    closeReauth();
    if (currentUser.role === 'seller' && !currentUser.seller_data) showView('onboarding'); else showView('profile');
};

window.closeReauth = () => { document.getElementById('modal-reauth').classList.remove('flex'); document.getElementById('modal-reauth').classList.add('hidden'); };

function updateProfileUI() {
    const guestContainer = document.getElementById('guest-login-container');
    const switcherContainer = document.getElementById('account-switcher-container');
    const logoutBtn = document.getElementById('logout-btn');
    const roleStatus = document.getElementById('profile-role-status');
    const badge = document.getElementById('verification-badge');

    if (!currentUser) {
        document.getElementById('profile-name').innerText = "Invitado";
        document.getElementById('profile-avatar-img').src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
        roleStatus.innerHTML = `<p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] bg-slate-100 px-4 py-1.5 rounded-full">Visitante</p>`;
        guestContainer.innerHTML = `<button onclick="showView('auth')" class="w-full bg-black text-white py-5 rounded-[22px] font-bold shadow-xl active:scale-95 transition-all mt-4">Entrar / Registrarse</button>`;
        switcherContainer.classList.add('hidden'); logoutBtn.classList.add('hidden'); badge.classList.add('hidden');
    } else {
        document.getElementById('profile-name').innerText = currentUser.full_name;
        document.getElementById('profile-avatar-img').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.avatar}`;
        if (currentUser.is_verified) badge.classList.remove('hidden'); else badge.classList.add('hidden');
        switcherContainer.classList.remove('hidden'); logoutBtn.classList.remove('hidden');
        document.getElementById('role-dropdown').value = currentUser.role;
        guestContainer.innerHTML = !currentUser.is_verified ? `<button onclick="simulateAIVerification()" class="w-full bg-blue-50 text-blue-600 py-4 rounded-[22px] font-bold text-[10px] border border-blue-100 mt-4 shadow-sm">Verificar con IA</button>` : '';
    }
}

function renderSellerPanel() {
    const container = document.getElementById('my-services');
    const data = currentUser?.seller_data;
    if (!data) return container.innerHTML = `<p class="text-center py-10 text-slate-300">Completa tu configuración inicial.</p>`;
    container.innerHTML = data.services.map((s, idx) => `<div class="p-6 bg-white border border-slate-100 rounded-[32px] flex items-center justify-between shadow-sm"><div><h4 class="font-bold text-sm">${s.name}</h4><p class="text-xs text-slate-400">$${s.price}</p></div><button class="p-3 bg-slate-50 rounded-xl text-slate-400 font-bold text-[10px]">EDITAR</button></div>`).join('');
}

function updateGreeting() {
    const el = document.getElementById('greeting');
    const loginBtn = document.getElementById('header-login-btn');
    if (!currentUser) { el.innerHTML = `Hola, <span class="font-bold">bienvenido</span>`; loginBtn.classList.remove('hidden'); }
    else { const n = currentUser.full_name.split(' ')[0]; el.innerHTML = `Hola, <span class="font-bold">${n}</span>`; loginBtn.classList.add('hidden'); }
}

function simulateSearch() {
    const q = document.getElementById('ai-search').value.trim().toLowerCase();
    if (q.length < 2) return renderResults();
    const container = document.getElementById('results-container');
    container.innerHTML = `<p class="text-center py-10 text-slate-400 animate-pulse uppercase text-[10px] font-bold tracking-widest">IA Escaneando...</p>`;
    setTimeout(() => {
        const filtered = MOCK_SELLERS.filter(s => s.full_name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
        container.innerHTML = filtered.length > 0 ? filtered.map(s => `<div class="p-6 rounded-[32px] border border-slate-100 flex items-center gap-5 bg-white shadow-sm cursor-pointer active:scale-95 transition-all" onclick="openFullBooth(${s.id})"><div class="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${s.avatar}" class="w-full h-full"></div><div class="flex-grow text-left"><div class="flex items-center justify-between mb-1"><h3 class="font-bold text-base tracking-tight">${s.full_name} ${s.is_verified?'<span class="text-blue-500">✓</span>':''}</h3><span class="text-[10px] text-slate-400">★ ${s.rating}</span></div><p class="text-xs text-slate-500 line-clamp-1">${s.bio}</p></div></div>`).join('') : '<p class="text-center py-10 text-slate-300">No hay coincidencias.</p>';
    }, 600);
}

window.logout = () => { currentUser = null; showView('home'); };
window.requireAuthAction = (cb) => { if (!currentUser) { alert("Inicia sesión para continuar"); showView('auth'); } else cb(); };

document.addEventListener('DOMContentLoaded', () => { showView('home'); });
