import { useState, useEffect, useRef, useCallback } from 'react';
import type { AppData, User, Order, Patient, Material, AIReport, WorkItem, OrderFile, UserPermissions } from './data';
import { createDemoData, STATUS_NAMES, STATUS_COLORS, ROLE_LABELS, DEFAULT_ROLES_META, determineOrderType } from './data';
import { t, type Lang } from './i18n';

const STORAGE_KEY = 'myort_lk_data';
const MAX_FILE_SIZE = 1.5 * 1024 * 1024;

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (!data.settings) data.settings = { language: 'ru', gmaiPrices: { basic_month: 9900, basic_year: 99000, extended_month: 19900, extended_year: 199000 } };
      if (!data.settings.gmaiPrices) data.settings.gmaiPrices = { basic_month: 9900, basic_year: 99000, extended_month: 19900, extended_year: 199000 };
      if (!data.settings.alignersUrl) data.settings.alignersUrl = 'https://myortlab.com/aligners';
      if (!data.settings.notifications) {
        data.settings.notifications = {
          telegram: { enabled: false, botToken: '', chatId: '' },
          max: { enabled: false, apiKey: '', chatId: '' },
          email: { enabled: false, smtp: { host: '', port: 587, user: '', pass: '' }, from: '' }
        };
      }
      if (!data.materialUsage) data.materialUsage = [];
      if (!data.mirrorReports) data.mirrorReports = [];
      if (!data.rolesMeta) data.rolesMeta = DEFAULT_ROLES_META;
      if (!data.stockIn) data.stockIn = [];
      if (!data.materials) data.materials = [];
      if (!data.workTypes) data.workTypes = [];
      if (!data.catalog) data.catalog = [];
      if (!data.orders) data.orders = [];
      if (!data.patients) data.patients = [];
      if (!data.users) data.users = [];
      if (!data.news) data.news = [];
      if (data.orders) {
        data.orders = data.orders.map((o: any) => ({
          ...o,
          positions: o.positions || [],
          files: o.files || [],
          comments: o.comments || [],
          history: o.history || [],
          paymentType: o.paymentType || 'pre100',
          type: o.type || 'full',
        }));
      }
      if (data.users) {
        data.users = data.users.map((u: any) => ({
          ...u,
          permissions: u.permissions || {},
          email: u.email || '',
        }));
      }
      return data;
    }
  } catch (e) { /* ignore */ }
  const data = createDemoData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function saveData(data: AppData) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function fmtDate(ts: number) { return new Date(ts).toLocaleDateString('ru-RU'); }
function fmtDateTime(ts: number) { return new Date(ts).toLocaleString('ru-RU'); }

export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [toasts, setToasts] = useState<{id: string; msg: string; type: string}[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lang, setLang] = useState<Lang>((data.settings?.language as Lang) || 'ru');

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => {
    const handleResize = () => setSidebarCollapsed(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toast = useCallback((msg: string, type = 'info') => {
    const id = genId();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const updateData = (fn: (d: AppData) => AppData) => {
    setData(prev => { const next = fn(prev); saveData(next); return next; });
  };

  const openModal = (content: React.ReactNode) => { setModalContent(content); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setModalContent(null); };

  const login = (loginStr: string, pass: string) => {
    const user = (data.users || []).find(u => u.login === loginStr && u.pass === pass);
    if (user) { setCurrentUser(user); return true; }
    return false;
  };

  const logout = () => { setCurrentUser(null); setView('dashboard'); };

  const user = currentUser;
  const role = user?.role || '';
  const isAdmin = role === 'admin';
  const isAdminZTL = role === 'admin_ztl';
  const isManagerSupport = role === 'manager_support';
  const isDoctor = role === 'doctor' || role === 'doctor_myort';
  const isClinicMgr = role === 'clinic_mgr';
  const isQuality = role === 'quality';
  const isMarketer = role === 'marketer';
  const isTech = ['cadcam','keramist','gips','print3d','tech_phys','scan'].includes(role);
  const canAdmin = isAdmin || isAdminZTL || isManagerSupport;

  const getFilteredOrders = () => {
    if (!user) return [];
    let orders = data.orders || [];
    if (isAdmin || isAdminZTL) return orders.filter(o => o.status !== 'cancelled');
    if (isManagerSupport) return orders.filter(o => o.status !== 'cancelled');
    if (isClinicMgr) return orders.filter(o => o.clinic === user.clinic);
    if (isDoctor) return orders.filter(o => o.doctorId === user.id);
    if (isQuality) return orders.filter(o => ['quality','returned','accept'].includes(o.status));
    if (isTech) return orders.filter(o => o.positions.some(p => p.ops.some(op => op.techId === user.id)));
    return orders;
  };

  const menuItems = [
    { key: 'dashboard', label: t(lang, 'dashboard'), icon: '📊', roles: ['all'] },
    { key: 'orders', label: t(lang, 'orders'), icon: '📋', roles: ['all'] },
    { key: 'new-order', label: t(lang, 'newOrder'), icon: '➕', roles: ['doctor','doctor_myort','admin'] },
    { key: 'catalog', label: t(lang, 'catalog'), icon: '📁', roles: ['all'] },
    { key: 'aligners', label: t(lang, 'aligners'), icon: '🦷', roles: ['all'], external: true },
    { key: 'patients', label: t(lang, 'patients'), icon: '👤', roles: ['doctor','doctor_myort','admin','clinic_mgr'] },
    { key: 'materials', label: t(lang, 'materials'), icon: '📦', roles: ['admin','admin_ztl','cadcam','keramist','gips','print3d','tech_phys','scan'] },
    { key: 'work-types', label: t(lang, 'workTypes'), icon: '⚙️', roles: ['admin'] },
    { key: 'piecework', label: t(lang, 'piecework'), icon: '💰', roles: ['cadcam','keramist','gips','print3d','tech_phys','scan'] },
    { key: 'reports', label: t(lang, 'reports'), icon: '📈', roles: ['admin','admin_ztl','clinic_mgr','cadcam','keramist','gips','print3d','tech_phys','scan'] },
    { key: 'gmait', label: 'GnatoneMirror', icon: '🤖', roles: ['admin','doctor','doctor_myort'] },
    { key: 'notifications', label: t(lang, 'notifications'), icon: '🔔', roles: ['admin'] },
    { key: 'users', label: t(lang, 'users'), icon: '👥', roles: ['admin'] },
    { key: 'news', label: t(lang, 'news'), icon: '📰', roles: ['admin','marketer'] },
  ];

  const visibleMenu = menuItems.filter(m => m.roles.includes('all') || m.roles.includes(role));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-cyan-50">
        <div className="bg-white p-6 rounded-xl shadow-xl w-80">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">MyOrt</div>
            <p className="text-gray-500 mt-1 text-sm">{t(lang, 'loginSubtitle')}</p>
          </div>
          <LoginForm onLogin={login} lang={lang} />
          <div className="mt-3 p-2 bg-gray-50 rounded text-[10px] text-gray-500">
            <p className="font-semibold mb-0.5">{t(lang, 'demoAccounts')}:</p>
            <p>admin/admin • ztl/ztl • doctor/doctor</p>
            <p>quality/quality • tech1/tech1</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className={`bg-slate-900 text-white h-full sticky top-0 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-14' : 'w-52'}`}>
        <div className="p-3 border-b border-white/10">
          <h2 className={`font-bold ${sidebarCollapsed ? 'text-xs' : 'text-base'}`}>MyOrt</h2>
          {!sidebarCollapsed && <small className="text-[10px] opacity-70">{t(lang, 'loginSubtitle')}</small>}
        </div>
        <nav className="flex-1 py-1 overflow-y-auto">
          {visibleMenu.map(item => (
            <button key={item.key} onClick={() => {
              if (item.external) {
                const url = data.settings?.alignersUrl || 'https://myortlab.com/aligners';
                window.open(url, '_blank');
              } else {
                setView(item.key);
              }
            }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/10 ${view === item.key ? 'bg-cyan-700/30 border-l-2 border-cyan-400' : ''}`}>
              <span className="text-sm">{item.icon}</span>
              {!sidebarCollapsed && <span className="text-xs">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 text-center text-[10px] opacity-50">
          {!sidebarCollapsed && <span>{t(lang, 'version')} 2.0</span>}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-gray-500 hover:text-gray-700 text-lg">☰</button>
            <h1 className="text-sm font-semibold text-gray-800">{menuItems.find(m => m.key === view)?.label || t(lang, 'dashboard')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <select value={lang} onChange={e => { setLang(e.target.value as Lang); updateData(d => ({...d, settings: {...(d.settings || {language: 'ru', gmaiPrices: {basic_month: 9900, basic_year: 99000, extended_month: 19900, extended_year: 199000}}), language: e.target.value as any}})); }}
              className="text-xs border rounded px-2 py-1">
              <option value="ru">RU</option><option value="en">EN</option><option value="kz">KZ</option>
            </select>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-xs">{user.name.charAt(0)}</div>
              <div className="text-xs"><div className="font-medium">{user.name}</div><div className="text-gray-500 text-[10px]">{ROLE_LABELS[user.role]}</div></div>
            </div>
            <button onClick={logout} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">{t(lang, 'logout')}</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-3">
          {view === 'dashboard' && <DashboardView data={data} user={user} lang={lang} getFilteredOrders={getFilteredOrders} openOrderModal={(o: Order) => { setSelectedOrder(o); openModal(<OrderModal order={o} data={data} user={user} lang={lang} updateData={updateData} toast={toast} closeModal={closeModal} refreshOrder={(id: string) => { const o = data.orders.find(x => x.id === id); if (o) setSelectedOrder({...o}); }} />); }} />}
          {view === 'orders' && <OrdersView data={data} user={user} lang={lang} getFilteredOrders={getFilteredOrders} openOrderModal={(o: Order) => { setSelectedOrder(o); openModal(<OrderModal order={o} data={data} user={user} lang={lang} updateData={updateData} toast={toast} closeModal={closeModal} refreshOrder={(id: string) => { const o = data.orders.find(x => x.id === id); if (o) setSelectedOrder({...o}); }} />); }} setView={setView} />}
          {view === 'new-order' && <NewOrderView data={data} user={user} updateData={updateData} toast={toast} setView={setView} />}
          {view === 'catalog' && <CatalogView data={data} user={user} lang={lang} updateData={updateData} toast={toast} />}
          {view === 'patients' && <PatientsView data={data} user={user} lang={lang} updateData={updateData} toast={toast} />}
          {view === 'materials' && <MaterialsView data={data} user={user} lang={lang} updateData={updateData} toast={toast} />}
          {view === 'work-types' && <WorkTypesView data={data} user={user} lang={lang} updateData={updateData} toast={toast} />}
          {view === 'piecework' && <PieceworkView data={data} user={user} lang={lang} />}
          {view === 'reports' && <ReportsView data={data} user={user} lang={lang} toast={toast} />}
          {view === 'gmait' && <GMAIView data={data} user={user} lang={lang} updateData={updateData} toast={toast} openModal={openModal} />}
          {view === 'notifications' && <NotificationsView data={data} user={user} lang={lang} updateData={updateData} toast={toast} />}
          {view === 'users' && <UsersView data={data} user={user} lang={lang} updateData={updateData} toast={toast} openModal={openModal} closeModal={closeModal} />}
          {view === 'news' && <NewsView data={data} user={user} lang={lang} updateData={updateData} toast={toast} />}
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {modalContent}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg text-white shadow-lg min-w-[280px] ${t.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

function LoginForm({ onLogin, lang }: { onLogin: (l: string, p: string) => boolean; lang: Lang }) {
  const [l, setL] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); if (!onLogin(l, p)) setErr(lang === 'ru' ? 'Неверный логин или пароль' : lang === 'en' ? 'Invalid credentials' : 'Жүйеге кіру қатесі'); }}>
      <input type="text" value={l} onChange={e => setL(e.target.value)} placeholder={t(lang, 'username')} className="w-full px-3 py-2 border rounded mb-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
      <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder={t(lang, 'password')} className="w-full px-3 py-2 border rounded mb-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
      {err && <p className="text-red-500 text-xs mb-1">{err}</p>}
      <button type="submit" className="w-full py-2 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700">{t(lang, 'loginBtn')}</button>
    </form>
  );
}

function DashboardView({ data, user, lang, getFilteredOrders, openOrderModal }: any) {
  const orders = getFilteredOrders();
  const inWork = orders.filter((o: Order) => !['done','cancelled'].includes(o.status)).length;
  const completed = orders.filter((o: Order) => o.status === 'done').length;
  const overdue = orders.filter((o: Order) => o.status !== 'done' && o.status !== 'cancelled' && new Date(o.dueDate) < new Date()).length;
  const paidAmount = orders.filter((o: Order) => o.paid).reduce((s: number, o: Order) => s + o.positions.reduce((ps, p) => ps + p.price, 0), 0);
  const lowStock = (data.materials || []).filter((m: Material) => m.currentStock <= m.minStock);

  const statuses = ['quality','returned','accept','gypsum','scanning','admin_pricing','payment','cadcam','approve','correction','production','delivery','handover','closing','done','repair_create','repair_approve','guarantee_create','guarantee_approve'];

  return (
    <div className="flex flex-col h-full">
      {/* Compact KPI Cards */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#0e7490' }}>
          <div className="text-lg font-bold text-cyan-600">{inWork}</div>
          <div className="text-xs text-gray-500">{t(lang, 'ordersInWork')}</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#16a34a' }}>
          <div className="text-lg font-bold text-green-600">{completed}</div>
          <div className="text-xs text-gray-500">{t(lang, 'completed')}</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#dc2626' }}>
          <div className="text-lg font-bold text-red-600">{overdue}</div>
          <div className="text-xs text-gray-500">{t(lang, 'overdue')}</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#6366f1' }}>
          <div className="text-lg font-bold text-indigo-600">{paidAmount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{t(lang, 'paidAmount')}</div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2">
          <p className="font-semibold text-amber-800 text-xs mb-1">⚠️ {t(lang, 'lowStock')}</p>
          <div className="flex flex-wrap gap-1">
            {lowStock.map((m: Material) => (
              <span key={m.id} className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs">{m.name}: {m.currentStock} {m.unit}</span>
            ))}
          </div>
        </div>
      )}

      {/* Kanban with fixed height and scroll */}
      <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden mb-3">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="font-semibold text-sm">{t(lang, 'pipeline')}</h3>
        </div>
        <div className="flex-1 overflow-auto kanban-scroll p-2">
          <div className="flex gap-2 h-full">
            {statuses.map(status => {
              const statusOrders = orders.filter((o: Order) => o.status === status);
              if (statusOrders.length === 0) return null;
              return (
                <div key={status} className="min-w-[220px] max-w-[220px] bg-gray-50 rounded p-2 flex-shrink-0">
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }}></span>
                    <span className="truncate">{t(lang, status as any) || STATUS_NAMES[status]} ({statusOrders.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {statusOrders.slice(0, 8).map((order: Order) => {
                      const patient = (data.patients || []).find((p: Patient) => p.id === order.patientId);
                      return (
                        <div key={order.id} onClick={() => openOrderModal(order)}
                          className="bg-white rounded p-2 cursor-pointer border-l-3 hover:shadow-md transition-shadow"
                          style={{ borderLeftWidth: '3px', borderLeftColor: STATUS_COLORS[status] }}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-bold text-xs">{order.num}</span>
                            {order.corrections > 0 && <span className="bg-amber-100 text-amber-700 text-[10px] px-1 rounded">К{order.corrections}</span>}
                            {order.is_urgent && <span className="bg-red-100 text-red-700 text-[10px] px-1 rounded">{t(lang, 'urgent')}</span>}
                            {order.has_physical_impressions && <span className="bg-purple-100 text-purple-700 text-[10px] px-1 rounded">{t(lang, 'impressions')}</span>}
                          </div>
                          <div className="text-[11px] text-gray-600 truncate">{patient?.fio || '—'}</div>
                          <div className="text-[10px] text-gray-500 truncate">{order.positions[0]?.name || '—'}</div>
                        </div>
                      );
                    })}
                    {statusOrders.length > 8 && <div className="text-[10px] text-gray-400 text-center">+{statusOrders.length - 8} {t(lang, 'more')}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact News */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h3 className="font-semibold text-sm mb-2">{t(lang, 'newsBlock')}</h3>
        {(data.news || []).slice(0, 2).map((n: any) => (
          <div key={n.id} className="border-b border-gray-100 py-1.5 last:border-0">
            <h4 className="font-medium text-xs">{n.title}</h4>
            <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{n.txt}</p>
            <span className="text-[10px] text-gray-400">{fmtDate(n.at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



function OrdersView({ data, user, lang, getFilteredOrders, openOrderModal, setView }: any) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');

  let orders = getFilteredOrders();
  if (search) {
    const s = search.toLowerCase();
    orders = orders.filter((o: Order) => {
      const patient = (data.patients || []).find((p: Patient) => p.id === o.patientId);
      return o.num.toLowerCase().includes(s) || patient?.fio.toLowerCase().includes(s) || o.positions[0]?.name.toLowerCase().includes(s);
    });
  }
  if (statusFilter) orders = orders.filter((o: Order) => o.status === statusFilter);
  if (catFilter) orders = orders.filter((o: Order) => o.category === catFilter);

  const canCreate = ['doctor','doctor_myort','admin'].includes(user.role);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2 mb-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, 'search')} className="flex-1 min-w-[150px] px-2 py-1.5 border rounded text-xs" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-2 py-1.5 border rounded text-xs">
          <option value="">{t(lang, 'allStatuses')}</option>
          {Object.entries(STATUS_NAMES).map(([k,v]) => <option key={k} value={k}>{t(lang, k as any) || v}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-2 py-1.5 border rounded text-xs">
          <option value="">{t(lang, 'allCategories')}</option>
          <option value="ЗТЛ">{t(lang, 'cat_ztl')}</option>
          <option value="Гнатология">{t(lang, 'cat_gnatology')}</option>
          <option value="Ремонтные работы">{t(lang, 'cat_repair')}</option>
          <option value="Гарантия">{t(lang, 'cat_guarantee')}</option>
        </select>
        {canCreate && <button onClick={() => setView('new-order')} className="btn-primary">➕ {t(lang, 'newOrder')}</button>}
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setViewMode('list')} className={`px-2.5 py-1 rounded text-xs ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-white border'}`}>📋 {t(lang, 'list')}</button>
        <button onClick={() => setViewMode('kanban')} className={`px-2.5 py-1 rounded text-xs ${viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'bg-white border'}`}>📊 {t(lang, 'conveyor')}</button>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-auto flex-1">
          <table className="w-full compact-table">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'number')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'patient')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'service')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'type')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'status')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'amount')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium">{t(lang, 'dueDate')}</th>
                <th className="px-2 py-1.5 text-left text-xs font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => {
                const patient = (data.patients || []).find((p: Patient) => p.id === order.patientId);
                const total = order.positions.reduce((s, p) => s + p.price, 0);
                return (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-1.5 font-medium text-xs">{order.num}</td>
                    <td className="px-2 py-1.5 text-xs">{patient?.fio || '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{order.positions[0]?.name || '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{order.type}</td>
                    <td className="px-2 py-1.5"><span className="px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ backgroundColor: STATUS_COLORS[order.status] }}>{t(lang, order.status as any) || STATUS_NAMES[order.status]}</span></td>
                    <td className="px-2 py-1.5 text-xs">{total.toLocaleString()} ₽</td>
                    <td className="px-2 py-1.5 text-xs">{order.dueDate}</td>
                    <td className="px-2 py-1.5"><button onClick={() => openOrderModal(order)} className="text-cyan-600 hover:underline text-xs">{t(lang, 'open')}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && <div className="p-4 text-center text-gray-400 text-xs">{t(lang, 'noData')}</div>}
        </div>
      ) : (
        <div className="flex-1 overflow-auto kanban-scroll bg-white rounded-lg shadow-sm p-2">
          <div className="flex gap-2 h-full">
            {Object.entries(STATUS_NAMES).map(([status, name]) => {
              const so = orders.filter((o: Order) => o.status === status);
              if (so.length === 0) return null;
              return (
                <div key={status} className="min-w-[200px] max-w-[200px] bg-gray-50 rounded p-2 flex-shrink-0">
                  <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }}></span>
                    <span className="truncate">{t(lang, status as any) || name} ({so.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {so.map((order: Order) => {
                      const patient = (data.patients || []).find((p: Patient) => p.id === order.patientId);
                      return (
                        <div key={order.id} onClick={() => openOrderModal(order)}
                          className="bg-white rounded p-2 cursor-pointer border-l-3 hover:shadow-md"
                          style={{ borderLeftWidth: '3px', borderLeftColor: STATUS_COLORS[status] }}>
                          <div className="font-bold text-xs">{order.num}</div>
                          <div className="text-[11px] text-gray-600 truncate">{patient?.fio}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderModal({ order: initOrder, data, user, updateData, toast, closeModal, refreshOrder }: any) {
  const [order, setOrder] = useState<Order>(initOrder);
  const [tab, setTab] = useState('info');
  const [commentText, setCommentText] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = user.role;
  const canAdmin = ['admin','admin_ztl','manager_support'].includes(role);
  const isDoctor = ['doctor','doctor_myort'].includes(role);
  const isQuality = role === 'quality';
  const isTech = ['cadcam','keramist','gips','print3d','tech_phys','scan'].includes(role);
  const isAdmin = role === 'admin';
  const patient = (data.patients || []).find((p: Patient) => p.id === order.patientId);
  const doctor = (data.users || []).find((u: User) => u.id === order.doctorId);
  const totalAmount = order.positions.reduce((s: number, p: any) => s + p.price, 0);
  const totalFees = order.positions.reduce((s: number, p: any) => s + p.ops.reduce((os: number, o: any) => os + (o.fee || 0), 0), 0);

  const refreshOrderLocal = (id: string) => {
    const o = data.orders.find((x: Order) => x.id === id);
    if (o) setOrder({...o});
    refreshOrder(id);
  };

  const transition = (newStatus: string, reason?: string) => {
    updateData((d: AppData) => {
      const o = d.orders.find(x => x.id === order.id);
      if (!o) return d;
      const oldStatus = o.status;
      o.status = newStatus;
      if (reason) o.returnReason = reason;
      if (['approve','production','handover'].includes(oldStatus) && ['correction','returned'].includes(newStatus)) {
        o.corrections += 1;
      }
      if (newStatus === 'done') o.completedAt = Date.now();
      o.history.push({ at: Date.now(), by: user.id, txt: `Статус: ${STATUS_NAMES[oldStatus]} → ${STATUS_NAMES[newStatus]}${reason ? '. Причина: ' + reason : ''}` });
      return {...d};
    });
    refreshOrderLocal(order.id);
    toast(`Статус: ${STATUS_NAMES[newStatus]}`);
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    updateData((d: AppData) => {
      const o = d.orders.find(x => x.id === order.id);
      if (!o) return d;
      o.comments.push({ by: user.id, role: user.role, at: Date.now(), txt: commentText });
      o.history.push({ at: Date.now(), by: user.id, txt: `Комментарий: ${commentText}` });
      return {...d};
    });
    setCommentText('');
    refreshOrderLocal(order.id);
  };

  const toggleOpFlag = (posId: string, opId: string, flag: 'done' | 'proddone' | 'docOk') => {
    updateData((d: AppData) => {
      const o = d.orders.find(x => x.id === order.id);
      if (!o) return d;
      const pos = o.positions.find(p => p.id === posId);
      if (!pos) return d;
      const op = pos.ops.find((x: WorkItem) => x.id === opId);
      if (!op) return d;
      (op as any)[flag] = !(op as any)[flag];
      if ((op as any)[flag] && !op.completedAt) op.completedAt = Date.now();
      if (flag === 'proddone' && (op as any)[flag]) {
        const wt = d.workTypes.find(w => w.id === op.wtId);
        if (wt?.materials) {
          for (const mu of wt.materials) {
            const mat = d.materials.find(m => m.id === mu.matId);
            if (mat) {
              const consumed = mu.qtyPerUnit * pos.qty;
              if (mat.currentStock >= consumed) {
                mat.currentStock -= consumed;
                op.mats.push({ matId: mu.matId, qty: consumed, at: Date.now(), orderId: order.id });
                d.materialUsage.push({ matId: mu.matId, qty: consumed, at: Date.now(), orderId: order.id });
              } else {
                toast(`Недостаточно: ${mat.name}`, 'error');
              }
            }
          }
        }
      }
      o.history.push({ at: Date.now(), by: user.id, txt: `${flag === 'done' ? 'CAD' : flag === 'proddone' ? 'Произв.' : 'Согласование'} ${op.name}: ${(op as any)[flag] ? '✓' : '✗'}` });
      return {...d};
    });
    refreshOrderLocal(order.id);
  };

  const assignTech = (posId: string, opId: string, techId: string) => {
    updateData((d: AppData) => {
      const o = d.orders.find(x => x.id === order.id);
      if (!o) return d;
      const pos = o.positions.find(p => p.id === posId);
      if (!pos) return d;
      const op = pos.ops.find((x: WorkItem) => x.id === opId);
      if (!op) return d;
      op.techId = techId;
      o.history.push({ at: Date.now(), by: user.id, txt: `Назначен техник: ${d.users.find(u => u.id === techId)?.name}` });
      return {...d};
    });
    refreshOrderLocal(order.id);
    toast('Техник назначен');
  };

  const updateFee = (posId: string, opId: string, fee: number) => {
    updateData((d: AppData) => {
      const o = d.orders.find(x => x.id === order.id);
      if (!o) return d;
      const pos = o.positions.find(p => p.id === posId);
      if (!pos) return d;
      const op = pos.ops.find((x: WorkItem) => x.id === opId);
      if (!op) return d;
      op.fee = fee;
      return {...d};
    });
    refreshOrderLocal(order.id);
  };

  const handleFileUpload = (files: FileList) => {
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = file.size < MAX_FILE_SIZE ? (e.target?.result as string) : null;
        updateData((d: AppData) => {
          const o = d.orders.find(x => x.id === order.id);
          if (!o) return d;
          o.files.push({ id: genId(), name: file.name, size: file.size, typeCat: 'other', dataUrl, by: user.id, at: Date.now() });
          o.history.push({ at: Date.now(), by: user.id, txt: `Загружен файл: ${file.name}` });
          return {...d};
        });
        refreshOrderLocal(order.id);
      };
      reader.readAsDataURL(file);
    }
    toast('Файлы загружены');
  };

  const renderActions = () => {
    const btns: React.ReactNode[] = [];
    const s = order.status;

    // Phase 2A: Quality check
    if (s === 'quality' && (isQuality || canAdmin)) {
      btns.push(<button key="a1" onClick={() => transition('accept')} className="btn-success">✓ Принять файлы</button>);
      btns.push(<button key="a2" onClick={() => setShowReturnDialog(true)} className="btn-warning">↩ Вернуть доктору</button>);
    }
    if (s === 'returned' && isDoctor) {
      btns.push(<button key="a3" onClick={() => transition('quality')} className="btn-primary">🔄 Повторная отправка</button>);
    }
    // Phase 2A: Accept decision
    if (s === 'accept' && canAdmin) {
      if (order.has_physical_impressions) {
        btns.push(<button key="a4" onClick={() => transition('gypsum')} className="btn-primary">Начать гипсовку</button>);
      } else {
        btns.push(<button key="a5" onClick={() => transition('admin_pricing')} className="btn-primary">Ценообразование</button>);
      }
    }
    // Phase 2A: Gypsum
    if (s === 'gypsum' && (role === 'gips' || canAdmin)) {
      btns.push(<button key="a6" onClick={() => transition('scanning')} className="btn-success">✓ Гипсовка завершена</button>);
    }
    // Phase 2A: Scanning
    if (s === 'scanning' && (role === 'scan' || canAdmin)) {
      btns.push(<button key="a7" onClick={() => transition('admin_pricing')} className="btn-success">✓ Сканирование завершено</button>);
    }
    // Phase 2A: Admin pricing
    if (s === 'admin_pricing' && canAdmin) {
      btns.push(<button key="a8" onClick={() => transition('payment')} className="btn-primary">Отправить на оплату</button>);
    }
    // Phase 2A: Payment
    if (s === 'payment' && canAdmin) {
      btns.push(<button key="a9" onClick={() => { updateData((d: AppData) => { const o = d.orders.find(x => x.id === order.id); if (o) { o.paid = true; o.history.push({ at: Date.now(), by: user.id, txt: 'Оплата подтверждена' }); } return {...d}; }); refreshOrderLocal(order.id); toast('Оплата подтверждена'); }} className="btn-success">💰 Подтвердить оплату</button>);
      btns.push(<button key="a10" onClick={() => transition('cadcam')} className="btn-primary">→ CAD/CAM</button>);
    }
    // Phase 2A: CAD/CAM
    if (s === 'cadcam' && (role === 'cadcam' || canAdmin)) {
      btns.push(<button key="a11" onClick={() => transition('approve')} className="btn-primary">На согласование доктору</button>);
    }
    // Phase 2A: Approve CAD/CAM
    if (s === 'approve' && isDoctor) {
      btns.push(<button key="a12" onClick={() => { order.positions.forEach(p => p.ops.forEach(o => { o.docOk = true; o.docOkAt = Date.now(); })); updateData((d: AppData) => d); transition(order.type === 'cadcam_only' ? 'closing' : 'production'); }} className="btn-success">✓ Согласовать</button>);
      btns.push(<button key="a13" onClick={() => setShowReturnDialog(true)} className="btn-warning">↩ В доработку</button>);
    }
    // Phase 2A: Production
    if (s === 'production' && (isTech || canAdmin)) {
      btns.push(<button key="a14" onClick={() => transition(order.type === 'full' ? 'delivery' : 'closing')} className="btn-success">✓ Производство завершено</button>);
    }
    // Phase 2A: Delivery
    if (s === 'delivery' && canAdmin) {
      btns.push(<button key="a15" onClick={() => { updateData((d: AppData) => { const o = d.orders.find(x => x.id === order.id); if (o) { o.sent = true; } return {...d}; }); transition('handover'); }} className="btn-primary">📦 Отправлено</button>);
    }
    // Phase 2A: Handover
    if (s === 'handover' && isDoctor) {
      btns.push(<button key="a16" onClick={() => transition('closing')} className="btn-success">✓ Работа сдана</button>);
      btns.push(<button key="a17" onClick={() => setShowReturnDialog(true)} className="btn-warning">↩ Не сдана</button>);
    }
    // Phase 2A: Closing
    if (s === 'closing' && canAdmin) {
      btns.push(<button key="a18" onClick={() => transition('done')} className="btn-success">✓ Закрыть заказ</button>);
    }
    // Phase 2B: Repair
    if (s === 'repair_approve' && canAdmin) {
      btns.push(<button key="a19" onClick={() => transition('payment')} className="btn-success">✓ Одобрить ремонт</button>);
      btns.push(<button key="a20" onClick={() => { setShowReturnDialog(true); }} className="btn-danger">✗ Отклонить</button>);
    }
    // Phase 2C: Guarantee
    if (s === 'guarantee_approve' && canAdmin) {
      btns.push(<button key="a21" onClick={() => transition('production')} className="btn-success">✓ Одобрить гарантию</button>);
      btns.push(<button key="a22" onClick={() => { setShowReturnDialog(true); }} className="btn-danger">✗ Отклонить</button>);
    }
    // Cancel
    if (!['done','cancelled'].includes(s) && (isDoctor || canAdmin)) {
      btns.push(<button key="a23" onClick={() => { if (confirm('Отменить заказ?')) transition('cancelled'); }} className="btn-danger">🗑 Отменить</button>);
    }
    // Print
    btns.push(<button key="a24" onClick={() => printOrder(order, data)} className="btn-outline">🖨 Печать</button>);

    return <div className="flex flex-wrap gap-2 mt-4">{btns}</div>;
  };

  return (
    <div>
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{order.num}</h3>
          <div className="flex gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full text-xs text-white" style={{ backgroundColor: STATUS_COLORS[order.status] }}>{STATUS_NAMES[order.status]}</span>
            {order.corrections > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">Коррекции: {order.corrections}</span>}
            {order.is_urgent && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">Срочный</span>}
            {order.has_physical_impressions && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">Слепки</span>}
          </div>
        </div>
        <button onClick={closeModal} className="text-2xl text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="flex border-b px-4">
        {['info','positions','files','chat','history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${tab === t ? 'border-cyan-600 text-cyan-600 font-medium' : 'border-transparent text-gray-500'}`}>
            {t === 'info' ? 'Информация' : t === 'positions' ? 'Позиции' : t === 'files' ? 'Файлы' : t === 'chat' ? 'Чат' : 'История'}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === 'info' && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><span className="text-gray-500 text-sm">Пациент:</span><p className="font-medium">{patient?.fio}</p></div>
              <div><span className="text-gray-500 text-sm">Доктор:</span><p className="font-medium">{doctor?.name}</p></div>
              <div><span className="text-gray-500 text-sm">Клиника:</span><p className="font-medium">{order.clinic}</p></div>
              <div><span className="text-gray-500 text-sm">Тип:</span><p className="font-medium">{order.type}</p></div>
              <div><span className="text-gray-500 text-sm">Срок сдачи:</span><p className="font-medium">{order.dueDate} {order.dueTime}</p></div>
              <div><span className="text-gray-500 text-sm">Оплата:</span><p className="font-medium">{order.paymentType === 'pre100' ? 'Предоплата 100%' : order.paymentType === 'pre50' ? 'Предоплата 50%' : order.paymentType === 'post100' ? 'Постоплата' : order.paymentType === 'internal' ? 'Внутренний' : 'Бесплатно'}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-3 rounded-lg">
              <div><span className="text-gray-500 text-sm">Услуги:</span><p className="font-bold">{totalAmount.toLocaleString()} ₽</p></div>
              <div><span className="text-gray-500 text-sm">Сделки:</span><p className="font-bold">{totalFees.toLocaleString()} ₽</p></div>
              <div><span className="text-gray-500 text-sm">Оплачено:</span><p className="font-bold">{order.paid ? '✓' : '✗'}</p></div>
            </div>
            {order.returnReason && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4"><p className="text-sm font-medium text-amber-800">Причина возврата:</p><p className="text-sm">{order.returnReason}</p></div>}
            {order.plan && <div className="mb-4"><h4 className="font-medium mb-1">План лечения:</h4><p className="text-sm text-gray-600">{order.plan}</p></div>}
            {renderActions()}
          </div>
        )}

        {tab === 'positions' && (
          <div>
            {order.positions.map((pos: any) => (
              <div key={pos.id} className="border rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">{pos.name} × {pos.qty}</h4>
                  <span className="font-bold">{pos.price.toLocaleString()} ₽</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Вид работы</th>
                      <th className="px-3 py-2 text-left">Техник</th>
                      <th className="px-3 py-2 text-left">Сделка</th>
                      <th className="px-3 py-2 text-center">CAD</th>
                      <th className="px-3 py-2 text-center">Произв.</th>
                      <th className="px-3 py-2 text-center">Соглас.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.ops.map((op: WorkItem) => (
                      <tr key={op.id} className="border-t">
                        <td className="px-3 py-2">{op.name}</td>
                        <td className="px-3 py-2">
                          {canAdmin ? (
                            <select value={op.techId} onChange={e => assignTech(pos.id, op.id, e.target.value)} className="text-xs border rounded px-1 py-0.5">
                              <option value="">—</option>
                              {(data.users || []).filter((u: User) => ['cadcam','keramist','gips','print3d','tech_phys','scan'].includes(u.role)).map((u: User) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          ) : <span className="text-xs">{(data.users || []).find((u: User) => u.id === op.techId)?.name || '—'}</span>}
                        </td>
                        <td className="px-3 py-2">
                          {canAdmin ? (
                            <input type="number" value={op.fee} onChange={e => updateFee(pos.id, op.id, Number(e.target.value))} className="w-20 text-xs border rounded px-1 py-0.5" />
                          ) : <span>{op.fee} ₽</span>}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={op.done} onChange={() => toggleOpFlag(pos.id, op.id, 'done')}
                            disabled={!['cadcam','admin'].includes(role) && !canAdmin} className="w-4 h-4" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={op.proddone} onChange={() => toggleOpFlag(pos.id, op.id, 'proddone')}
                            disabled={!['keramist','print3d','tech_phys','gips','scan','admin'].includes(role) && !canAdmin} className="w-4 h-4" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={op.docOk} onChange={() => toggleOpFlag(pos.id, op.id, 'docOk')}
                            disabled={!isDoctor && !canAdmin} className="w-4 h-4" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {tab === 'files' && (
          <div>
            <div className="mb-4">
              <input type="file" multiple ref={fileInputRef} onChange={e => e.target.files && handleFileUpload(e.target.files)} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">📎 Загрузить файлы</button>
            </div>
            <div className="space-y-2">
              {(order.files || []).map((file: OrderFile) => (
                <div key={file.id} className="flex justify-between items-center border rounded-lg p-3">
                  <div>
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{(file.size / 1024).toFixed(0)} KB • {file.typeCat}</span>
                  </div>
                  <div className="flex gap-2">
                    <select value={file.typeCat} onChange={e => { updateData((d: AppData) => { const o = d.orders.find(x => x.id === order.id); if (o) { const f = o.files.find(x => x.id === file.id); if (f) f.typeCat = e.target.value as any; } return {...d}; }); refreshOrderLocal(order.id); }}
                      className="text-xs border rounded px-2 py-1">
                      <option value="face">Фото лица</option><option value="photo">Фото</option><option value="ct">КТ</option><option value="scan">Скан</option><option value="video">Видео</option><option value="other">Другое</option>
                    </select>
                    {file.dataUrl && <a href={file.dataUrl} download={file.name} className="text-xs text-cyan-600 hover:underline">Скачать</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div>
            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {(order.comments || []).map((c: any, i: number) => {
                const author = (data.users || []).find((u: User) => u.id === c.by);
                return (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm text-cyan-600">{author?.name} <span className="text-gray-400 font-normal">({ROLE_LABELS[c.role]})</span></span>
                      <span className="text-xs text-gray-400">{fmtDateTime(c.at)}</span>
                    </div>
                    <p className="text-sm mt-1">{c.txt}</p>
                  </div>
                );
              })}
              {(!order.comments || order.comments.length === 0) && <p className="text-gray-400 text-sm">Нет комментариев</p>}
            </div>
            <div className="flex gap-2">
              <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Введите комментарий..." className="flex-1 px-3 py-2 border rounded-lg" onKeyDown={e => e.key === 'Enter' && addComment()} />
              <button onClick={addComment} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Отправить</button>
            </div>
            {isTech && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => setCommentText('Прошу согласовать цвет')} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Согласовать цвет</button>
                <button onClick={() => setCommentText('Прошу согласовать дизайн')} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">Согласовать дизайн</button>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-2">
            {(order.history || []).map((h: any, i: number) => {
              const author = (data.users || []).find((u: User) => u.id === h.by);
              return (
                <div key={i} className="flex gap-3 border-b border-gray-100 pb-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">{fmtDateTime(h.at)}</span>
                  <span className="text-xs font-medium text-gray-600">{author?.name}:</span>
                  <span className="text-sm">{h.txt}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showReturnDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-96">
            <h4 className="font-bold mb-3">Укажите причину возврата</h4>
            <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full border rounded-lg p-3 mb-3" rows={3} placeholder="Обязательное поле..." />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowReturnDialog(false); setReturnReason(''); }} className="px-4 py-2 border rounded-lg">Отмена</button>
              <button onClick={() => { if (!returnReason.trim()) { toast('Укажите причину', 'error'); return; } const targetStatus = order.status === 'quality' ? 'returned' : 'correction'; transition(targetStatus, returnReason); setShowReturnDialog(false); setReturnReason(''); }} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewOrderView({ data, user, lang, updateData, toast, setView }: any) {
  const [orderType, setOrderType] = useState<'full' | 'cadcam_only' | 'phys_only' | 'repair' | 'guarantee'>('full');
  const [patientId, setPatientId] = useState('');
  const [positions, setPositions] = useState<{svcId: string; name: string; qty: number; price: number; termDays: number; cat: string}[]>([]);
  const [hasImpressions, setHasImpressions] = useState(false);
  const [plan, setPlan] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('10:00');
  const [searchSvc, setSearchSvc] = useState('');
  const [showSvcList, setShowSvcList] = useState(false);
  const [repairDesc, setRepairDesc] = useState('');
  const [guaranteeOrderNum, setGuaranteeOrderNum] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({ fio: '', sex: 'мужской', bd: '', clinic: '' });

  
  const isAdmin = user.role === 'admin';
  const isDoctor = user.role === 'doctor' || user.role === 'doctor_myort';

  // Автоматическое определение типа заказа
  const detectedType = positions.length > 0 ? determineOrderType(positions.map(p => ({ svcId: p.svcId, cat: p.cat }))) : null;

  const filteredSvc = searchSvc.length > 1 ? (data.catalog || []).filter((s: any) => 
    s.name.toLowerCase().includes(searchSvc.toLowerCase()) || 
    s.cat.toLowerCase().includes(searchSvc.toLowerCase()) ||
    s.sub.toLowerCase().includes(searchSvc.toLowerCase())
  ).slice(0, 15) : [];
  const maxTermDays = positions.reduce((m, p) => Math.max(m, p.termDays), 0);
  const isOverdue = dueDate && maxTermDays > 0 && (new Date(dueDate).getTime() - Date.now()) / 86400000 < maxTermDays;

  const addPosition = (svc: any) => {
    setPositions([...positions, { svcId: svc.id, name: svc.name, qty: 1, price: svc.price || 0, termDays: svc.termDays || 0, cat: svc.sub || '' }]);
    setSearchSvc('');
    setShowSvcList(false);
  };

  const addNewPatient = () => {
    if (!newPatientData.fio || !newPatientData.bd) {
      toast(lang === 'ru' ? 'Заполните ФИО и дату рождения' : 'Fill in name and birth date', 'error');
      return;
    }
    const newId = genId();
    updateData((d: AppData) => {
      d.patients.push({ 
        id: newId, 
        fio: newPatientData.fio, 
        sex: newPatientData.sex, 
        bd: newPatientData.bd, 
        clinic: newPatientData.clinic || user.clinic || '', 
        doctors: isDoctor ? [user.id] : [] 
      });
      return { ...d };
    });
    setPatientId(newId);
    setShowNewPatient(false);
    setNewPatientData({ fio: '', sex: 'мужской', bd: '', clinic: '' });
    toast(lang === 'ru' ? 'Пациент создан' : 'Patient created');
  };

  const submitOrder = () => {
    if (!patientId && orderType !== 'repair' && orderType !== 'guarantee') { 
      toast(lang === 'ru' ? 'Выберите пациента' : lang === 'en' ? 'Select patient' : 'Науқасты таңдаңыз', 'error'); 
      return; 
    }
    if (positions.length === 0 && orderType !== 'repair' && orderType !== 'guarantee') { 
      toast(lang === 'ru' ? 'Добавьте хотя бы одну позицию' : lang === 'en' ? 'Add at least one position' : 'Кем дегенде бір позиция қосыңыз', 'error'); 
      return; 
    }

    const patient = (data.patients || []).find((p: Patient) => p.id === patientId);
    const totalPrice = positions.reduce((s, p) => s + p.price * p.qty, 0);
    
    // Автоматическое определение типа заказа для обычных заказов
    const actualType = (orderType === 'repair' || orderType === 'guarantee') ? orderType : (detectedType || 'full');

    const newOrder: Order = {
      id: genId(),
      num: orderType === 'repair' ? `RT-${Math.floor(Date.now()/1000)}` : `GT-${Math.floor(Date.now()/1000)}`,
      patientId: patientId,
      doctorId: user.id,
      clinic: patient?.clinic || user.clinic || '',
      category: orderType === 'repair' ? 'Ремонтные работы' : orderType === 'guarantee' ? 'Гарантия' : 'ЗТЛ',
      notesText: orderType === 'repair' ? repairDesc : orderType === 'guarantee' ? `Гарантия по заказу ${guaranteeOrderNum}` : '',
      positions: positions.map(p => ({
        id: genId(), name: p.name, svcId: p.svcId, cat: p.cat, qty: p.qty, price: p.price * p.qty,
        ops: []
      })),
      files: [],
      plan: plan,
      dueDate: dueDate || new Date(Date.now() + maxTermDays * 86400000).toISOString().split('T')[0],
      dueTime: dueTime,
      termDays: maxTermDays,
      status: orderType === 'repair' ? 'repair_create' : orderType === 'guarantee' ? 'guarantee_create' : 'quality',
      corrections: 0,
      paymentType: orderType === 'guarantee' ? 'free' : 'pre100',
      priceUndefined: totalPrice === 0,
      paid: false,
      freeApproved: false,
      address: '',
      sent: false, received: false, handed: false,
      finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: Date.now(), acceptedAt: null, completedAt: null,
      returnReason: '',
      comments: [],
      history: [{ at: Date.now(), by: user.id, txt: `Создан заказ (${actualType})` }],
      has_physical_impressions: hasImpressions,
      type: actualType,
      is_urgent: isUrgent,
      repairOrderNum: orderType === 'guarantee' ? guaranteeOrderNum : undefined,
      repairDescription: orderType === 'repair' ? repairDesc : undefined,
      guaranteeDescription: orderType === 'guarantee' ? repairDesc : undefined,
    };

    updateData((d: AppData) => { d.orders.push(newOrder); return {...d}; });
    toast(lang === 'ru' ? 'Заказ создан и отправлен в работу' : lang === 'en' ? 'Order created and sent to work' : 'Тапсырыс жасалды және жұмысқа жіберілді');
    setView('orders');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-4xl">
      <h3 className="text-lg font-bold mb-4">Создание нового заказа</h3>

      <div className="mb-4">
        <label className="font-medium text-sm block mb-2">Тип заказа:</label>
        <div className="flex flex-wrap gap-3">
          {[['full','Полный'],['cadcam_only','Только CAD/CAM'],['phys_only','Только физическое'],['repair','Ремонт'],['guarantee','Гарантия']].map(([v,l]) => (
            <label key={v} className={`px-4 py-2 border rounded-lg cursor-pointer ${orderType === v ? 'border-cyan-600 bg-cyan-50' : ''}`}>
              <input type="radio" name="type" value={v} checked={orderType === v} onChange={() => setOrderType(v as any)} className="mr-2" />
              {l}
            </label>
          ))}
        </div>
      </div>

      {(orderType === 'repair' || orderType === 'guarantee') && (
        <div className="mb-4 space-y-3">
          <div>
            <label className="font-medium text-sm block mb-1">Описание проблемы:</label>
            <textarea value={repairDesc} onChange={e => setRepairDesc(e.target.value)} className="w-full border rounded-lg p-3" rows={3} />
          </div>
          {orderType === 'guarantee' && (
            <div>
              <label className="font-medium text-sm block mb-1">Номер заказа (или "вне ЛК"):</label>
              <input type="text" value={guaranteeOrderNum} onChange={e => setGuaranteeOrderNum(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
          )}
          <div>
            <label className="font-medium text-sm block mb-1">Пациент:</label>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full border rounded-lg p-2">
              <option value="">Выберите пациента</option>
              {(data.patients || []).filter((p: Patient) => {
                // Доктор видит только своих пациентов
                if (isDoctor && !isAdmin) {
                  return p.doctors.includes(user.id);
                }
                return true;
              }).map((p: Patient) => <option key={p.id} value={p.id}>{p.fio}</option>)}
            </select>
          </div>
        </div>
      )}

      {orderType !== 'repair' && orderType !== 'guarantee' && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-sm">{t(lang, 'patient')}:</label>
              <button onClick={() => setShowNewPatient(true)} className="text-xs text-cyan-600 hover:underline">+ {t(lang, 'newPatient')}</button>
            </div>
            <select value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
              <option value="">{lang === 'ru' ? 'Выберите пациента' : lang === 'en' ? 'Select patient' : 'Науқасты таңдаңыз'}</option>
              {(data.patients || []).filter((p: Patient) => {
                // Доктор видит только своих пациентов
                if (isDoctor && !isAdmin) {
                  return p.doctors.includes(user.id);
                }
                return true;
              }).map((p: Patient) => <option key={p.id} value={p.id}>{p.fio} ({p.clinic})</option>)}
            </select>
          </div>

          {showNewPatient && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 w-full max-w-sm">
                <h4 className="text-sm font-bold mb-3">{t(lang, 'newPatient')}</h4>
                <div className="space-y-2">
                  <input type="text" placeholder={t(lang, 'fio')} value={newPatientData.fio} onChange={e => setNewPatientData({ ...newPatientData, fio: e.target.value })} className="input-field text-xs" />
                  <select value={newPatientData.sex} onChange={e => setNewPatientData({ ...newPatientData, sex: e.target.value })} className="input-field text-xs">
                    <option value="мужской">{t(lang, 'male')}</option>
                    <option value="женский">{t(lang, 'female')}</option>
                  </select>
                  <input type="date" value={newPatientData.bd} onChange={e => setNewPatientData({ ...newPatientData, bd: e.target.value })} className="input-field text-xs" />
                  <input type="text" placeholder={t(lang, 'clinic')} value={newPatientData.clinic} onChange={e => setNewPatientData({ ...newPatientData, clinic: e.target.value })} className="input-field text-xs" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={addNewPatient} className="btn-primary flex-1">{t(lang, 'save')}</button>
                  <button onClick={() => setShowNewPatient(false)} className="btn-outline flex-1">{t(lang, 'cancel')}</button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-sm">{lang === 'ru' ? 'Поиск услуги' : lang === 'en' ? 'Search service' : 'Қызметті іздеу'}:</label>
            </div>
            <input type="text" value={searchSvc} onChange={e => { setSearchSvc(e.target.value); setShowSvcList(true); }} className="w-full border rounded-lg p-2 text-sm" placeholder={lang === 'ru' ? 'Начните вводить название, категорию...' : lang === 'en' ? 'Start typing name, category...' : 'Атауын, санатын теріңіз...'} />
            {showSvcList && filteredSvc.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredSvc.map((s: any) => (
                  <div key={s.id} onClick={() => addPosition(s)} className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b text-xs">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-gray-500">{s.cat} → {s.sub} | {s.price ? s.price.toLocaleString() + ' ₽' : lang === 'ru' ? 'По запросу' : 'On request'} | {s.term}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Показываем определённый тип заказа */}
          {detectedType && positions.length > 0 && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <span className="font-medium">{t(lang, 'autoDetectType')}:</span>
              <span className="ml-2 text-blue-700">
                {detectedType === 'full' && (lang === 'ru' ? 'Полный маршрут' : lang === 'en' ? 'Full route' : 'Толық маршрут')}
                {detectedType === 'cadcam_only' && (lang === 'ru' ? 'Только CAD/CAM' : lang === 'en' ? 'CAD/CAM only' : 'Тек CAD/CAM')}
                {detectedType === 'phys_only' && (lang === 'ru' ? 'Только физическое' : lang === 'en' ? 'Physical only' : 'Тек физикалық')}
              </span>
            </div>
          )}

          {positions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Позиции ({positions.length}/15):</h4>
              {positions.map((p, i) => (
                <div key={i} className="flex items-center gap-3 border rounded-lg p-3 mb-2">
                  <span className="flex-1 text-sm">{p.name}</span>
                  <input type="number" value={p.qty} min={1} onChange={e => { const np = [...positions]; np[i].qty = Number(e.target.value); setPositions(np); }} className="w-16 border rounded px-2 py-1 text-sm" />
                  <span className="text-sm font-medium">{(p.price * p.qty).toLocaleString()} ₽</span>
                  <span className="text-xs text-gray-400">{p.termDays} дн.</span>
                  <button onClick={() => setPositions(positions.filter((_, j) => j !== i))} className="text-red-500 text-sm">✗</button>
                </div>
              ))}
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasImpressions} onChange={e => setHasImpressions(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">Физические слепки отправлены</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="font-medium text-sm block mb-1">План лечения:</label>
            <textarea value={plan} onChange={e => setPlan(e.target.value)} className="w-full border rounded-lg p-3" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-medium text-sm block mb-1">Дата сдачи:</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="font-medium text-sm block mb-1">Время:</label>
              <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
          </div>

          {isOverdue && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">⚠️ Указанная дата нарушает регламентный срок ({maxTermDays} дн.).</p>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Оформить срочность (+30%)</span>
              </label>
            </div>
          )}
        </>
      )}

      <button onClick={submitOrder} className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700">
        Отправить заказ в работу
      </button>
    </div>
  );
}

function CatalogView({ data, user, lang, updateData, toast }: any) {
  const canEdit = user.role === 'admin';
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', cat: 'ЗТЛ', sub: '', price: 0, term: '', termDays: 0 });
  
  const grouped: Record<string, Record<string, any[]>> = {};
  (data.catalog || []).forEach((s: any) => {
    if (!grouped[s.cat]) grouped[s.cat] = {};
    if (!grouped[s.cat][s.sub]) grouped[s.cat][s.sub] = [];
    grouped[s.cat][s.sub].push(s);
  });

  const addService = () => {
    if (!newService.name) { 
      toast(lang === 'ru' ? 'Введите название услуги' : lang === 'en' ? 'Enter service name' : 'Қызмет атауын енгізіңіз', 'error'); 
      return; 
    }
    updateData((d: AppData) => {
      d.catalog.push({ 
        id: genId(), 
        name: newService.name, 
        cat: newService.cat, 
        sub: newService.sub, 
        price: newService.price || null, 
        term: newService.term || `${newService.termDays} ${lang === 'ru' ? 'дн.' : lang === 'en' ? 'days' : 'күн'}`, 
        termDays: newService.termDays 
      });
      return { ...d };
    });
    toast(lang === 'ru' ? 'Услуга добавлена' : lang === 'en' ? 'Service added' : 'Қызмет қосылды');
    setShowAddService(false);
    setNewService({ name: '', cat: 'ЗТЛ', sub: '', price: 0, term: '', termDays: 0 });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'catalog')}</h3>
        {canEdit && (
          <button onClick={() => setShowAddService(true)} className="btn-primary">
            + {t(lang, 'addNewService')}
          </button>
        )}
      </div>
      
      {showAddService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h4 className="text-sm font-bold mb-3">{t(lang, 'addNewService')}</h4>
            <div className="space-y-2">
              <input type="text" placeholder={t(lang, 'serviceName')} value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} className="input-field text-xs" />
              <select value={newService.cat} onChange={e => setNewService({ ...newService, cat: e.target.value })} className="input-field text-xs">
                <option value="ЗТЛ">{t(lang, 'cat_ztl')}</option>
                <option value="Гнатология">{t(lang, 'cat_gnatology')}</option>
                <option value="Ремонтные работы">{t(lang, 'cat_repair')}</option>
              </select>
              <input type="text" placeholder={t(lang, 'serviceSubcategory')} value={newService.sub} onChange={e => setNewService({ ...newService, sub: e.target.value })} className="input-field text-xs" />
              <input type="number" placeholder={t(lang, 'servicePrice')} value={newService.price} onChange={e => setNewService({ ...newService, price: Number(e.target.value) })} className="input-field text-xs" />
              <input type="text" placeholder={t(lang, 'serviceTerm')} value={newService.term} onChange={e => setNewService({ ...newService, term: e.target.value })} className="input-field text-xs" />
              <input type="number" placeholder={t(lang, 'serviceTermDays')} value={newService.termDays} onChange={e => setNewService({ ...newService, termDays: Number(e.target.value) })} className="input-field text-xs" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addService} className="btn-primary flex-1">{t(lang, 'save')}</button>
              <button onClick={() => setShowAddService(false)} className="btn-outline flex-1">{t(lang, 'cancel')}</button>
            </div>
          </div>
        </div>
      )}
      {Object.entries(grouped).map(([cat, subs]) => (
        <div key={cat} className="mb-6">
          <h4 className="font-semibold text-cyan-600 mb-2">{cat}</h4>
          {Object.entries(subs).map(([sub, items]) => (
            <div key={sub} className="mb-4">
              <h5 className="text-sm font-medium text-gray-600 mb-2">{sub}</h5>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">{lang === 'ru' ? 'Наименование' : lang === 'en' ? 'Name' : 'Атауы'}</th>
                    <th className="px-3 py-2 text-left">{t(lang, 'price')}</th>
                    <th className="px-3 py-2 text-left">{lang === 'ru' ? 'Срок' : lang === 'en' ? 'Term' : 'Мерзімі'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(items as any[]).map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{canEdit ? <input type="number" value={s.price || ''} onChange={e => { updateData((d: AppData) => { const item = d.catalog.find(x => x.id === s.id); if (item) item.price = e.target.value ? Number(e.target.value) : null; return {...d}; }); }} className="w-24 border rounded px-1 text-xs" /> : (s.price ? s.price.toLocaleString() + ' ₽' : (lang === 'ru' ? 'По запросу' : lang === 'en' ? 'On request' : 'Сұрау бойынша'))}</td>
                      <td className="px-3 py-2">{canEdit ? <input type="text" value={s.term} onChange={e => { updateData((d: AppData) => { const item = d.catalog.find(x => x.id === s.id); if (item) item.term = e.target.value; return {...d}; }); }} className="w-28 border rounded px-1 text-xs" /> : s.term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function PatientsView({ data, user, lang, updateData, toast }: any) {
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ fio: '', sex: 'мужской', bd: '', clinic: '', doctors: [] as string[] });
  
  const isAdmin = user.role === 'admin' || user.role === 'admin_ztl';
  const isDoctor = user.role === 'doctor' || user.role === 'doctor_myort';

  const addPatient = () => {
    if (!newPatient.fio || !newPatient.bd) {
      toast(lang === 'ru' ? 'Заполните ФИО и дату рождения' : lang === 'en' ? 'Fill in name and birth date' : 'Аты-жөні мен туған күнін толтырыңыз', 'error');
      return;
    }
    
    // Если доктор - может указать только себя
    let patientDoctors = newPatient.doctors;
    if (isDoctor && !isAdmin) {
      patientDoctors = [user.id];
    }
    
    updateData((d: AppData) => {
      d.patients.push({ ...newPatient, doctors: patientDoctors, id: genId() });
      return { ...d };
    });
    toast(lang === 'ru' ? 'Пациент добавлен' : lang === 'en' ? 'Patient added' : 'Науқас қосылды');
    setShowAddPatient(false);
    setNewPatient({ fio: '', sex: 'мужской', bd: '', clinic: '', doctors: [] });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'patients')}</h3>
        <button onClick={() => setShowAddPatient(true)} className="btn-primary">{t(lang, 'addPatient')}</button>
      </div>
      
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h4 className="text-sm font-bold mb-3">{t(lang, 'newPatient')}</h4>
            <div className="space-y-2">
              <input type="text" placeholder={t(lang, 'fio')} value={newPatient.fio} onChange={e => setNewPatient({ ...newPatient, fio: e.target.value })} className="input-field text-xs" />
              <select value={newPatient.sex} onChange={e => setNewPatient({ ...newPatient, sex: e.target.value })} className="input-field text-xs">
                <option value="мужской">{t(lang, 'male')}</option>
                <option value="женский">{t(lang, 'female')}</option>
              </select>
              <input type="date" value={newPatient.bd} onChange={e => setNewPatient({ ...newPatient, bd: e.target.value })} className="input-field text-xs" />
              <input type="text" placeholder={t(lang, 'clinic')} value={newPatient.clinic} onChange={e => setNewPatient({ ...newPatient, clinic: e.target.value })} className="input-field text-xs" />
              <div>
                <label className="text-xs font-medium mb-1 block">{t(lang, 'doctors')}:</label>
                {isAdmin ? (
                  // Админ может выбирать любых докторов
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {(data.users || []).filter((u: User) => ['doctor', 'doctor_myort'].includes(u.role)).map((u: User) => (
                      <label key={u.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={newPatient.doctors.includes(u.id)} onChange={e => {
                          if (e.target.checked) setNewPatient({ ...newPatient, doctors: [...newPatient.doctors, u.id] });
                          else setNewPatient({ ...newPatient, doctors: newPatient.doctors.filter(id => id !== u.id) });
                        }} />
                        {u.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  // Доктор видит только себя
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {user.name} ({lang === 'ru' ? 'автоматически' : lang === 'en' ? 'automatically' : 'автоматты'})
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={addPatient} className="btn-primary flex-1">{t(lang, 'save')}</button>
              <button onClick={() => setShowAddPatient(false)} className="btn-outline flex-1">{t(lang, 'cancel')}</button>
            </div>
          </div>
        </div>
      )}
      
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr><th className="px-3 py-2 text-left">{t(lang, 'fio')}</th><th className="px-3 py-2 text-left">{t(lang, 'sex')}</th><th className="px-3 py-2 text-left">{t(lang, 'birthDate')}</th><th className="px-3 py-2 text-left">{t(lang, 'clinic')}</th><th className="px-3 py-2 text-left">{t(lang, 'doctors')}</th><th className="px-3 py-2 text-left">{t(lang, 'orderCount')}</th></tr>
        </thead>
        <tbody>
          {(data.patients || []).filter((p: Patient) => {
            // Доктор видит только своих пациентов
            if (isDoctor && !isAdmin) {
              return p.doctors.includes(user.id);
            }
            return true;
          }).map((p: Patient) => {
            const doctors = p.doctors.map(id => (data.users || []).find((u: User) => u.id === id)?.name || '').join(', ');
            const orderCount = (data.orders || []).filter((o: Order) => o.patientId === p.id).length;
            return (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{p.fio}</td>
                <td className="px-3 py-2">{p.sex}</td>
                <td className="px-3 py-2">{p.bd}</td>
                <td className="px-3 py-2">{p.clinic}</td>
                <td className="px-3 py-2 text-xs">{doctors}</td>
                <td className="px-3 py-2">{orderCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MaterialsView({ data, user, lang, updateData, toast }: any) {
  const isAdmin = user.role === 'admin';
  const [tab, setTab] = useState<'nom' | 'income' | 'report'>('nom');
  const [incomeMat, setIncomeMat] = useState('');
  const [incomeQty, setIncomeQty] = useState(1);
  const [incomePrice, setIncomePrice] = useState(0);
  const [incomeNote, setIncomeNote] = useState('');
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0,7));
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMat, setNewMat] = useState({ name: '', unit: 'шт', costPerUnit: 0, currentStock: 0, minStock: 5 });

  const addIncome = () => {
    if (!incomeMat || incomeQty <= 0) { toast('Заполните поля', 'error'); return; }
    updateData((d: AppData) => {
      const mat = d.materials.find(m => m.id === incomeMat);
      if (mat) mat.currentStock += incomeQty;
      d.stockIn.push({ id: genId(), matId: incomeMat, qty: incomeQty, price: incomePrice, at: Date.now(), note: incomeNote });
      return {...d};
    });
    toast('Приход добавлен');
    setIncomeMat(''); setIncomeQty(1); setIncomePrice(0); setIncomeNote('');
  };

  const addMaterial = () => {
    if (!newMat.name) { toast('Укажите название', 'error'); return; }
    updateData((d: AppData) => {
      d.materials.push({ id: genId(), ...newMat });
      return {...d};
    });
    toast('Материал добавлен');
    setShowAddMaterial(false);
    setNewMat({ name: '', unit: 'шт', costPerUnit: 0, currentStock: 0, minStock: 5 });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Материалы</h3>
        {isAdmin && <button onClick={() => setShowAddMaterial(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">+ Добавить материал</button>}
      </div>

      <div className="flex gap-2 mb-4">
        {(['nom','income','report'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm ${tab === t ? 'bg-cyan-600 text-white' : 'bg-gray-100'}`}>
            {t === 'nom' ? 'Номенклатура' : t === 'income' ? 'Приход' : 'Отчёт за месяц'}
          </button>
        ))}
      </div>

      {tab === 'nom' && (
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Название</th><th className="px-3 py-2 text-left">Ед.</th><th className="px-3 py-2 text-left">Остаток</th><th className="px-3 py-2 text-left">Цена</th><th className="px-3 py-2 text-left">Мин.</th></tr></thead>
          <tbody>
            {(data.materials || []).map((m: Material) => (
              <tr key={m.id} className={`border-t ${m.currentStock <= m.minStock ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2">{isAdmin ? <input type="text" value={m.name} onChange={e => updateData((d: AppData) => { const mat = d.materials.find(x => x.id === m.id); if (mat) mat.name = e.target.value; return {...d}; })} className="border rounded px-1 text-xs w-40" /> : m.name}</td>
                <td className="px-3 py-2">{m.unit}</td>
                <td className="px-3 py-2 font-medium">{m.currentStock}</td>
                <td className="px-3 py-2">{isAdmin ? <input type="number" value={m.costPerUnit} onChange={e => updateData((d: AppData) => { const mat = d.materials.find(x => x.id === m.id); if (mat) mat.costPerUnit = Number(e.target.value); return {...d}; })} className="border rounded px-1 text-xs w-20" /> : m.costPerUnit.toLocaleString()}</td>
                <td className="px-3 py-2">{m.minStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'income' && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium block mb-1">Материал:</label>
              <select value={incomeMat} onChange={e => setIncomeMat(e.target.value)} className="w-full border rounded-lg p-2">
                <option value="">Выберите</option>
                {(data.materials || []).map((m: Material) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Количество:</label>
              <input type="number" value={incomeQty} onChange={e => setIncomeQty(Number(e.target.value))} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Цена за ед.:</label>
              <input type="number" value={incomePrice} onChange={e => setIncomePrice(Number(e.target.value))} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Примечание:</label>
              <input type="text" value={incomeNote} onChange={e => setIncomeNote(e.target.value)} className="w-full border rounded-lg p-2" />
            </div>
          </div>
          <button onClick={addIncome} className="px-4 py-2 bg-cyan-600 text-white rounded-lg mb-4">Добавить приход</button>

          <h4 className="font-medium mb-2">История прихода:</h4>
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Материал</th><th className="px-3 py-2 text-left">Кол-во</th><th className="px-3 py-2 text-left">Цена</th><th className="px-3 py-2 text-left">Дата</th><th className="px-3 py-2 text-left">Примечание</th></tr></thead>
            <tbody>
              {(data.stockIn || []).map((si: any) => {
                const mat = (data.materials || []).find((m: Material) => m.id === si.matId);
                return (
                  <tr key={si.id} className="border-t">
                    <td className="px-3 py-2">{mat?.name}</td>
                    <td className="px-3 py-2">{si.qty}</td>
                    <td className="px-3 py-2">{si.price.toLocaleString()}</td>
                    <td className="px-3 py-2">{fmtDate(si.at)}</td>
                    <td className="px-3 py-2">{si.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'report' && (
        <div>
          <div className="flex gap-4 mb-4">
            <input type="month" value={reportMonth} onChange={e => setReportMonth(e.target.value)} className="border rounded-lg p-2" />
            <button onClick={() => exportCSV(data, reportMonth)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">📥 CSV</button>
          </div>
          <MaterialReport data={data} month={reportMonth} />
        </div>
      )}

      {showAddMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-6 w-96">
            <h4 className="font-bold mb-3">Добавить материал</h4>
            <div className="space-y-3">
              <input type="text" value={newMat.name} onChange={e => setNewMat({...newMat, name: e.target.value})} placeholder="Название" className="w-full border rounded-lg p-2" />
              <input type="text" value={newMat.unit} onChange={e => setNewMat({...newMat, unit: e.target.value})} placeholder="Единица измерения" className="w-full border rounded-lg p-2" />
              <input type="number" value={newMat.costPerUnit} onChange={e => setNewMat({...newMat, costPerUnit: Number(e.target.value)})} placeholder="Цена за ед." className="w-full border rounded-lg p-2" />
              <input type="number" value={newMat.currentStock} onChange={e => setNewMat({...newMat, currentStock: Number(e.target.value)})} placeholder="Текущий остаток" className="w-full border rounded-lg p-2" />
              <input type="number" value={newMat.minStock} onChange={e => setNewMat({...newMat, minStock: Number(e.target.value)})} placeholder="Минимальный остаток" className="w-full border rounded-lg p-2" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowAddMaterial(false)} className="px-4 py-2 border rounded-lg">Отмена</button>
              <button onClick={addMaterial} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialReport({ data, month }: { data: AppData; month: string }) {
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(year, monthNum - 1, 1).getTime();
  const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

  const monthIncome = (data.stockIn || []).filter(si => si.at >= start && si.at <= end);
  const monthUsage = (data.materialUsage || []).filter(mu => mu.at >= start && mu.at <= end);

  const matReport: Record<string, { name: string; unit: string; income: number; usage: number; costPerUnit: number }> = {};
  (data.materials || []).forEach((m: Material) => {
    matReport[m.id] = { name: m.name, unit: m.unit, income: 0, usage: 0, costPerUnit: m.costPerUnit };
  });
  monthIncome.forEach(si => { if (matReport[si.matId]) matReport[si.matId].income += si.qty; });
  monthUsage.forEach(mu => { if (matReport[mu.matId]) matReport[mu.matId].usage += mu.qty; });

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Материал</th><th className="px-3 py-2 text-left">Приход</th><th className="px-3 py-2 text-left">Расход</th><th className="px-3 py-2 text-left">Себестоимость расхода</th></tr></thead>
      <tbody>
        {Object.entries(matReport).map(([id, r]) => (
          <tr key={id} className="border-t">
            <td className="px-3 py-2">{r.name}</td>
            <td className="px-3 py-2">{r.income} {r.unit}</td>
            <td className="px-3 py-2">{r.usage.toFixed(2)} {r.unit}</td>
            <td className="px-3 py-2">{(r.usage * r.costPerUnit).toLocaleString()} ₽</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WorkTypesView({ data, user, updateData, toast }: any) {
  const addWt = () => {
    const name = prompt('Название вида работы:');
    if (name) {
      updateData((d: AppData) => { d.workTypes.push({ id: genId(), name, defPrice: 0, timeNorm: 60, materials: [] }); return {...d}; });
      toast('Вид работы добавлен');
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Виды работ</h3>
      <table className="w-full text-sm">
        <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Название</th><th className="px-3 py-2 text-left">Реком. цена</th><th className="px-3 py-2 text-left">Время (мин)</th><th className="px-3 py-2 text-left">Материалы</th></tr></thead>
        <tbody>
          {(data.workTypes || []).map((wt: any) => (
            <tr key={wt.id} className="border-t">
              <td className="px-3 py-2"><input type="text" value={wt.name} onChange={e => updateData((d: AppData) => { const w = d.workTypes.find(x => x.id === wt.id); if (w) w.name = e.target.value; return {...d}; })} className="border rounded px-1 text-xs w-48" /></td>
              <td className="px-3 py-2"><input type="number" value={wt.defPrice} onChange={e => updateData((d: AppData) => { const w = d.workTypes.find(x => x.id === wt.id); if (w) w.defPrice = Number(e.target.value); return {...d}; })} className="border rounded px-1 text-xs w-24" /></td>
              <td className="px-3 py-2"><input type="number" value={wt.timeNorm} onChange={e => updateData((d: AppData) => { const w = d.workTypes.find(x => x.id === wt.id); if (w) w.timeNorm = Number(e.target.value); return {...d}; })} className="border rounded px-1 text-xs w-16" /></td>
              <td className="px-3 py-2 text-xs">{wt.materials?.map((m: any) => (data.materials || []).find((mat: Material) => mat.id === m.matId)?.name + ': ' + m.qtyPerUnit).join(', ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addWt} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg">+ Добавить</button>
    </div>
  );
}

function PieceworkView({ data, user, lang }: any) {
  const myOrders = (data.orders || []).filter((o: Order) => o.positions.some(p => p.ops.some((op: WorkItem) => op.techId === user.id)));
  const myOps = myOrders.flatMap((o: Order) => o.positions.flatMap(p => p.ops.filter((op: WorkItem) => op.techId === user.id)));
  const totalFee = myOps.reduce((s: number, op: WorkItem) => s + (op.fee || 0), 0);
  const completedOps = myOps.filter((op: WorkItem) => op.done || op.proddone);
  const completedFee = completedOps.reduce((s: number, op: WorkItem) => s + (op.fee || 0), 0);

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#0e7490' }}>
          <div className="text-lg font-bold text-cyan-600">{myOrders.length}</div>
          <div className="text-xs text-gray-500">{t(lang, 'orders')}</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#6366f1' }}>
          <div className="text-lg font-bold text-indigo-600">{myOps.length}</div>
          <div className="text-xs text-gray-500">{t(lang, 'workTypes')}</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#16a34a' }}>
          <div className="text-lg font-bold text-green-600">{totalFee.toLocaleString()} ₽</div>
          <div className="text-xs text-gray-500">{t(lang, 'fees')}</div>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="text-lg font-bold text-amber-600">{completedFee.toLocaleString()} ₽</div>
          <div className="text-xs text-gray-500">{t(lang, 'completed')}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <h3 className="font-bold text-sm mb-2">{t(lang, 'myWorks')}</h3>
        <table className="w-full compact-table">
          <thead className="bg-gray-50"><tr><th className="px-2 py-1.5 text-left text-xs">{t(lang, 'number')}</th><th className="px-2 py-1.5 text-left text-xs">{t(lang, 'workTypes')}</th><th className="px-2 py-1.5 text-left text-xs">{t(lang, 'fees')}</th><th className="px-2 py-1.5 text-left text-xs">{t(lang, 'status')}</th><th className="px-2 py-1.5 text-left text-xs">{t(lang, 'dueDate')}</th></tr></thead>
          <tbody>
            {myOrders.map((o: Order) => o.positions.flatMap(p => p.ops.filter((op: WorkItem) => op.techId === user.id).map(op => (
              <tr key={op.id} className="border-t">
                <td className="px-2 py-1.5 font-medium text-xs">{o.num}</td>
                <td className="px-2 py-1.5 text-xs">{op.name}</td>
                <td className="px-2 py-1.5 text-xs">{op.fee.toLocaleString()} ₽</td>
                <td className="px-2 py-1.5 text-xs">{op.done || op.proddone ? <span className="text-green-600">✓ {t(lang, 'completed')}</span> : <span className="text-amber-600">{t(lang, 'ordersInWork')}</span>}</td>
                <td className="px-2 py-1.5 text-xs">{fmtDate(op.assignedAt)}</td>
              </tr>
            ))))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsView({ data, user, toast }: any) {
  const [tab, setTab] = useState<'tech' | 'fees' | 'profit'>('tech');
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Отчёты</h3>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('tech')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'tech' ? 'bg-cyan-600 text-white' : 'bg-gray-100'}`}>По технику</button>
        <button onClick={() => setTab('fees')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'fees' ? 'bg-cyan-600 text-white' : 'bg-gray-100'}`}>Сделка техников</button>
        <button onClick={() => setTab('profit')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'profit' ? 'bg-cyan-600 text-white' : 'bg-gray-100'}`}>Прибыльность</button>
      </div>
      <div className="flex gap-4 mb-4">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="border rounded-lg p-2" />
        <button onClick={() => exportCSV(data, month)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">📥 CSV</button>
      </div>
      <ReportsContent data={data} tab={tab} month={month} />
    </div>
  );
}

function ReportsContent({ data, tab, month }: { data: AppData; tab: string; month: string }) {
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(year, monthNum - 1, 1).getTime();
  const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

  const techRoles = ['cadcam','keramist','gips','print3d','tech_phys','scan'];
  const techs = (data.users || []).filter((u: User) => techRoles.includes(u.role));

  if (tab === 'fees') {
    return (
      <table className="w-full text-sm">
        <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Техник</th><th className="px-3 py-2 text-left">Заказов</th><th className="px-3 py-2 text-left">Работ</th><th className="px-3 py-2 text-left">Сумма сделки</th></tr></thead>
        <tbody>
          {techs.map((tech: User) => {
            const ops = (data.orders || []).flatMap((o: Order) => o.positions.flatMap(p => p.ops.filter((op: WorkItem) => op.techId === tech.id && op.assignedAt >= start && op.assignedAt <= end)));
            const orderIds = new Set((data.orders || []).filter((o: Order) => o.positions.some(p => p.ops.some((op: WorkItem) => op.techId === tech.id && op.assignedAt >= start && op.assignedAt <= end))).map((o: Order) => o.id));
            return (
              <tr key={tech.id} className="border-t">
                <td className="px-3 py-2">{tech.name}</td>
                <td className="px-3 py-2">{orderIds.size}</td>
                <td className="px-3 py-2">{ops.length}</td>
                <td className="px-3 py-2">{ops.reduce((s, op) => s + (op.fee || 0), 0).toLocaleString()} ₽</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (tab === 'profit') {
    const internalOrders = (data.orders || []).filter((o: Order) => o.paymentType === 'internal' && o.completedAt && o.completedAt >= start && o.completedAt <= end);
    let totalRevenue = 0, totalFees = 0;
    return (
      <div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Заказ</th><th className="px-3 py-2 text-left">Выручка</th><th className="px-3 py-2 text-left">Сделки</th><th className="px-3 py-2 text-left">Прибыль</th></tr></thead>
          <tbody>
            {internalOrders.map((o: Order) => {
              const rev = o.positions.reduce((s, p) => s + p.price, 0);
              const fees = o.positions.reduce((s, p) => s + p.ops.reduce((os, op) => os + (op.fee || 0), 0), 0);
              totalRevenue += rev; totalFees += fees;
              return (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2">{o.num}</td>
                  <td className="px-3 py-2">{rev.toLocaleString()} ₽</td>
                  <td className="px-3 py-2">{fees.toLocaleString()} ₽</td>
                  <td className="px-3 py-2 font-medium">{(rev - fees).toLocaleString()} ₽</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-bold">
            <tr><td className="px-3 py-2">Итого</td><td className="px-3 py-2">{totalRevenue.toLocaleString()} ₽</td><td className="px-3 py-2">{totalFees.toLocaleString()} ₽</td><td className="px-3 py-2">{(totalRevenue - totalFees).toLocaleString()} ₽</td></tr>
          </tfoot>
        </table>
        {internalOrders.length === 0 && <p className="text-gray-400 text-sm mt-4">Нет внутренних заказов за этот период</p>}
      </div>
    );
  }

  return <p className="text-gray-400">Выберите техника и период для формирования отчёта</p>;
}

function GMAIView({ data, user, updateData, toast, openModal }: any) {
  const isAdmin = user.role === 'admin';
  const [selectedPatient, setSelectedPatient] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://api.gnatone.ai/v1/analyze');

  const generateReport = async () => {
    if (!selectedPatient) { toast('Выберите пациента', 'error'); return; }
    const patient = (data.patients || []).find((p: Patient) => p.id === selectedPatient);
    if (!patient) return;

    // Webhook call (placeholder - will be implemented later)
    toast('Отправка запроса к AI-сервису...');
    
    // Simulate webhook call
    setTimeout(() => {
      const patientOrders = (data.orders || []).filter((o: Order) => o.patientId === selectedPatient);
      const report: AIReport = {
        id: genId(),
        patientId: selectedPatient,
        doctorId: user.id,
        content: {
          diagnosis: 'На основании анализа истории пациента рекомендуется комплексное обследование',
          services: patientOrders.flatMap(o => o.positions.map(p => p.name)),
          plan: 'Продолжить наблюдение. При необходимости изготовить дополнительные конструкции.',
          recommendations: ['Контрольный осмотр через 6 месяцев', 'Панорамный снимок', 'Консультация ортодонта'],
          estimatedCost: patientOrders.reduce((s, o) => s + o.positions.reduce((ps, p) => ps + p.price, 0), 0),
          estimatedTerm: 14,
        },
        createdAt: Date.now(),
      };

      updateData((d: AppData) => { d.mirrorReports.push(report); return {...d}; });
      toast('AI-отчёт сгенерирован (webhook)');
    }, 1000);
  };

  const viewReport = (report: AIReport) => {
    const patient = (data.patients || []).find((p: Patient) => p.id === report.patientId);
    openModal(
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">AI-отчёт: {patient?.fio}</h3>
          <span className="text-sm text-gray-400">{fmtDateTime(report.createdAt)}</span>
        </div>
        <div className="space-y-4">
          <div><h4 className="font-medium text-cyan-600">Диагноз:</h4><p className="text-sm">{report.content.diagnosis}</p></div>
          <div><h4 className="font-medium text-cyan-600">Рекомендуемые услуги:</h4><ul className="list-disc list-inside text-sm">{report.content.services.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div><h4 className="font-medium text-cyan-600">План лечения:</h4><p className="text-sm">{report.content.plan}</p></div>
          <div><h4 className="font-medium text-cyan-600">Рекомендации:</h4><ul className="list-disc list-inside text-sm">{report.content.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
            <div><span className="text-gray-500 text-sm">Ориентировочная стоимость:</span><p className="font-bold">{report.content.estimatedCost.toLocaleString()} ₽</p></div>
            <div><span className="text-gray-500 text-sm">Ориентировочный срок:</span><p className="font-bold">{report.content.estimatedTerm} дн.</p></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">GnatoneMirror AI</h3>

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Настройки webhook</h4>
          <div className="mb-3">
            <label className="text-sm font-medium block mb-1">URL webhook:</label>
            <input type="text" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
            <p className="text-xs text-gray-500 mt-1">Webhook будет вызываться при генерации AI-отчётов</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>Базовый (мес): <strong>{(data.settings?.gmaiPrices?.basic_month || 9900).toLocaleString()} ₽</strong></div>
            <div>Базовый (год): <strong>{(data.settings?.gmaiPrices?.basic_year || 99000).toLocaleString()} ₽</strong></div>
            <div>Расширенный (мес): <strong>{(data.settings?.gmaiPrices?.extended_month || 19900).toLocaleString()} ₽</strong></div>
            <div>Расширенный (год): <strong>{(data.settings?.gmaiPrices?.extended_year || 199000).toLocaleString()} ₽</strong></div>
          </div>
          <div className="mt-3">
            <p className="text-sm font-medium">Активные подписки:</p>
            {(data.users || []).filter((u: User) => u.subscription?.active).map((u: User) => (
              <span key={u.id} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2 mt-1">
                {u.name}: {u.subscription?.tariff}/{u.subscription?.period}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="font-medium text-sm block mb-1">Выберите пациента для AI-отчёта:</label>
        <div className="flex gap-2">
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="flex-1 border rounded-lg p-2">
            <option value="">—</option>
            {(data.patients || []).map((p: Patient) => <option key={p.id} value={p.id}>{p.fio}</option>)}
          </select>
          <button onClick={generateReport} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">🤖 Сформировать</button>
        </div>
      </div>

      <h4 className="font-medium mb-2">История отчётов:</h4>
      <div className="space-y-2">
        {(data.mirrorReports || []).map((r: AIReport) => {
          const patient = (data.patients || []).find((p: Patient) => p.id === r.patientId);
          return (
            <div key={r.id} onClick={() => viewReport(r)} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 flex justify-between">
              <div>
                <span className="font-medium text-sm">{patient?.fio}</span>
                <span className="text-xs text-gray-400 ml-2">{fmtDate(r.createdAt)}</span>
              </div>
              <span className="text-xs text-cyan-600">Просмотр →</span>
            </div>
          );
        })}
        {(!data.mirrorReports || data.mirrorReports.length === 0) && <p className="text-gray-400 text-sm">Нет отчётов</p>}
      </div>
    </div>
  );
}

function UsersView({ data, user, lang, updateData, toast, openModal, closeModal }: any) {
  const addUser = () => {
    openModal(
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">{lang === 'ru' ? 'Добавить пользователя' : lang === 'en' ? 'Add user' : 'Пайдаланушы қосу'}</h3>
        <UserForm data={data} lang={lang} onSave={(u: User) => { updateData((d: AppData) => { d.users.push(u); return {...d}; }); toast(lang === 'ru' ? 'Пользователь добавлен' : 'User added'); closeModal(); }} onCancel={closeModal} />
      </div>
    );
  };

  const editPermissions = (userId: string) => {
    const u = (data.users || []).find((x: User) => x.id === userId);
    if (!u) return;
    
    openModal(
      <div className="p-6 max-w-2xl">
        <h3 className="text-lg font-bold mb-4">{u.name} - {lang === 'ru' ? 'Права доступа' : lang === 'en' ? 'Permissions' : 'Рұқсаттар'}</h3>
        <PermissionsForm user={u} lang={lang} onSave={(perms: UserPermissions) => {
          updateData((d: AppData) => {
            const usr = d.users.find(x => x.id === userId);
            if (usr) usr.permissions = perms;
            return {...d};
          });
          toast(lang === 'ru' ? 'Права обновлены' : 'Permissions updated');
          closeModal();
        }} onCancel={closeModal} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">{t(lang, 'users')}</h3>
        <button onClick={addUser} className="btn-primary">+ {lang === 'ru' ? 'Добавить' : lang === 'en' ? 'Add' : 'Қосу'}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50"><tr>
            <th className="px-2 py-1.5 text-left">{lang === 'ru' ? 'Имя' : lang === 'en' ? 'Name' : 'Аты'}</th>
            <th className="px-2 py-1.5 text-left">{t(lang, 'username')}</th>
            <th className="px-2 py-1.5 text-left">{lang === 'ru' ? 'Роль' : lang === 'en' ? 'Role' : 'Рөл'}</th>
            <th className="px-2 py-1.5 text-left">{t(lang, 'clinic')}</th>
            <th className="px-2 py-1.5 text-left">GMAI</th>
            <th className="px-2 py-1.5 text-left">Email</th>
            <th className="px-2 py-1.5 text-left">{t(lang, 'actions')}</th>
          </tr></thead>
          <tbody>
            {(data.users || []).map((u: User) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-1.5 font-medium">{u.name}</td>
                <td className="px-2 py-1.5">{u.login}</td>
                <td className="px-2 py-1.5">{ROLE_LABELS[u.role]}</td>
                <td className="px-2 py-1.5">{u.clinic || '—'}</td>
                <td className="px-2 py-1.5">{u.mirror ? '✓' : '—'}</td>
                <td className="px-2 py-1.5">{u.email || '—'}</td>
                <td className="px-2 py-1.5">
                  <button onClick={() => editPermissions(u.id)} className="text-cyan-600 hover:underline text-xs">{t(lang, 'permissions')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="font-bold mt-6 mb-3">{lang === 'ru' ? 'Роли и права по умолчанию' : lang === 'en' ? 'Default roles and permissions' : 'Әдепкі рөлдер мен рұқсаттар'}</h4>
      <div className="space-y-2">
        {Object.entries(data.rolesMeta || {}).map(([roleId, meta]: [string, any]) => (
          <div key={roleId} className="border rounded p-3">
            <h5 className="font-medium text-cyan-600 text-sm">{meta.label}</h5>
            <p className="text-xs text-gray-500 mb-1">{meta.desc}</p>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={meta.seeAll} onChange={e => updateData((d: AppData) => { d.rolesMeta[roleId].seeAll = e.target.checked; return {...d}; })} />
                {t(lang, 'canViewAllOrders')}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionsForm({ user, lang, onSave, onCancel }: any) {
  const [perms, setPerms] = useState<UserPermissions>(user.permissions || {});

  const permissionKeys = [
    'canCreateOrders', 'canEditOrders', 'canDeleteOrders', 'canViewAllOrders',
    'canManagePatients', 'canManageCatalog', 'canManageMaterials', 'canManageUsers',
    'canViewReports', 'canExportData'
  ];

  return (
    <div className="space-y-3">
      {permissionKeys.map(key => (
        <label key={key} className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            checked={Boolean(perms[key as keyof UserPermissions])} 
            onChange={e => setPerms({ ...perms, [key]: e.target.checked })} 
          />
          {t(lang, key)}
        </label>
      ))}
      <div className="flex gap-2 justify-end pt-3 border-t">
        <button onClick={onCancel} className="btn-outline">{t(lang, 'cancel')}</button>
        <button onClick={() => onSave(perms)} className="btn-primary">{t(lang, 'save')}</button>
      </div>
    </div>
  );
}

function UserForm({ data, lang, onSave, onCancel }: any) {
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('doctor');
  const [clinic, setClinic] = useState('');
  const [mirror, setMirror] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="space-y-3">
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={lang === 'ru' ? 'Имя' : lang === 'en' ? 'Name' : 'Аты'} className="w-full border rounded-lg p-2 text-sm" />
      <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder={t(lang, 'username')} className="w-full border rounded-lg p-2 text-sm" />
      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder={t(lang, 'password')} className="w-full border rounded-lg p-2 text-sm" />
      <select value={role} onChange={e => setRole(e.target.value)} className="w-full border rounded-lg p-2 text-sm">
        {Object.entries(ROLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input type="text" value={clinic} onChange={e => setClinic(e.target.value)} placeholder={t(lang, 'clinic')} className="w-full border rounded-lg p-2 text-sm" />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded-lg p-2 text-sm" />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} /> {lang === 'ru' ? 'Доступ к GMAI' : lang === 'en' ? 'GMAI access' : 'GMAI рұқсаты'}</label>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="btn-outline">{t(lang, 'cancel')}</button>
        <button onClick={() => { if (!name || !login || !pass) return; onSave({ id: genId(), login, pass, name, role, clinic, mirror, email }); }} className="btn-primary">{t(lang, 'save')}</button>
      </div>
    </div>
  );
}

function NotificationsView({ data, user, lang, updateData, toast }: any) {
  const [telegramEnabled, setTelegramEnabled] = useState(data.settings?.notifications?.telegram?.enabled || false);
  const [telegramToken, setTelegramToken] = useState(data.settings?.notifications?.telegram?.botToken || '');
  const [telegramChatId, setTelegramChatId] = useState(data.settings?.notifications?.telegram?.chatId || '');
  const [maxEnabled, setMaxEnabled] = useState(data.settings?.notifications?.max?.enabled || false);
  const [maxApiKey, setMaxApiKey] = useState(data.settings?.notifications?.max?.apiKey || '');
  const [maxChatId, setMaxChatId] = useState(data.settings?.notifications?.max?.chatId || '');
  const [emailEnabled, setEmailEnabled] = useState(data.settings?.notifications?.email?.enabled || false);
  const [smtpHost, setSmtpHost] = useState(data.settings?.notifications?.email?.smtp?.host || '');
  const [smtpPort, setSmtpPort] = useState(data.settings?.notifications?.email?.smtp?.port || 587);
  const [smtpUser, setSmtpUser] = useState(data.settings?.notifications?.email?.smtp?.user || '');
  const [smtpPass, setSmtpPass] = useState(data.settings?.notifications?.email?.smtp?.pass || '');
  const [fromEmail, setFromEmail] = useState(data.settings?.notifications?.email?.from || '');

  const saveSettings = () => {
    updateData((d: AppData) => {
      d.settings = {
        ...d.settings,
        notifications: {
          telegram: { enabled: telegramEnabled, botToken: telegramToken, chatId: telegramChatId },
          max: { enabled: maxEnabled, apiKey: maxApiKey, chatId: maxChatId },
          email: { enabled: emailEnabled, smtp: { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass }, from: fromEmail }
        }
      };
      return {...d};
    });
    toast(t(lang, 'saveSettings') + ' ✓');
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-4">{t(lang, 'notifications')}</h3>
      
      <div className="space-y-6">
        {/* Telegram */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📱</span>
            <h4 className="font-semibold">{t(lang, 'telegram')}</h4>
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={telegramEnabled} onChange={e => setTelegramEnabled(e.target.checked)} />
              <span className="text-sm">{t(lang, 'confirm')}</span>
            </label>
          </div>
          {telegramEnabled && (
            <div className="space-y-2">
              <input type="text" placeholder={t(lang, 'botToken')} value={telegramToken} onChange={e => setTelegramToken(e.target.value)} className="input-field text-xs" />
              <input type="text" placeholder={t(lang, 'chatId')} value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} className="input-field text-xs" />
            </div>
          )}
        </div>

        {/* Max */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💬</span>
            <h4 className="font-semibold">{t(lang, 'max')}</h4>
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={maxEnabled} onChange={e => setMaxEnabled(e.target.checked)} />
              <span className="text-sm">{t(lang, 'confirm')}</span>
            </label>
          </div>
          {maxEnabled && (
            <div className="space-y-2">
              <input type="text" placeholder={t(lang, 'apiKey')} value={maxApiKey} onChange={e => setMaxApiKey(e.target.value)} className="input-field text-xs" />
              <input type="text" placeholder={t(lang, 'chatId')} value={maxChatId} onChange={e => setMaxChatId(e.target.value)} className="input-field text-xs" />
            </div>
          )}
        </div>

        {/* Email */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📧</span>
            <h4 className="font-semibold">{t(lang, 'emailNotifications')}</h4>
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={emailEnabled} onChange={e => setEmailEnabled(e.target.checked)} />
              <span className="text-sm">{t(lang, 'confirm')}</span>
            </label>
          </div>
          {emailEnabled && (
            <div className="space-y-2">
              <input type="text" placeholder={t(lang, 'smtpHost')} value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="input-field text-xs" />
              <input type="number" placeholder={t(lang, 'smtpPort')} value={smtpPort} onChange={e => setSmtpPort(Number(e.target.value))} className="input-field text-xs" />
              <input type="text" placeholder={t(lang, 'smtpUser')} value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="input-field text-xs" />
              <input type="password" placeholder={t(lang, 'smtpPass')} value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className="input-field text-xs" />
              <input type="email" placeholder={t(lang, 'fromEmail')} value={fromEmail} onChange={e => setFromEmail(e.target.value)} className="input-field text-xs" />
            </div>
          )}
        </div>

        <button onClick={saveSettings} className="btn-primary w-full">{t(lang, 'saveSettings')}</button>
      </div>
    </div>
  );
}

function NewsView({ data, user, updateData, toast }: any) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const publish = () => {
    if (!title || !text) { toast('Заполните поля', 'error'); return; }
    updateData((d: AppData) => { d.news.unshift({ id: genId(), title, txt: text, at: Date.now(), by: user.id }); return {...d}; });
    setTitle(''); setText('');
    toast('Новость опубликована');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Новости</h3>
      <div className="mb-6">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок" className="w-full border rounded-lg p-2 mb-2" />
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Текст новости" className="w-full border rounded-lg p-2 mb-2" rows={3} />
        <button onClick={publish} className="px-4 py-2 bg-cyan-600 text-white rounded-lg">Опубликовать</button>
      </div>
      <div className="space-y-3">
        {(data.news || []).map((n: any) => (
          <div key={n.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <h4 className="font-medium">{n.title}</h4>
              <button onClick={() => { updateData((d: AppData) => { d.news = d.news.filter(x => x.id !== n.id); return {...d}; }); toast('Удалено'); }} className="text-red-500 text-sm">✗</button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{n.txt}</p>
            <span className="text-xs text-gray-400">{fmtDateTime(n.at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function printOrder(order: Order, data: AppData) {
  const patient = (data.patients || []).find(p => p.id === order.patientId);
  const doctor = (data.users || []).find(u => u.id === order.doctorId);
  const total = order.positions.reduce((s, p) => s + p.price, 0);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html><head><title>Заказ-наряд ${order.num}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;text-align:left}h1{font-size:18px}.header{display:flex;justify-content:space-between;margin-bottom:20px}</style>
    </head><body>
    <h1>Заказ-наряд ${order.num}</h1>
    <p><strong>Дата:</strong> ${fmtDate(order.createdAt)} | <strong>Статус:</strong> ${STATUS_NAMES[order.status]}</p>
    <p><strong>Пациент:</strong> ${patient?.fio} | <strong>Доктор:</strong> ${doctor?.name} | <strong>Клиника:</strong> ${order.clinic}</p>
    <p><strong>Срок сдачи:</strong> ${order.dueDate} ${order.dueTime}</p>
    <table><thead><tr><th>Услуга</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>
    ${order.positions.map(p => `<tr><td>${p.name}</td><td>${p.qty}</td><td>${p.price.toLocaleString()} ₽</td><td>${(p.price * p.qty).toLocaleString()} ₽</td></tr>`).join('')}
    </tbody><tfoot><tr><td colspan="3"><strong>Итого:</strong></td><td><strong>${total.toLocaleString()} ₽</strong></td></tr></tfoot></table>
    ${order.plan ? `<p><strong>План лечения:</strong> ${order.plan}</p>` : ''}
    <script>window.print();</script>
    </body></html>
  `);
  printWindow.document.close();
}

function exportCSV(data: AppData, month: string) {
  const [year, monthNum] = month.split('-').map(Number);
  const start = new Date(year, monthNum - 1, 1).getTime();
  const end = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

  const orders = (data.orders || []).filter(o => o.createdAt >= start && o.createdAt <= end);
  let csv = '\uFEFF';
  csv += 'Номер;Пациент;Категория;Статус;Сумма;Доктор;Дата создания\n';
  orders.forEach(o => {
    const patient = (data.patients || []).find(p => p.id === o.patientId);
    const doctor = (data.users || []).find(u => u.id === o.doctorId);
    const total = o.positions.reduce((s, p) => s + p.price, 0);
    csv += `${o.num};${patient?.fio || ''};${o.category};${STATUS_NAMES[o.status]};${total};${doctor?.name || ''};${fmtDate(o.createdAt)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `orders_${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
