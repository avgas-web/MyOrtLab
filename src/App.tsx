import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppData, User, Order, Patient, CatalogItem, WorkType, Material, StockIn,
  Position, PositionOp, OrderFile, OrderComment, HistoryEntry, NewsItem, MirrorReport,
  createDemoData, ROLES_META, STATUS_LABELS, STATUS_COLORS, ALL_STATUSES
} from './data';

const STORAGE_KEY = 'myort_lk_data';
const SESSION_KEY = 'myort_lk_session';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const d = createDemoData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  return d;
}

function saveData(d: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function uid() { return Math.random().toString(36).slice(2, 10); }
function fmtDate(ts: number) { return new Date(ts).toLocaleDateString('ru-RU'); }
function fmtDateTime(ts: number) { return new Date(ts).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
function daysBetween(a: string, b: string) { return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000); }
function isOverdue(dueDate: string) { return new Date(dueDate) < new Date() && dueDate !== ''; }

export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [session, setSession] = useState<User | null>(() => {
    try { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [view, setView] = useState('dashboard');
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session)); else localStorage.removeItem(SESSION_KEY); }, [session]);

  const toast = useCallback((msg: string, type = 'info') => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const updateData = useCallback((fn: (d: AppData) => AppData) => {
    setData(prev => { const next = fn(prev); return next; });
  }, []);

  const addHistory = (order: Order, by: string, txt: string): Order => ({
    ...order, history: [...order.history, { at: Date.now(), by, txt }]
  });

  if (!session) return <LoginScreen onLogin={(u) => { setSession(u); toast(`Добро пожаловать, ${u.name}`); }} users={data.users} />;

  const role = session.role;
  const canSee = (statuses: string[]) => {
    if (statuses.includes('all')) return true;
    return true; // simplified - all roles see kanban
  };

  const getMyOrders = (): Order[] => {
    if (role === 'admin' || role === 'admin_ztl') return data.orders;
    if (role === 'manager_support') return data.orders.filter(o => o.doctorId === session.id || true);
    if (role === 'clinic_mgr') return data.orders.filter(o => o.clinic === session.clinic);
    if (role === 'doctor' || role === 'doctor_myort') return data.orders.filter(o => o.doctorId === session.id);
    if (role === 'quality') return data.orders.filter(o => ['quality', 'returned'].includes(o.status));
    if (role === 'cadcam') return data.orders.filter(o => ['cadcam', 'correction', 'approve'].includes(o.status));
    if (role === 'keramist' || role === 'tech_phys' || role === 'print3d') return data.orders.filter(o => ['production', 'correction'].includes(o.status));
    if (role === 'gips') return data.orders.filter(o => o.status === 'gypsum');
    if (role === 'scan') return data.orders.filter(o => o.status === 'scanning');
    if (role === 'marketer') return [];
    return data.orders;
  };

  const myOrders = getMyOrders();

  return (
    <div className="flex h-screen bg-[#eef2f7] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-[#0f172a] text-white flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="p-3 flex items-center gap-2 border-b border-slate-700">
          <span className="text-xl font-bold text-cyan-400">M</span>
          {sidebarOpen && <span className="text-sm font-semibold">MyOrt ЛК</span>}
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Главная', roles: ['all'] },
            { id: 'orders', icon: '📋', label: 'Заказы', roles: ['all'] },
            { id: 'neworder', icon: '➕', label: 'Новый заказ', roles: ['doctor', 'doctor_myort', 'admin'] },
            { id: 'catalog', icon: '📦', label: 'Каталог услуг', roles: ['all'] },
            { id: 'patients', icon: '👥', label: 'Пациенты', roles: ['doctor', 'doctor_myort', 'admin', 'clinic_mgr'] },
            { id: 'materials', icon: '🧪', label: 'Материалы', roles: ['admin', 'admin_ztl', 'keramist', 'tech_phys', 'print3d', 'cadcam'] },
            { id: 'worktypes', icon: '⚙️', label: 'Виды работ', roles: ['admin'] },
            { id: 'mypiecework', icon: '💰', label: 'Моя сдельная', roles: ['cadcam', 'keramist', 'tech_phys', 'print3d', 'gips', 'scan'] },
            { id: 'reports', icon: '📊', label: 'Отчёты', roles: ['admin', 'admin_ztl', 'clinic_mgr', 'cadcam', 'keramist', 'tech_phys', 'print3d'] },
            { id: 'gmai', icon: '🤖', label: 'GnatoneMirror', roles: ['admin', 'doctor', 'doctor_myort'] },
            { id: 'users', icon: '👤', label: 'Пользователи', roles: ['admin'] },
            { id: 'news', icon: '📰', label: 'Новости', roles: ['admin', 'marketer'] },
          ].filter(m => m.roles.includes('all') || m.roles.includes(role)).map(m => (
            <button key={m.id} onClick={() => setView(m.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-700/50 transition ${view === m.id ? 'bg-cyan-800/40 text-cyan-300 border-r-2 border-cyan-400' : 'text-slate-300'}`}>
              <span className="text-lg">{m.icon}</span>
              {sidebarOpen && <span>{m.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full text-xs text-slate-400 hover:text-white py-1">
            {sidebarOpen ? '◀ Свернуть' : '▶'}
          </button>
          {sidebarOpen && <div className="text-[10px] text-slate-500 mt-1">v1.0.0 MyOrtLab</div>}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">
            {{ dashboard:'Главная', orders:'Заказы', neworder:'Новый заказ', catalog:'Каталог услуг', patients:'Пациенты', materials:'Материалы', worktypes:'Виды работ', mypiecework:'Моя сдельная', reports:'Отчёты', gmai:'GnatoneMirror', users:'Пользователи', news:'Новости' }[view] || ''}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-700">{session.name}</div>
              <div className="text-xs text-slate-400">{ROLES_META[role]?.label}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold">
              {session.name[0]}
            </div>
            <button onClick={() => { setSession(null); setView('dashboard'); }} className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1">Выйти</button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {view === 'dashboard' && <Dashboard data={data} orders={myOrders} session={session} onOpenOrder={(o) => setModal({ type: 'order', data: o })} />}
          {view === 'orders' && <OrdersView data={data} orders={myOrders} session={session} onOpenOrder={(o) => setModal({ type: 'order', data: o })} onNewOrder={() => setView('neworder')} />}
          {view === 'neworder' && <NewOrderForm data={data} session={session} onSubmit={(o) => { updateData(d => ({ ...d, orders: [...d.orders, o] })); setView('orders'); toast('Заказ создан'); }} onCancel={() => setView('orders')} toast={toast} />}
          {view === 'catalog' && <CatalogView data={data} session={session} updateData={updateData} toast={toast} />}
          {view === 'patients' && <PatientsView data={data} session={session} updateData={updateData} toast={toast} />}
          {view === 'materials' && <MaterialsView data={data} session={session} updateData={updateData} toast={toast} />}
          {view === 'worktypes' && <WorkTypesView data={data} updateData={updateData} toast={toast} />}
          {view === 'mypiecework' && <MyPieceworkView data={data} session={session} />}
          {view === 'reports' && <ReportsView data={data} session={session} />}
          {view === 'gmai' && <GmaiView data={data} session={session} updateData={updateData} toast={toast} />}
          {view === 'users' && <UsersView data={data} updateData={updateData} toast={toast} />}
          {view === 'news' && <NewsView data={data} session={session} updateData={updateData} toast={toast} />}
        </main>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {modal.type === 'order' && <OrderModal order={modal.data} data={data} session={session} updateData={updateData} toast={toast} onClose={() => setModal(null)} />}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm max-w-sm ${t.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== LOGIN =====
function LoginScreen({ onLogin, users }: { onLogin: (u: User) => void; users: User[] }) {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    const u = users.find(x => x.login === login && x.pass === pass);
    if (u) onLogin(u); else setErr('Неверный логин или пароль');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-cyan-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-cyan-700">MyOrt</div>
          <div className="text-sm text-slate-500 mt-1">Личный кабинет лаборатории</div>
        </div>
        <div className="space-y-3">
          <input value={login} onChange={e => setLogin(e.target.value)} placeholder="Логин" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Пароль" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" onKeyDown={e => e.key === 'Enter' && submit()} />
          {err && <div className="text-red-500 text-xs">{err}</div>}
          <button onClick={submit} className="w-full bg-cyan-700 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-cyan-800 transition">Войти</button>
        </div>
        <div className="mt-4 text-xs text-slate-400 text-center">
          Демо: admin/admin, ztl/ztl, doctor/doctor, quality/quality
        </div>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function Dashboard({ data, orders, session, onOpenOrder }: { data: AppData; orders: Order[]; session: User; onOpenOrder: (o: Order) => void }) {
  const active = orders.filter(o => !['done', 'cancelled'].includes(o.status));
  const done = orders.filter(o => o.status === 'done');
  const overdue = orders.filter(o => isOverdue(o.dueDate) && !['done', 'cancelled'].includes(o.status));
  const paidSum = orders.filter(o => o.paid).reduce((s, o) => s + o.positions.reduce((ps, p) => ps + p.price * p.qty, 0), 0);

  const isTech = ['cadcam', 'keramist', 'tech_phys', 'print3d', 'gips', 'scan'].includes(session.role);
  const myWork = isTech ? orders.filter(o => o.positions.some(p => p.ops.some(op => op.techId === session.id && !op.done && !op.proddone))) : [];
  const myFee = isTech ? orders.filter(o => o.status === 'done').reduce((s, o) => s + o.positions.reduce((ps, p) => ps + p.ops.filter(op => op.techId === session.id).reduce((os, op) => os + op.fee, 0), 0), 0) : 0;

  const statusCols = ['quality', 'accept', 'gypsum', 'scanning', 'admin_pricing', 'payment', 'cadcam', 'approve', 'production', 'delivery', 'handover', 'closing', 'done'];

  return (
    <div className="space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="В работе" value={active.length} color="bg-cyan-500" />
        <KpiCard label="Выполнено" value={done.length} color="bg-green-500" />
        <KpiCard label="Просрочено" value={overdue.length} color="bg-red-500" />
        <KpiCard label="Оплачено" value={`${(paidSum/1000).toFixed(0)}к`} color="bg-amber-500" />
        {isTech && <><KpiCard label="Мои работы" value={myWork.length} color="bg-purple-500" /><KpiCard label="Сдельная 30д" value={`${(myFee/1000).toFixed(1)}к`} color="bg-indigo-500" /></>}
      </div>

      {/* Kanban */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3">Канбан-доска</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {statusCols.map(st => {
            const colOrders = orders.filter(o => o.status === st);
            return (
              <div key={st} className="min-w-[200px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[st] }}></span>
                  <span className="text-xs font-medium text-slate-600">{STATUS_LABELS[st]}</span>
                  <span className="text-xs text-slate-400">({colOrders.length})</span>
                </div>
                <div className="space-y-2">
                  {colOrders.slice(0, 5).map(o => (
                    <div key={o.id} onClick={() => onOpenOrder(o)} className="bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer hover:shadow-md transition text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-700">{o.num}</span>
                        {o.corrections > 0 && <span className="bg-red-100 text-red-600 px-1 rounded text-[10px]">×{o.corrections}</span>}
                      </div>
                      <div className="text-slate-600 mt-1 truncate">{data.patients.find(p => p.id === o.patientId)?.fio || '?'}</div>
                      <div className="text-slate-400 truncate">{o.positions[0]?.name}</div>
                      <div className="flex gap-1 mt-1">
                        {o.has_physical_impressions && <span className="bg-blue-100 text-blue-600 px-1 rounded text-[10px]">📐</span>}
                        {o.is_urgent && <span className="bg-orange-100 text-orange-600 px-1 rounded text-[10px]">⚡</span>}
                        {isOverdue(o.dueDate) && <span className="bg-red-100 text-red-600 px-1 rounded text-[10px]">⏰</span>}
                      </div>
                    </div>
                  ))}
                  {colOrders.length > 5 && <div className="text-xs text-slate-400 text-center">+{colOrders.length - 5} ещё</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* News */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3">Новости</h3>
        <div className="space-y-3">
          {data.news.slice(0, 3).map(n => (
            <div key={n.id} className="border-l-3 border-cyan-500 pl-3">
              <div className="font-medium text-sm text-slate-700">{n.title}</div>
              <div className="text-xs text-slate-500 mt-1">{n.text.slice(0, 150)}...</div>
              <div className="text-[10px] text-slate-400 mt-1">{fmtDate(n.at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className={`w-8 h-1 ${color} rounded mb-2`}></div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

// ===== ORDERS VIEW =====
function OrdersView({ data, orders, session, onOpenOrder, onNewOrder }: any) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const filtered = orders.filter(o => {
    if (search) {
      const s = search.toLowerCase();
      const patient = data.patients.find(p => p.id === o.patientId);
      if (!o.num.toLowerCase().includes(s) && !o.positions.some(p => p.name.toLowerCase().includes(s)) && !(patient?.fio.toLowerCase().includes(s)) && !o.clinic.toLowerCase().includes(s)) return false;
    }
    if (statusFilter && o.status !== statusFilter) return false;
    if (catFilter && o.category !== catFilter) return false;
    return true;
  });

  const canCreate = ['doctor', 'doctor_myort', 'admin'].includes(session.role);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по №, пациенту, услуге, клинике..." className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Все статусы</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Все категории</option>
          <option value="ЗТЛ">ЗТЛ</option>
          <option value="Гнатология">Гнатология</option>
          <option value="Ремонтные работы">Ремонтные работы</option>
          <option value="Гарантия">Гарантия</option>
        </select>
        <div className="flex border border-slate-300 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-xs ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600'}`}>Список</button>
          <button onClick={() => setViewMode('kanban')} className={`px-3 py-2 text-xs ${viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600'}`}>Конвейер</button>
        </div>
        {canCreate && <button onClick={onNewOrder} className="bg-cyan-700 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-cyan-800">+ Новый заказ</button>}
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-600">№</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Пациент</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Услуга</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Категория</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Статус</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Сумма</th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">Сдача</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const patient = data.patients.find(p => p.id === o.patientId);
                const sum = o.positions.reduce((s, p) => s + p.price * p.qty, 0);
                return (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-semibold text-cyan-700">{o.num}</td>
                    <td className="px-3 py-2">{patient?.fio || '?'}</td>
                    <td className="px-3 py-2 text-slate-600">{o.positions[0]?.name?.slice(0, 30)}</td>
                    <td className="px-3 py-2"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{o.category}</span></td>
                    <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                    <td className="px-3 py-2">{sum > 0 ? `${sum.toLocaleString()} ₽` : '—'}</td>
                    <td className={`px-3 py-2 ${isOverdue(o.dueDate) && !['done','cancelled'].includes(o.status) ? 'text-red-600 font-medium' : ''}`}>{o.dueDate || '—'}</td>
                    <td className="px-3 py-2"><button onClick={() => onOpenOrder(o)} className="text-cyan-600 hover:text-cyan-800 text-xs font-medium">Открыть →</button></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-400">Заказов не найдено</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {['quality', 'accept', 'gypsum', 'scanning', 'admin_pricing', 'payment', 'cadcam', 'approve', 'production', 'delivery', 'handover', 'closing', 'done'].map(st => {
            const col = filtered.filter(o => o.status === st);
            return (
              <div key={st} className="min-w-[180px] flex-shrink-0 bg-slate-50 rounded-lg p-2">
                <div className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[st] }}></span>
                  {STATUS_LABELS[st]} ({col.length})
                </div>
                {col.map(o => (
                  <div key={o.id} onClick={() => onOpenOrder(o)} className="bg-white rounded p-2 mb-1 cursor-pointer hover:shadow text-xs border">
                    <div className="font-semibold text-cyan-700">{o.num}</div>
                    <div className="text-slate-600 truncate">{data.patients.find(p => p.id === o.patientId)?.fio}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white" style={{ background: STATUS_COLORS[status] || '#6b7280' }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ===== NEW ORDER FORM =====
function NewOrderForm({ data, session, onSubmit, onCancel, toast }: any) {
  const [orderType, setOrderType] = useState('full');
  const [patientId, setPatientId] = useState('');
  const [newPatient, setNewPatient] = useState({ fio: '', sex: 'М', bd: '', clinic: '' });
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchSvc, setSearchSvc] = useState('');
  const [showSvcList, setShowSvcList] = useState(false);
  const [hasImpressions, setHasImpressions] = useState(false);
  const [plan, setPlan] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [isUrgent, setIsUrgent] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: number; typeCat: string; dataUrl: string | null }[]>([]);
  const [notes, setNotes] = useState('');
  const [repairDesc, setRepairDesc] = useState('');
  const [guaranteeOrderNum, setGuaranteeOrderNum] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const myPatients = data.patients.filter((p: Patient) => {
    if (session.role === 'admin') return true;
    return p.doctors.includes(session.id) || p.clinic === session.clinic;
  });

  const filteredCatalog = data.catalog.filter((c: CatalogItem) => c.name.toLowerCase().includes(searchSvc.toLowerCase()));

  const addPosition = (svc: CatalogItem) => {
    if (positions.length >= 15) { toast('Максимум 15 позиций', 'error'); return; }
    setPositions([...positions, { name: svc.name, svcId: svc.id, cat: svc.cat, qty: 1, price: svc.price || 0, ops: [] }]);
    setSearchSvc(''); setShowSvcList(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach(f => {
      if (f.size > 1.5 * 1024 * 1024) {
        setFiles(prev => [...prev, { name: f.name, size: f.size, typeCat: 'other', dataUrl: null }]);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          setFiles(prev => [...prev, { name: f.name, size: f.size, typeCat: 'other', dataUrl: reader.result as string }]);
        };
        reader.readAsDataURL(f);
      }
    });
  };

  const checkUrgency = () => {
    if (!dueDate || positions.length === 0) return false;
    const maxTerm = Math.max(...positions.map(p => {
      const svc = data.catalog.find((c: CatalogItem) => c.id === p.svcId);
      return svc?.termDays || 7;
    }));
    const days = daysBetween(new Date().toISOString().slice(0, 10), dueDate);
    return days < maxTerm;
  };

  const submit = () => {
    if (!patientId && !showNewPatient) { toast('Выберите пациента', 'error'); return; }
    if (orderType !== 'repair' && orderType !== 'guarantee' && positions.length === 0) { toast('Добавьте хотя бы одну позицию', 'error'); return; }
    if (!dueDate) { toast('Укажите дату сдачи', 'error'); return; }
    if (files.length === 0 && orderType !== 'repair' && orderType !== 'guarantee') { toast('Загрузите файлы', 'error'); return; }

    let finalPatientId = patientId;
    if (showNewPatient && newPatient.fio) {
      finalPatientId = 'p_' + uid();
    }

    const maxTerm = positions.length > 0 ? Math.max(...positions.map(p => {
      const svc = data.catalog.find((c: CatalogItem) => c.id === p.svcId);
      return svc?.termDays || 7;
    })) : null;

    const category = orderType === 'repair' ? 'Ремонтные работы' : orderType === 'guarantee' ? 'Гарантия' : (positions[0]?.cat || 'ЗТЛ');

    const order: Order = {
      id: 'o_' + uid(),
      num: 'GT-' + (109 + data.orders.length),
      patientId: finalPatientId,
      doctorId: session.id,
      clinic: session.clinic || '',
      category,
      notesText: notes || repairDesc,
      positions: orderType === 'repair' ? [{ name: repairDesc || 'Ремонт', svcId: null, cat: 'Ремонтные работы', qty: 1, price: 0, ops: [] }] :
                 orderType === 'guarantee' ? [{ name: 'Гарантийный ремонт', svcId: null, cat: 'Ремонтные работы', qty: 1, price: 0, ops: [] }] : positions,
      files: files.map(f => ({ id: 'f_' + uid(), ...f, by: session.id, at: Date.now() })),
      plan, dueDate, dueTime, termDays: maxTerm,
      status: orderType === 'repair' ? 'repair_create' : orderType === 'guarantee' ? 'guarantee_create' : 'quality',
      corrections: 0, paymentType: 'pre100', priceUndefined: false,
      paid: false, freeApproved: false, address: '',
      sent: false, received: false, handed: false,
      finalFixed: false, prodReady: false, payRecheck: false,
      createdAt: Date.now(), returnReason: '',
      comments: [], history: [{ at: Date.now(), by: session.id, txt: 'Заказ создан' }],
      has_physical_impressions: hasImpressions,
      type: orderType === 'repair' ? 'repair' : orderType === 'guarantee' ? 'guarantee' : orderType,
      is_urgent: isUrgent || checkUrgency(),
      repairOrderNum: orderType === 'guarantee' ? guaranteeOrderNum : undefined,
    };

    onSubmit(order);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-700">Создание заказа</h2>

        {/* Type */}
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-2">Тип заказа</label>
          <div className="flex flex-wrap gap-2">
            {[['full','Полный'],['cadcam_only','Только CAD/CAM'],['phys_only','Только физика'],['repair','Ремонт'],['guarantee','Гарантия']].map(([v,l]) => (
              <label key={v} className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer ${orderType === v ? 'border-cyan-600 bg-cyan-50 text-cyan-700' : 'border-slate-300 text-slate-600'}`}>
                <input type="radio" name="type" value={v} checked={orderType === v} onChange={() => setOrderType(v)} className="hidden" />{l}
              </label>
            ))}
          </div>
        </div>

        {/* Repair/Guarantee specifics */}
        {orderType === 'repair' && (
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Описание проблемы</label>
            <textarea value={repairDesc} onChange={e => setRepairDesc(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Опишите проблему..." />
          </div>
        )}
        {orderType === 'guarantee' && (
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Номер исходного заказа</label>
            <input value={guaranteeOrderNum} onChange={e => setGuaranteeOrderNum(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="GT-xxx или «вне ЛК»" />
            <label className="text-sm font-medium text-slate-600 block mb-1 mt-3">Описание проблемы</label>
            <textarea value={repairDesc} onChange={e => setRepairDesc(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
        )}

        {/* Patient */}
        {orderType !== 'repair' && orderType !== 'guarantee' && (
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Пациент</label>
            {!showNewPatient ? (
              <div className="flex gap-2">
                <select value={patientId} onChange={e => setPatientId(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Выберите пациента</option>
                  {myPatients.map((p: Patient) => <option key={p.id} value={p.id}>{p.fio} ({p.clinic})</option>)}
                </select>
                <button onClick={() => setShowNewPatient(true)} className="text-cyan-600 text-sm border border-cyan-300 rounded-lg px-3">+ Новый</button>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
                <input value={newPatient.fio} onChange={e => setNewPatient({...newPatient, fio: e.target.value})} placeholder="ФИО" className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm" />
                <div className="flex gap-2">
                  <select value={newPatient.sex} onChange={e => setNewPatient({...newPatient, sex: e.target.value})} className="border border-slate-300 rounded px-3 py-1.5 text-sm">
                    <option value="М">М</option><option value="Ж">Ж</option>
                  </select>
                  <input type="date" value={newPatient.bd} onChange={e => setNewPatient({...newPatient, bd: e.target.value})} className="border border-slate-300 rounded px-3 py-1.5 text-sm" />
                  <input value={newPatient.clinic} onChange={e => setNewPatient({...newPatient, clinic: e.target.value})} placeholder="Клиника" className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-sm" />
                </div>
                <button onClick={() => setShowNewPatient(false)} className="text-xs text-cyan-600">← Выбрать из списка</button>
              </div>
            )}
          </div>
        )}

        {/* Positions */}
        {orderType !== 'repair' && orderType !== 'guarantee' && (
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Позиции ({positions.length}/15)</label>
            <div className="relative">
              <input value={searchSvc} onChange={e => { setSearchSvc(e.target.value); setShowSvcList(true); }} placeholder="Поиск услуги..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              {showSvcList && searchSvc && (
                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                  {filteredCatalog.slice(0, 20).map((c: CatalogItem) => (
                    <div key={c.id} onClick={() => addPosition(c)} className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-100">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-slate-400 ml-2">{c.cat} / {c.sub}</span>
                      <span className="text-cyan-600 ml-2">{c.price ? `${c.price.toLocaleString()} ₽` : 'по запросу'}</span>
                      <span className="text-slate-400 ml-2 text-xs">{c.term}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {positions.length > 0 && (
              <div className="mt-2 space-y-1">
                {positions.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2 text-sm">
                    <span className="flex-1">{p.name}</span>
                    <input type="number" value={p.qty} min={1} onChange={e => { const np = [...positions]; np[i].qty = +e.target.value; setPositions(np); }} className="w-12 border rounded px-1 py-0.5 text-center" />
                    <span className="text-slate-500">{(p.price * p.qty).toLocaleString()} ₽</span>
                    <button onClick={() => setPositions(positions.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Files */}
        {orderType !== 'repair' && orderType !== 'guarantee' && (
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Файлы</label>
            <input ref={fileRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 hover:border-cyan-400 w-full">
              📎 Загрузить файлы (фото, КТ, сканы)
            </button>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded px-3 py-1.5 text-xs">
                    <span className="flex-1 truncate">{f.name}</span>
                    <span className="text-slate-400">{(f.size/1024).toFixed(0)} KB</span>
                    <select value={f.typeCat} onChange={e => { const nf = [...files]; nf[i].typeCat = e.target.value; setFiles(nf); }} className="border rounded px-1 py-0.5 text-xs">
                      <option value="face">Фото лица</option><option value="photo">Фото</option><option value="ct">КТ</option><option value="scan">Сканы</option><option value="other">Другое</option>
                    </select>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-red-400">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Impressions */}
        {orderType !== 'repair' && orderType !== 'guarantee' && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={hasImpressions} onChange={e => setHasImpressions(e.target.checked)} className="rounded" />
            Физические слепки отправлены
          </label>
        )}

        {/* Plan */}
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1">План лечения</label>
          <textarea value={plan} onChange={e => setPlan(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
        </div>

        {/* Date */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-600 block mb-1">Дата сдачи</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-1">Время</label>
            <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        {checkUrgency() && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span className="text-amber-700">Выбранная дата меньше регламентного срока. Будет применена наценка за срочность +30%.</span>
            </div>
            <label className="flex items-center gap-2 mt-2">
              <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
              <span className="text-sm">Подтвердить срочность</span>
            </label>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-slate-600 block mb-1">Примечания</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={submit} className="bg-cyan-700 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-cyan-800">Отправить заказ в работу</button>
          <button onClick={onCancel} className="border border-slate-300 rounded-lg px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50">Отмена</button>
        </div>
      </div>
    </div>
  );
}

// ===== ORDER MODAL =====
function OrderModal({ order: initOrder, data, session, updateData, toast, onClose }: any) {
  const [order, setOrder] = useState<Order>(initOrder);
  const [tab, setTab] = useState<'info' | 'positions' | 'files' | 'chat' | 'history'>('info');
  const [returnReason, setReturnReason] = useState('');
  const [showReturn, setShowReturn] = useState(false);
  const [comment, setComment] = useState('');
  const [showAddPos, setShowAddPos] = useState(false);
  const [newPosSearch, setNewPosSearch] = useState('');

  const patient = data.patients.find((p: Patient) => p.id === order.patientId);
  const doctor = data.users.find((u: User) => u.id === order.doctorId);
  const role = session.role;
  const isAdmin = role === 'admin' || role === 'admin_ztl' || role === 'manager_support';

  const updateOrder = (changes: Partial<Order>) => {
    const updated = { ...order, ...changes };
    setOrder(updated);
    updateData((d: AppData) => ({
      ...d,
      orders: d.orders.map(o => o.id === updated.id ? updated : o)
    }));
  };

  const addHistoryEntry = (txt: string) => {
    const entry: HistoryEntry = { at: Date.now(), by: session.id, txt };
    updateOrder({ history: [...order.history, entry] });
  };

  const transition = (newStatus: string, extra?: Partial<Order>) => {
    updateOrder({ status: newStatus, ...extra });
    addHistoryEntry(`Статус → ${STATUS_LABELS[newStatus]}`);
    toast(`Заказ переведён: ${STATUS_LABELS[newStatus]}`);
    setShowReturn(false); setReturnReason('');
  };

  const returnWithReason = (targetStatus: string) => {
    if (!returnReason.trim()) { toast('Укажите причину возврата', 'error'); return; }
    const corrections = ['approve', 'production', 'handover'].includes(order.status) ? order.corrections + 1 : order.corrections;
    transition(targetStatus, { returnReason, corrections });
  };

  const totalSum = order.positions.reduce((s, p) => s + p.price * p.qty, 0);
  const opsFee = order.positions.reduce((s, p) => s + p.ops.reduce((os, op) => os + op.fee, 0), 0);

  // Action buttons based on role and status
  const getActions = () => {
    const actions: { label: string; onClick: () => void; color: string; requires?: boolean }[] = [];

    if (role === 'quality' && order.status === 'quality') {
      actions.push({ label: '✅ Принять', onClick: () => transition('accept'), color: 'bg-green-600' });
      actions.push({ label: '↩️ Вернуть доктору', onClick: () => setShowReturn(true), color: 'bg-red-500', requires: true });
    }
    if (role === 'doctor' && order.status === 'returned') {
      actions.push({ label: '📤 Отправить повторно', onClick: () => transition('quality'), color: 'bg-cyan-600' });
    }
    if (isAdmin && order.status === 'accept') {
      if (order.has_physical_impressions) {
        actions.push({ label: '→ Гипсовка', onClick: () => transition('gypsum'), color: 'bg-cyan-600' });
      } else {
        actions.push({ label: '→ Ценообразование', onClick: () => transition('admin_pricing'), color: 'bg-cyan-600' });
      }
    }
    if (role === 'gips' && order.status === 'gypsum') {
      actions.push({ label: '✓ Гипсовка выполнена', onClick: () => { 
        const updated = { ...order, positions: order.positions.map(p => ({ ...p, ops: p.ops.map(op => op.wtId === 'wt4' ? { ...op, proddone: true, completedAt: Date.now() } : op) })) } as Order;
        setOrder(updated);
        updateData((d: AppData) => ({ ...d, orders: d.orders.map(o => o.id === updated.id ? updated : o) }));
        toast('Гипсовка отмечена');
      }, color: 'bg-green-600' });
      actions.push({ label: '→ Сканирование', onClick: () => transition('scanning'), color: 'bg-cyan-600' });
    }
    if (role === 'scan' && order.status === 'scanning') {
      actions.push({ label: '→ Ценообразование', onClick: () => transition('admin_pricing'), color: 'bg-cyan-600' });
    }
    if (isAdmin && order.status === 'admin_pricing') {
      actions.push({ label: '→ Оплата', onClick: () => transition('payment'), color: 'bg-cyan-600' });
    }
    if (isAdmin && order.status === 'payment') {
      actions.push({ label: '💰 Подтвердить оплату', onClick: () => transition(order.type === 'cadcam_only' || order.type === 'full' ? 'cadcam' : 'production', { paid: true }), color: 'bg-green-600' });
    }
    if (role === 'cadcam' && order.status === 'cadcam') {
      const allDone = order.positions.every(p => p.ops.filter(op => ['wt1','wt2','wt3','wt10'].includes(op.wtId)).every(op => op.done));
      actions.push({ label: '✓ CAD выполнен', onClick: () => {
        const updated = { ...order, positions: order.positions.map(p => ({ ...p, ops: p.ops.map(op => ['wt1','wt2','wt3','wt10'].includes(op.wtId) ? { ...op, done: true, completedAt: Date.now() } : op) })) } as Order;
        setOrder(updated);
        updateData((d: AppData) => ({ ...d, orders: d.orders.map(o => o.id === updated.id ? updated : o) }));
        toast('CAD работы отмечены');
      }, color: 'bg-green-600' });
      actions.push({ label: '→ Согласование', onClick: () => transition('approve'), color: 'bg-cyan-600' });
    }
    if (role === 'doctor' && order.status === 'approve') {
      actions.push({ label: '✅ Согласовать', onClick: () => {
        const updated = { ...order, positions: order.positions.map(p => ({ ...p, ops: p.ops.map(op => ({ ...op, docOk: true, docOkAt: Date.now() })) })) } as Order;
        setOrder(updated);
        updateData((d: AppData) => ({ ...d, orders: d.orders.map(o => o.id === updated.id ? updated : o) }));
        toast('Согласовано');
      }, color: 'bg-green-600' });
      actions.push({ label: '↩️ В доработку', onClick: () => setShowReturn(true), color: 'bg-red-500', requires: true });
    }
    if ((role === 'keramist' || role === 'tech_phys' || role === 'print3d') && order.status === 'production') {
      actions.push({ label: '✓ Производство выполнено', onClick: () => {
        const updated = { ...order, positions: order.positions.map(p => ({ ...p, ops: p.ops.map(op => ['wt6','wt5','wt7','wt8','wt9'].includes(op.wtId) ? { ...op, proddone: true, completedAt: Date.now() } : op) })) } as Order;
        setOrder(updated);
        updateData((d: AppData) => ({ ...d, orders: d.orders.map(o => o.id === updated.id ? updated : o) }));
        toast('Производство отмечено');
      }, color: 'bg-green-600' });
      if (order.type === 'full' || order.type === 'phys_only') {
        actions.push({ label: '→ Доставка', onClick: () => transition('delivery'), color: 'bg-cyan-600' });
      }
    }
    if (isAdmin && order.status === 'delivery') {
      actions.push({ label: '📦 Отправить', onClick: () => transition('handover', { sent: true }), color: 'bg-cyan-600' });
    }
    if (role === 'doctor' && order.status === 'handover') {
      actions.push({ label: '✅ Сдано', onClick: () => transition('closing'), color: 'bg-green-600' });
      actions.push({ label: '↩️ Коррекция', onClick: () => setShowReturn(true), color: 'bg-red-500', requires: true });
    }
    if (isAdmin && order.status === 'closing') {
      actions.push({ label: '✓ Закрыть заказ', onClick: () => transition('done', { completedAt: Date.now() }), color: 'bg-green-600' });
    }
    if (order.status === 'correction') {
      if (isAdmin) actions.push({ label: '→ Повтор CAD', onClick: () => transition('cadcam'), color: 'bg-blue-600' });
      if (isAdmin) actions.push({ label: '→ Повтор производства', onClick: () => transition('production'), color: 'bg-blue-600' });
    }
    // Repair flow
    if (isAdmin && order.status === 'repair_create') {
      actions.push({ label: '✅ Одобрить', onClick: () => transition('repair_approve'), color: 'bg-green-600' });
      actions.push({ label: '❌ Отклонить', onClick: () => transition('done'), color: 'bg-red-500' });
    }
    if (isAdmin && order.status === 'repair_approve') {
      actions.push({ label: '→ Оплата', onClick: () => transition('repair_payment'), color: 'bg-cyan-600' });
    }
    if (isAdmin && order.status === 'repair_payment') {
      actions.push({ label: '→ Производство', onClick: () => transition('repair_production', { paid: true }), color: 'bg-cyan-600' });
    }
    if ((role === 'keramist' || role === 'tech_phys') && order.status === 'repair_production') {
      actions.push({ label: '→ Доставка', onClick: () => transition('repair_delivery'), color: 'bg-cyan-600' });
    }
    if (isAdmin && order.status === 'repair_delivery') {
      actions.push({ label: '✓ Закрыть', onClick: () => transition('done', { completedAt: Date.now() }), color: 'bg-green-600' });
    }
    // Guarantee flow
    if (isAdmin && order.status === 'guarantee_create') {
      actions.push({ label: '✅ Одобрить гарантию', onClick: () => transition('guarantee_approve'), color: 'bg-green-600' });
      actions.push({ label: '❌ Отклонить', onClick: () => transition('done'), color: 'bg-red-500' });
    }
    if (isAdmin && order.status === 'guarantee_approve') {
      actions.push({ label: '→ Производство', onClick: () => transition('guarantee_production'), color: 'bg-cyan-600' });
    }
    if ((role === 'keramist' || role === 'tech_phys') && order.status === 'guarantee_production') {
      actions.push({ label: '→ Доставка', onClick: () => transition('guarantee_delivery'), color: 'bg-cyan-600' });
    }
    if (isAdmin && order.status === 'guarantee_delivery') {
      actions.push({ label: '✓ Выполнено', onClick: () => transition('done', { completedAt: Date.now() }), color: 'bg-green-600' });
    }
    // Cancel
    if (role === 'doctor' && !['delivery', 'handover', 'closing', 'done', 'cancelled'].includes(order.status)) {
      actions.push({ label: '🚫 Отменить', onClick: () => { if(confirm('Отменить заказ?')) transition('cancelled'); }, color: 'bg-red-500' });
    }
    if (isAdmin && order.status !== 'done' && order.status !== 'cancelled') {
      actions.push({ label: '🚫 Отменить', onClick: () => { if(confirm('Отменить заказ?')) transition('cancelled'); }, color: 'bg-red-400' });
    }

    return actions;
  };

  const actions = getActions();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800">{order.num}</h2>
            <StatusBadge status={order.status} />
            {order.corrections > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">Коррекция ×{order.corrections}</span>}
            {order.is_urgent && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs">⚡ Срочный</span>}
            {order.has_physical_impressions && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">📐 Слепки</span>}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {patient?.fio} • {doctor?.name} • {order.clinic} • {order.category}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
      </div>

      {/* Banners */}
      {order.returnReason && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700">📝 Причина возврата: {order.returnReason}</div>}
      {order.payRecheck && <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-sm text-amber-700">⚠️ Требуется повторное подтверждение оплаты (добавлены позиции после оплаты)</div>}
      {isOverdue(order.dueDate) && !['done','cancelled'].includes(order.status) && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 text-sm text-red-700">⏰ Просрочен! Дата сдачи: {order.dueDate}</div>}

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {(['info','positions','files','chat','history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            {{ info: '📋 Информация', positions: '🔧 Позиции', files: '📁 Файлы', chat: '💬 Чат', history: '📜 История' }[t]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Тип:</span> <span className="font-medium">{order.type}</span></div>
            <div><span className="text-slate-500">Дата сдачи:</span> <span className="font-medium">{order.dueDate} {order.dueTime}</span></div>
            <div><span className="text-slate-500">Срок (дней):</span> <span className="font-medium">{order.termDays || '—'}</span></div>
            <div><span className="text-slate-500">Оплата:</span> <span className="font-medium">{{ pre100:'100% предоплата', pre50:'50% предоплата', post100:'Постоплата', internal:'Внутренний', free:'Бесплатно' }[order.paymentType]}</span></div>
            <div><span className="text-slate-500">Оплачен:</span> <span className={`font-medium ${order.paid ? 'text-green-600' : 'text-red-500'}`}>{order.paid ? 'Да' : 'Нет'}</span></div>
            <div><span className="text-slate-500">Сумма:</span> <span className="font-bold text-cyan-700">{totalSum.toLocaleString()} ₽</span></div>
          </div>
          {order.plan && <div className="bg-slate-50 rounded-lg p-3 text-sm"><span className="text-slate-500">План:</span> {order.plan}</div>}
          {order.address && <div className="text-sm"><span className="text-slate-500">Адрес доставки:</span> {order.address}</div>}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Действия</h4>
              <div className="flex flex-wrap gap-2">
                {actions.map((a, i) => (
                  <button key={i} onClick={a.onClick} className={`${a.color} text-white rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition`}>{a.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Return reason */}
          {showReturn && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
              <label className="text-sm font-medium text-red-700 block mb-2">Причина возврата (обязательно):</label>
              <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full border border-red-300 rounded px-3 py-2 text-sm" rows={3} placeholder="Опишите причину..." />
              <div className="flex gap-2 mt-2">
                <button onClick={() => returnWithReason(order.status === 'quality' ? 'returned' : order.status === 'approve' ? 'correction' : order.status === 'handover' ? 'correction' : 'returned')} className="bg-red-600 text-white rounded px-4 py-1.5 text-sm">Подтвердить возврат</button>
                <button onClick={() => { setShowReturn(false); setReturnReason(''); }} className="text-slate-500 text-sm">Отмена</button>
              </div>
            </div>
          )}

          {/* Admin: change payment type */}
          {isAdmin && order.status === 'admin_pricing' && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Тип оплаты</h4>
              <div className="flex flex-wrap gap-2">
                {['pre100','pre50','post100','internal','free'].map(pt => (
                  <button key={pt} onClick={() => { updateOrder({ paymentType: pt }); toast('Тип оплаты изменён'); }}
                    className={`px-3 py-1.5 rounded text-xs border ${order.paymentType === pt ? 'border-cyan-600 bg-cyan-50 text-cyan-700' : 'border-slate-300 text-slate-600'}`}>
                    {{ pre100:'100% предоплата', pre50:'50% предоплата', post100:'Постоплата', internal:'Внутренний', free:'Бесплатно' }[pt]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'positions' && (
        <div className="space-y-4">
          {order.positions.map((pos, pi) => (
            <div key={pi} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{pos.name}</span>
                <span className="text-sm text-slate-500">×{pos.qty} = {(pos.price * pos.qty).toLocaleString()} ₽</span>
              </div>
              {pos.ops.length > 0 && (
                <table className="w-full text-xs mt-2">
                  <thead><tr className="text-slate-500 border-b">
                    <th className="text-left py-1">Вид работы</th>
                    <th className="text-left py-1">Техник</th>
                    <th className="text-left py-1">Сделка</th>
                    <th className="text-center py-1">CAD</th>
                    <th className="text-center py-1">Произв.</th>
                    <th className="text-center py-1">Доктор</th>
                  </tr></thead>
                  <tbody>
                    {pos.ops.map(op => (
                      <tr key={op.id} className="border-b border-slate-100">
                        <td className="py-1">{op.name}</td>
                        <td className="py-1">{data.users.find((u: User) => u.id === op.techId)?.name || '—'}</td>
                        <td className="py-1">{op.fee.toLocaleString()} ₽</td>
                        <td className="text-center py-1">{op.done ? '✅' : '⬜'}</td>
                        <td className="text-center py-1">{op.proddone ? '✅' : '⬜'}</td>
                        <td className="text-center py-1">{op.docOk ? '✅' : op.docOk === false ? '⬜' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {pos.ops.length === 0 && <div className="text-xs text-slate-400 mt-1">Виды работ не назначены</div>}
            </div>
          ))}

          {/* Progress */}
          {order.positions.length > 1 && (
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Прогресс мультизаказа</div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                {(() => {
                  const total = order.positions.reduce((s, p) => s + p.ops.length, 0);
                  const done = order.positions.reduce((s, p) => s + p.ops.filter(op => op.done || op.proddone).length, 0);
                  const pct = total > 0 ? (done / total * 100) : 0;
                  return <div className="bg-cyan-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>;
                })()}
              </div>
            </div>
          )}

          {/* Admin: add position */}
          {isAdmin && (
            <div>
              <button onClick={() => setShowAddPos(!showAddPos)} className="text-cyan-600 text-sm font-medium">+ Добавить позицию</button>
              {showAddPos && (
                <div className="mt-2 bg-slate-50 rounded-lg p-3">
                  <input value={newPosSearch} onChange={e => setNewPosSearch(e.target.value)} placeholder="Поиск услуги..." className="w-full border rounded px-3 py-1.5 text-sm mb-2" />
                  <div className="max-h-32 overflow-y-auto">
                    {data.catalog.filter((c: CatalogItem) => c.name.toLowerCase().includes(newPosSearch.toLowerCase())).slice(0, 10).map((c: CatalogItem) => (
                      <div key={c.id} onClick={() => {
                        const newPos: Position = { name: c.name, svcId: c.id, cat: c.cat, qty: 1, price: c.price || 0, ops: [] };
                        updateOrder({ positions: [...order.positions, newPos], payRecheck: order.paid ? true : order.payRecheck });
                        setShowAddPos(false); setNewPosSearch('');
                        toast('Позиция добавлена');
                      }} className="px-2 py-1 hover:bg-white cursor-pointer text-sm rounded">{c.name} — {c.price?.toLocaleString()} ₽</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'files' && (
        <div className="space-y-3">
          {order.files.length === 0 && <div className="text-slate-400 text-sm">Файлы не загружены</div>}
          {order.files.map((f: OrderFile) => (
            <div key={f.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
              <span className="text-2xl">{{ face:'📸', photo:'🖼️', ct:'🔬', scan:'📐', other:'📄' }[f.typeCat] || '📄'}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-xs text-slate-400">{(f.size/1024).toFixed(0)} KB • {{ face:'Фото лица', photo:'Фото', ct:'КТ', scan:'Сканы', other:'Другое' }[f.typeCat]}</div>
              </div>
              {f.dataUrl && <a href={f.dataUrl} download={f.name} className="text-cyan-600 text-xs hover:underline">Скачать</a>}
            </div>
          ))}
        </div>
      )}

      {tab === 'chat' && (
        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {order.comments.map((c: OrderComment, i: number) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">{data.users.find((u: User) => u.id === c.by)?.name || c.by}</span>
                  <span>{ROLES_META[c.role]?.label || c.role}</span>
                  <span>{fmtDateTime(c.at)}</span>
                </div>
                <div className="text-sm">{c.txt}</div>
              </div>
            ))}
            {order.comments.length === 0 && <div className="text-slate-400 text-sm text-center py-4">Нет сообщений</div>}
          </div>
          {role !== 'marketer' && (
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Написать комментарий..." className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" onKeyDown={e => {
                if (e.key === 'Enter' && comment.trim()) {
                  updateOrder({ comments: [...order.comments, { by: session.id, role: session.role, at: Date.now(), txt: comment }] });
                  setComment('');
                }
              }} />
              <button onClick={() => { if (comment.trim()) { updateOrder({ comments: [...order.comments, { by: session.id, role: session.role, at: Date.now(), txt: comment }] }); setComment(''); } }} className="bg-cyan-600 text-white rounded-lg px-4 text-sm">→</button>
            </div>
          )}
          {['cadcam','keramist','tech_phys','print3d'].includes(role) && (
            <div className="flex gap-2">
              <button onClick={() => updateOrder({ comments: [...order.comments, { by: session.id, role, at: Date.now(), txt: 'Согласовать цвет' }] })} className="text-xs border border-slate-300 rounded px-2 py-1 hover:bg-slate-50">🎨 Согласовать цвет</button>
              <button onClick={() => updateOrder({ comments: [...order.comments, { by: session.id, role, at: Date.now(), txt: 'Согласовать дизайн' }] })} className="text-xs border border-slate-300 rounded px-2 py-1 hover:bg-slate-50">✏️ Согласовать дизайн</button>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {order.history.map((h: HistoryEntry, i: number) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></div>
              <div>
                <div className="text-slate-700">{h.txt}</div>
                <div className="text-xs text-slate-400">{fmtDateTime(h.at)} • {data.users.find((u: User) => u.id === h.by)?.name || h.by}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== CATALOG VIEW =====
function CatalogView({ data, session, updateData, toast }: any) {
  const [editPrices, setEditPrices] = useState(false);
  const isAdmin = session.role === 'admin' || session.role === 'admin_ztl';
  const grouped: Record<string, Record<string, CatalogItem[]>> = {};
  data.catalog.forEach((c: CatalogItem) => {
    if (!grouped[c.cat]) grouped[c.cat] = {};
    if (!grouped[c.cat][c.sub]) grouped[c.cat][c.sub] = [];
    grouped[c.cat][c.sub].push(c);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-700">Каталог услуг ({data.catalog.length})</h2>
        {isAdmin && <button onClick={() => setEditPrices(!editPrices)} className="text-sm border border-slate-300 rounded-lg px-3 py-1.5">{editPrices ? '✓ Готово' : '✏️ Редактировать'}</button>}
      </div>
      {Object.entries(grouped).map(([cat, subs]) => (
        <div key={cat} className="mb-4">
          <h3 className="font-medium text-slate-700 text-sm mb-2 bg-slate-100 rounded px-3 py-1.5">{cat}</h3>
          {Object.entries(subs).map(([sub, items]) => (
            <div key={sub} className="ml-4 mb-3">
              <div className="text-xs text-slate-500 mb-1 font-medium">{sub}</div>
              <table className="w-full text-sm">
                <tbody>
                  {items.map((item: CatalogItem) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-1.5 px-2">{item.name}</td>
                      <td className="py-1.5 px-2 text-right">
                        {editPrices ? (
                          <input type="number" value={item.price || ''} onChange={e => {
                            updateData((d: AppData) => ({ ...d, catalog: d.catalog.map(c => c.id === item.id ? { ...c, price: e.target.value ? +e.target.value : null } : c) }));
                          }} className="w-20 border rounded px-2 py-0.5 text-right text-xs" placeholder="—" />
                        ) : (
                          <span className="text-slate-600">{item.price ? `${item.price.toLocaleString()} ₽` : 'по запросу'}</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-right text-slate-400 text-xs">{item.term}</td>
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

// ===== PATIENTS VIEW =====
function PatientsView({ data, session, updateData, toast }: any) {
  const myPatients = data.patients.filter((p: Patient) => {
    if (session.role === 'admin') return true;
    if (session.role === 'clinic_mgr') return p.clinic === session.clinic;
    return p.doctors.includes(session.id);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="font-semibold text-slate-700 mb-4">Пациенты ({myPatients.length})</h2>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="text-left px-3 py-2">ФИО</th>
            <th className="text-left px-3 py-2">Пол</th>
            <th className="text-left px-3 py-2">ДР</th>
            <th className="text-left px-3 py-2">Клиника</th>
            <th className="text-left px-3 py-2">Доктора</th>
            <th className="text-left px-3 py-2">Заказов</th>
          </tr>
        </thead>
        <tbody>
          {myPatients.map((p: Patient) => {
            const orderCount = data.orders.filter((o: Order) => o.patientId === p.id).length;
            const docs = p.doctors.map((d: string) => data.users.find((u: User) => u.id === d)?.name).filter(Boolean);
            return (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-3 py-2 font-medium">{p.fio}</td>
                <td className="px-3 py-2">{p.sex}</td>
                <td className="px-3 py-2">{p.bd}</td>
                <td className="px-3 py-2">{p.clinic}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{docs.join(', ') || '—'}</td>
                <td className="px-3 py-2">{orderCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ===== MATERIALS VIEW =====
function MaterialsView({ data, session, updateData, toast }: any) {
  const [matTab, setMatTab] = useState<'stock' | 'income' | 'report'>('stock');
  const [incomeMat, setIncomeMat] = useState('');
  const [incomeQty, setIncomeQty] = useState('');
  const [incomePrice, setIncomePrice] = useState('');
  const [incomeNote, setIncomeNote] = useState('');
  const isAdmin = session.role === 'admin';

  const addIncome = () => {
    if (!incomeMat || !incomeQty) { toast('Заполните поля', 'error'); return; }
    const si: StockIn = { id: uid(), matId: incomeMat, qty: +incomeQty, price: +incomePrice, at: Date.now(), note: incomeNote };
    updateData((d: AppData) => ({
      ...d,
      stockIn: [...d.stockIn, si],
      materials: d.materials.map(m => m.id === incomeMat ? { ...m, stock: m.stock + +incomeQty } : m)
    }));
    setIncomeMat(''); setIncomeQty(''); setIncomePrice(''); setIncomeNote('');
    toast('Приход оформлен');
  };

  const exportCSV = (rows: string[][], filename: string) => {
    const bom = '\uFEFF';
    const csv = bom + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex gap-2 mb-4">
        {(['stock','income','report'] as const).map(t => (
          <button key={t} onClick={() => setMatTab(t)} className={`px-4 py-2 rounded-lg text-sm ${matTab === t ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {{ stock: 'Номенклатура', income: 'Приход', report: 'Отчёт за месяц' }[t]}
          </button>
        ))}
      </div>

      {matTab === 'stock' && (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr><th className="text-left px-3 py-2">Название</th><th className="text-left px-3 py-2">Ед.</th><th className="text-left px-3 py-2">Остаток</th><th className="text-left px-3 py-2">Цена/ед</th></tr>
          </thead>
          <tbody>
            {data.materials.map((m: Material) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2">{m.unit}</td>
                <td className={`px-3 py-2 font-medium ${m.stock < 10 ? 'text-red-600' : ''}`}>{m.stock}</td>
                <td className="px-3 py-2">{isAdmin ? <input type="number" value={m.price} onChange={e => updateData((d: AppData) => ({ ...d, materials: d.materials.map(x => x.id === m.id ? { ...x, price: +e.target.value } : x) }))} className="w-20 border rounded px-2 py-0.5 text-right text-xs" /> : `${m.price} ₽`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {matTab === 'income' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <select value={incomeMat} onChange={e => setIncomeMat(e.target.value)} className="border rounded px-2 py-1.5 text-sm">
              <option value="">Материал</option>
              {data.materials.map((m: Material) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input type="number" value={incomeQty} onChange={e => setIncomeQty(e.target.value)} placeholder="Кол-во" className="border rounded px-2 py-1.5 text-sm" />
            <input type="number" value={incomePrice} onChange={e => setIncomePrice(e.target.value)} placeholder="Цена" className="border rounded px-2 py-1.5 text-sm" />
            <input value={incomeNote} onChange={e => setIncomeNote(e.target.value)} placeholder="Примечание" className="border rounded px-2 py-1.5 text-sm" />
            <button onClick={addIncome} className="bg-cyan-600 text-white rounded px-3 py-1.5 text-sm">Оформить приход</button>
          </div>
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-slate-600 mb-2">История приходов</h4>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b"><tr><th className="text-left px-2 py-1">Дата</th><th className="text-left px-2 py-1">Материал</th><th className="text-left px-2 py-1">Кол-во</th><th className="text-left px-2 py-1">Цена</th><th className="text-left px-2 py-1">Прим.</th></tr></thead>
              <tbody>
                {data.stockIn.slice().reverse().map((si: StockIn) => (
                  <tr key={si.id} className="border-b border-slate-100">
                    <td className="px-2 py-1">{fmtDate(si.at)}</td>
                    <td className="px-2 py-1">{data.materials.find((m: Material) => m.id === si.matId)?.name}</td>
                    <td className="px-2 py-1">{si.qty}</td>
                    <td className="px-2 py-1">{si.price} ₽</td>
                    <td className="px-2 py-1 text-slate-400">{si.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {matTab === 'report' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Расход материалов за текущий месяц:</p>
          <button onClick={() => {
            const rows = [['Материал', 'Ед.', 'Остаток', 'Цена']];
            data.materials.forEach((m: Material) => rows.push([m.name, m.unit, String(m.stock), String(m.price)]));
            exportCSV(rows, 'materials_report.csv');
            toast('CSV выгружен');
          }} className="bg-green-600 text-white rounded px-4 py-2 text-sm">📥 Выгрузить CSV</button>
        </div>
      )}
    </div>
  );
}

// ===== WORK TYPES VIEW =====
function WorkTypesView({ data, updateData, toast }: any) {
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const addWt = () => {
    if (!newName) { toast('Укажите название', 'error'); return; }
    updateData((d: AppData) => ({ ...d, workTypes: [...d.workTypes, { id: uid(), name: newName, defPrice: +newPrice || 0 }] }));
    setNewName(''); setNewPrice('');
    toast('Вид работ добавлен');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="font-semibold text-slate-700 mb-4">Виды работ</h2>
      <div className="flex gap-2 mb-4">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Название" className="flex-1 border rounded px-3 py-2 text-sm" />
        <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Реком. цена" className="w-32 border rounded px-3 py-2 text-sm" />
        <button onClick={addWt} className="bg-cyan-600 text-white rounded px-4 py-2 text-sm">Добавить</button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b"><tr><th className="text-left px-3 py-2">Название</th><th className="text-left px-3 py-2">Реком. цена</th><th className="px-3 py-2"></th></tr></thead>
        <tbody>
          {data.workTypes.map((wt: WorkType) => (
            <tr key={wt.id} className="border-b border-slate-100">
              <td className="px-3 py-2"><input value={wt.name} onChange={e => updateData((d: AppData) => ({ ...d, workTypes: d.workTypes.map(w => w.id === wt.id ? { ...w, name: e.target.value } : w) }))} className="border rounded px-2 py-1 text-sm w-full" /></td>
              <td className="px-3 py-2"><input type="number" value={wt.defPrice} onChange={e => updateData((d: AppData) => ({ ...d, workTypes: d.workTypes.map(w => w.id === wt.id ? { ...w, defPrice: +e.target.value } : w) }))} className="border rounded px-2 py-1 text-sm w-24 text-right" /></td>
              <td className="px-3 py-2"><button onClick={() => { updateData((d: AppData) => ({ ...d, workTypes: d.workTypes.filter(w => w.id !== wt.id) })); toast('Удалено'); }} className="text-red-400 hover:text-red-600 text-xs">Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== MY PIECEWORK =====
function MyPieceworkView({ data, session }: any) {
  const [period, setPeriod] = useState('month');
  const now = Date.now();
  const periods: Record<string, number> = { week: 7*86400000, month: 30*86400000, year: 365*86400000, all: Infinity };
  const cutoff = period === 'all' ? 0 : now - periods[period];

  const myOps = data.orders.flatMap((o: Order) => o.positions.flatMap(p => p.ops.filter((op: PositionOp) => op.techId === session.id && op.assignedAt >= cutoff)));
  const totalFee = myOps.reduce((s: number, op: PositionOp) => s + op.fee, 0);
  const doneOps = myOps.filter((op: PositionOp) => op.completedAt);
  const doneFee = doneOps.reduce((s: number, op: PositionOp) => s + op.fee, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[['week','Неделя'],['month','Месяц'],['year','Год'],['all','Всё время']].map(([v,l]) => (
          <button key={v} onClick={() => setPeriod(v)} className={`px-3 py-1.5 rounded text-sm ${period === v ? 'bg-cyan-600 text-white' : 'bg-white text-slate-600 border'}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Видов работ" value={myOps.length} color="bg-cyan-500" />
        <KpiCard label="Выполнено" value={doneOps.length} color="bg-green-500" />
        <KpiCard label="Сумма сделки" value={`${(totalFee/1000).toFixed(1)}к ₽`} color="bg-amber-500" />
        <KpiCard label="Завершённые" value={`${(doneFee/1000).toFixed(1)}к ₽`} color="bg-purple-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr><th className="text-left px-3 py-2">Заказ</th><th className="text-left px-3 py-2">Вид работы</th><th className="text-left px-3 py-2">Сделка</th><th className="text-left px-3 py-2">Статус</th><th className="text-left px-3 py-2">Дата</th></tr></thead>
          <tbody>
            {myOps.map((op: PositionOp, i: number) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="px-3 py-2">{data.orders.find((o: Order) => o.positions.some(p => p.ops.some((x: PositionOp) => x.id === op.id)))?.num}</td>
                <td className="px-3 py-2">{op.name}</td>
                <td className="px-3 py-2 font-medium">{op.fee.toLocaleString()} ₽</td>
                <td className="px-3 py-2">{op.done || op.proddone ? <span className="text-green-600">✅</span> : <span className="text-amber-600">⏳</span>}</td>
                <td className="px-3 py-2 text-xs text-slate-400">{fmtDate(op.assignedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== REPORTS =====
function ReportsView({ data, session }: any) {
  const [repTab, setRepTab] = useState('bytech');

  const exportCSV = (rows: string[][], filename: string) => {
    const bom = '\uFEFF';
    const csv = bom + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  };

  const techs = data.users.filter((u: User) => ['cadcam','keramist','tech_phys','print3d','gips','scan'].includes(u.role));

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setRepTab('bytech')} className={`px-4 py-2 rounded text-sm ${repTab === 'bytech' ? 'bg-cyan-600 text-white' : 'bg-slate-100'}`}>По технику</button>
        <button onClick={() => setRepTab('fees')} className={`px-4 py-2 rounded text-sm ${repTab === 'fees' ? 'bg-cyan-600 text-white' : 'bg-slate-100'}`}>Сделка техников</button>
        <button onClick={() => setRepTab('profit')} className={`px-4 py-2 rounded text-sm ${repTab === 'profit' ? 'bg-cyan-600 text-white' : 'bg-slate-100'}`}>Прибыльность</button>
      </div>

      {repTab === 'bytech' && (
        <div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr><th className="text-left px-3 py-2">Техник</th><th className="text-left px-3 py-2">Роль</th><th className="text-left px-3 py-2">Заказов</th><th className="text-left px-3 py-2">Работ</th><th className="text-left px-3 py-2">Сумма сделки</th></tr></thead>
            <tbody>
              {techs.map((t: User) => {
                const ops = data.orders.flatMap((o: Order) => o.positions.flatMap(p => p.ops.filter((op: PositionOp) => op.techId === t.id)));
                const orderIds = new Set(data.orders.filter((o: Order) => o.positions.some(p => p.ops.some((op: PositionOp) => op.techId === t.id))).map((o: Order) => o.id));
                const fee = ops.reduce((s: number, op: PositionOp) => s + op.fee, 0);
                return (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2 text-xs">{ROLES_META[t.role]?.label}</td>
                    <td className="px-3 py-2">{orderIds.size}</td>
                    <td className="px-3 py-2">{ops.length}</td>
                    <td className="px-3 py-2 font-medium">{fee.toLocaleString()} ₽</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={() => {
            const rows = [['Техник', 'Роль', 'Заказов', 'Работ', 'Сумма сделки']];
            techs.forEach((t: User) => {
              const ops = data.orders.flatMap((o: Order) => o.positions.flatMap(p => p.ops.filter((op: PositionOp) => op.techId === t.id)));
              const orderIds = new Set(data.orders.filter((o: Order) => o.positions.some(p => p.ops.some((op: PositionOp) => op.techId === t.id))).map((o: Order) => o.id));
              const fee = ops.reduce((s: number, op: PositionOp) => s + op.fee, 0);
              rows.push([t.name, ROLES_META[t.role]?.label || '', String(orderIds.size), String(ops.length), String(fee)]);
            });
            exportCSV(rows, 'tech_report.csv');
          }} className="mt-3 bg-green-600 text-white rounded px-4 py-2 text-sm">📥 CSV</button>
        </div>
      )}

      {repTab === 'fees' && (
        <div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr><th className="text-left px-3 py-2">Техник</th><th className="text-left px-3 py-2">Всего сделок</th><th className="text-left px-3 py-2">Завершённых</th></tr></thead>
            <tbody>
              {techs.map((t: User) => {
                const allOps = data.orders.flatMap((o: Order) => o.positions.flatMap(p => p.ops.filter((op: PositionOp) => op.techId === t.id)));
                const doneOps = allOps.filter((op: PositionOp) => op.completedAt);
                return (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{t.name}</td>
                    <td className="px-3 py-2">{allOps.reduce((s: number, op: PositionOp) => s + op.fee, 0).toLocaleString()} ₽</td>
                    <td className="px-3 py-2">{doneOps.reduce((s: number, op: PositionOp) => s + op.fee, 0).toLocaleString()} ₽</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {repTab === 'profit' && (
        <div>
          {(() => {
            const internal = data.orders.filter((o: Order) => o.paymentType === 'internal' && o.status === 'done');
            const totalRev = internal.reduce((s: number, o: Order) => s + o.positions.reduce((ps: number, p: Position) => ps + p.price * p.qty, 0), 0);
            const totalFees = internal.reduce((s: number, o: Order) => s + o.positions.reduce((ps: number, p: Position) => ps + p.ops.reduce((os: number, op: PositionOp) => os + op.fee, 0), 0), 0);
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <KpiCard label="Выручка" value={`${(totalRev/1000).toFixed(0)}к ₽`} color="bg-green-500" />
                  <KpiCard label="Сделки" value={`${(totalFees/1000).toFixed(0)}к ₽`} color="bg-amber-500" />
                  <KpiCard label="Прибыль" value={`${((totalRev-totalFees)/1000).toFixed(0)}к ₽`} color="bg-cyan-500" />
                </div>
                <p className="text-sm text-slate-500">Внутренних заказов выполнено: {internal.length}</p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ===== GMAI =====
function GmaiView({ data, session, updateData, toast }: any) {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [showReport, setShowReport] = useState<MirrorReport | null>(null);

  const generateReport = () => {
    if (!selectedPatient) { toast('Выберите пациента', 'error'); return; }
    const patient = data.patients.find((p: Patient) => p.id === selectedPatient);
    const patientOrders = data.orders.filter((o: Order) => o.patientId === selectedPatient);
    const report: MirrorReport = {
      id: uid(), patientId: selectedPatient, at: Date.now(), by: session.id,
      text: `План лечения для пациента ${patient?.fio}:\n\nНа основе ${patientOrders.length} заказов в истории:\n` +
        patientOrders.map((o: Order) => `- ${o.positions.map(p => p.name).join(', ')} (${STATUS_LABELS[o.status]})`).join('\n') +
        '\n\nРекомендации: Продолжить план лечения согласно установленным конструкциям. Контрольный осмотр через 6 месяцев.'
    };
    updateData((d: AppData) => ({ ...d, mirrorReports: [...d.mirrorReports, report] }));
    setShowReport(report);
    toast('Отчёт сформирован');
  };

  const myPatients = data.patients.filter((p: Patient) => {
    if (session.role === 'admin') return true;
    return p.doctors.includes(session.id);
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-slate-700 mb-4">GnatoneMirror AI</h2>
        <div className="flex gap-2 mb-4">
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm">
            <option value="">Выберите пациента</option>
            {myPatients.map((p: Patient) => <option key={p.id} value={p.id}>{p.fio}</option>)}
          </select>
          <button onClick={generateReport} className="bg-cyan-600 text-white rounded px-4 py-2 text-sm">Сформировать отчёт</button>
        </div>

        <h3 className="text-sm font-medium text-slate-600 mb-2">История отчётов</h3>
        <div className="space-y-2">
          {data.mirrorReports.map((r: MirrorReport) => (
            <div key={r.id} className="border border-slate-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{data.patients.find((p: Patient) => p.id === r.patientId)?.fio}</div>
                <div className="text-xs text-slate-400">{fmtDateTime(r.at)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReport(r)} className="text-cyan-600 text-xs">Просмотр</button>
                {session.role === 'admin' && <button onClick={() => { updateData((d: AppData) => ({ ...d, mirrorReports: d.mirrorReports.filter(x => x.id !== r.id) })); toast('Удалено'); }} className="text-red-400 text-xs">Удалить</button>}
              </div>
            </div>
          ))}
          {data.mirrorReports.length === 0 && <p className="text-sm text-slate-400">Отчётов пока нет</p>}
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReport(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-3">Отчёт GMAI</h3>
            <pre className="text-sm whitespace-pre-wrap bg-slate-50 rounded p-4 max-h-80 overflow-y-auto">{showReport.text}</pre>
            <button onClick={() => setShowReport(null)} className="mt-4 bg-slate-200 rounded px-4 py-2 text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== USERS VIEW =====
function UsersView({ data, updateData, toast }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ login: '', pass: '', name: '', role: 'doctor', clinic: '', mirror: false });

  const save = () => {
    if (!form.login || !form.name) { toast('Заполните обязательные поля', 'error'); return; }
    if (editUser) {
      updateData((d: AppData) => ({ ...d, users: d.users.map(u => u.id === editUser.id ? { ...u, ...form } : u) }));
      toast('Пользователь обновлён');
    } else {
      updateData((d: AppData) => ({ ...d, users: [...d.users, { id: uid(), ...form }] }));
      toast('Пользователь добавлен');
    }
    setShowAdd(false); setEditUser(null); setForm({ login: '', pass: '', name: '', role: 'doctor', clinic: '', mirror: false });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-700">Пользователи ({data.users.length})</h2>
        <button onClick={() => { setShowAdd(true); setEditUser(null); setForm({ login: '', pass: '', name: '', role: 'doctor', clinic: '', mirror: false }); }} className="bg-cyan-600 text-white rounded px-4 py-2 text-sm">+ Добавить</button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b"><tr><th className="text-left px-3 py-2">Имя</th><th className="text-left px-3 py-2">Логин</th><th className="text-left px-3 py-2">Роль</th><th className="text-left px-3 py-2">Клиника</th><th className="px-3 py-2"></th></tr></thead>
        <tbody>
          {data.users.map((u: User) => (
            <tr key={u.id} className="border-b border-slate-100">
              <td className="px-3 py-2">{u.name}</td>
              <td className="px-3 py-2 text-slate-500">{u.login}</td>
              <td className="px-3 py-2"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{ROLES_META[u.role]?.label}</span></td>
              <td className="px-3 py-2 text-slate-500">{u.clinic || '—'}</td>
              <td className="px-3 py-2">
                <button onClick={() => { setEditUser(u); setForm({ login: u.login, pass: u.pass, name: u.name, role: u.role, clinic: u.clinic || '', mirror: u.mirror || false }); setShowAdd(true); }} className="text-cyan-600 text-xs mr-2">✏️</button>
                <button onClick={() => { if(confirm('Удалить?')) { updateData((d: AppData) => ({ ...d, users: d.users.filter(x => x.id !== u.id) })); toast('Удалён'); } }} className="text-red-400 text-xs">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Roles section */}
      <div className="mt-6 border-t pt-4">
        <h3 className="font-medium text-slate-700 mb-3">Роли и права</h3>
        <div className="space-y-2">
          {Object.entries(ROLES_META).map(([key, meta]) => (
            <div key={key} className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{meta.label}</span>
                <span className="text-xs text-slate-400">{key}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{meta.desc}</p>
              <div className="text-xs text-slate-400 mt-1">Видит все: {meta.seeAll ? '✅' : '❌'} | Статусов: {meta.statuses.length}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">{editUser ? 'Редактировать' : 'Новый пользователь'}</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Имя *" className="w-full border rounded px-3 py-2 text-sm" />
              <input value={form.login} onChange={e => setForm({...form, login: e.target.value})} placeholder="Логин *" className="w-full border rounded px-3 py-2 text-sm" />
              <input value={form.pass} onChange={e => setForm({...form, pass: e.target.value})} placeholder="Пароль" className="w-full border rounded px-3 py-2 text-sm" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded px-3 py-2 text-sm">
                {Object.entries(ROLES_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <input value={form.clinic} onChange={e => setForm({...form, clinic: e.target.value})} placeholder="Клиника" className="w-full border rounded px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.mirror} onChange={e => setForm({...form, mirror: e.target.checked})} /> Доступ к GMAI</label>
              <div className="flex gap-2 pt-2">
                <button onClick={save} className="bg-cyan-600 text-white rounded px-4 py-2 text-sm">Сохранить</button>
                <button onClick={() => setShowAdd(false)} className="border rounded px-4 py-2 text-sm">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== NEWS VIEW =====
function NewsView({ data, session, updateData, toast }: any) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const publish = () => {
    if (!title || !text) { toast('Заполните все поля', 'error'); return; }
    updateData((d: AppData) => ({ ...d, news: [{ id: uid(), title, text, by: session.id, at: Date.now() }, ...d.news] }));
    setTitle(''); setText('');
    toast('Новость опубликована');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="font-semibold text-slate-700 mb-4">Публикация новости</h2>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Заголовок" className="w-full border rounded px-3 py-2 text-sm mb-2" />
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Текст новости..." className="w-full border rounded px-3 py-2 text-sm mb-2" rows={4} />
        <button onClick={publish} className="bg-cyan-600 text-white rounded px-4 py-2 text-sm">Опубликовать</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-slate-700 mb-3">Опубликованные новости</h3>
        <div className="space-y-3">
          {data.news.map((n: NewsItem) => (
            <div key={n.id} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{n.title}</h4>
                <button onClick={() => { updateData((d: AppData) => ({ ...d, news: d.news.filter(x => x.id !== n.id) })); toast('Удалено'); }} className="text-red-400 text-xs">🗑️</button>
              </div>
              <p className="text-sm text-slate-600 mt-1">{n.text}</p>
              <div className="text-xs text-slate-400 mt-2">{fmtDateTime(n.at)} • {data.users.find((u: User) => u.id === n.by)?.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
