import { FormEvent, ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Factory,
  HandCoins,
  Laptop,
  LifeBuoy,
  LockKeyhole,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  UsersRound,
  Warehouse,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../api/apiClient';

const brandName = 'NexoraOps';

const navItems = [
  { label: 'Overview', path: '/home' },
  { label: 'Modules', path: '/features' },
  { label: 'Industries', path: '/solutions' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Playbooks', path: '/resources' },
  { label: 'Contact', path: '/contact' },
];

const modules = [
  { title: 'Sales & Customers', icon: UsersRound, text: 'Customer records, invoices, sales status, cancellations, exports, and activity history.' },
  { title: 'Inventory Control', icon: PackageSearch, text: 'Product catalog, SKU search, stock visibility, low-stock signals, and item-level sales flow.' },
  { title: 'Procurement', icon: Truck, text: 'Supplier database, purchase orders, expected delivery dates, totals, and order lifecycle.' },
  { title: 'Finance Desk', icon: HandCoins, text: 'Expense capture, vendor spend, approval states, paid/rejected outcomes, and dashboard counts.' },
  { title: 'Projects & Tasks', icon: BriefcaseBusiness, text: 'Operational initiatives, task lists, priorities, budgets, blockers, and due-date ownership.' },
  { title: 'Asset Register', icon: Laptop, text: 'Track equipment tags, assignment, condition, location, repair state, and asset value.' },
  { title: 'Service Tickets', icon: LifeBuoy, text: 'Handle customer, supplier, and internal support requests with priority and resolution notes.' },
  { title: 'Access & Audit', icon: ShieldCheck, text: 'Users, roles, permissions, activity logs, secure panels, and admin-only inquiry review.' },
];

const industries = [
  { title: 'Retail Chains', icon: Store, text: 'Branch inventory, counter sales, POS equipment, staff tasks, and customer issue handling.' },
  { title: 'Distribution Teams', icon: Warehouse, text: 'Supplier lead times, purchase planning, warehouse equipment, dispatch costs, and service tickets.' },
  { title: 'Service Companies', icon: Building2, text: 'Project delivery, support cases, expense approvals, customer follow-up, and role visibility.' },
  { title: 'Light Manufacturing', icon: Factory, text: 'Procurement, asset maintenance, team tasks, operating costs, and management dashboards.' },
];

const playbooks = [
  'Set reorder rules from low-stock patterns and open purchase orders.',
  'Connect expense approval status with month-end finance review.',
  'Create launch projects for every new branch, department, or client rollout.',
  'Use tickets to capture after-sales service, supplier issues, and internal blockers.',
  'Review assets monthly by location, assignee, condition, and repair status.',
  'Qualify public inquiries inside the Admin panel before handing them to sales.',
];

const workflowRows = [
  ['Lead to cash', 'Inquiry is captured, Admin qualifies it, sales creates customer and sale, finance tracks collections and expenses.'],
  ['Requisition to receipt', 'Supplier is selected, purchase order is created, expected date is tracked, and stock planning gets visibility.'],
  ['Issue to resolution', 'Support ticket records the problem, priority is set, team updates status, and resolution stays attached.'],
  ['Asset lifecycle', 'Equipment is purchased, tagged, assigned, moved, repaired, and eventually retired or disposed.'],
];

const rolloutSteps = [
  ['Week 1', 'Clean roles, users, products, customers, and permissions.'],
  ['Week 2', 'Activate suppliers, purchase orders, finance expenses, and project templates.'],
  ['Week 3', 'Add assets, service tickets, inquiry qualification, and operating dashboards.'],
  ['Week 4', 'Review reports, train teams, and tune permissions by department.'],
];

const pricing = [
  { name: 'Operate', price: '$49/mo', bestFor: 'Small teams moving beyond spreadsheets', items: ['Products, customers, sales', 'Expenses and projects', 'Basic dashboards', 'Email support'] },
  { name: 'Control', price: '$129/mo', bestFor: 'Growing teams with purchasing and approvals', items: ['Suppliers and purchase orders', 'Assets and service tickets', 'Role permissions', 'Activity logs'] },
  { name: 'Scale', price: 'Custom', bestFor: 'Multi-branch or process-heavy businesses', items: ['Implementation playbooks', 'Custom workflows', 'Advanced reporting scope', 'Priority support'] },
];

const footerGroups = [
  { title: 'Platform', links: ['Inventory', 'Purchasing', 'Finance', 'Projects', 'Assets', 'Tickets'] },
  { title: 'Company', links: ['Implementation', 'Training', 'Support', 'Security', 'Audit'] },
  { title: 'Panels', links: ['Admin', 'Manager', 'Employee', 'Procurement', 'Finance', 'Support'] },
];

const PageShell = ({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children: ReactNode }) => (
  <>
    <section className="border-b border-surface-800 bg-surface-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-300">{eyebrow}</p>
        <h1 className="mt-5 max-w-5xl text-4xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-400">{text}</p>
      </div>
    </section>
    {children}
  </>
);

const PublicSite = () => {
  const location = useLocation();
  const page = location.pathname.replace('/', '') || 'home';
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    interest: 'ERP implementation discussion',
    message: '',
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/inquiries/public', form);
      toast.success('Inquiry submitted and saved for the Admin team.');
      setForm({ name: '', email: '', company: '', phone: '', interest: 'ERP implementation discussion', message: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-surface-800 bg-surface-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/home" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <BarChart3 size={21} />
            </span>
            <span className="text-lg font-bold">{brandName}</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = item.path === location.pathname || (location.pathname === '/' && item.path === '/home');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'text-slate-400 hover:bg-surface-800 hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link to="/login" className="btn-primary gap-2">
            Login
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main>
        {(page === 'home' || page === '') && (
          <>
            <section className="border-b border-surface-800 bg-surface-950">
              <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-300">Business operating system</p>
                  <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-6xl">
                    Run inventory, finance, purchasing, projects, assets, and support from one ERP.
                  </h1>
                  <p className="mt-6 max-w-3xl text-base leading-7 text-slate-400 sm:text-lg">
                    {brandName} is a practical ERP workspace for growing businesses that need real operational control, not a brochure dashboard.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/contact" className="btn-primary gap-2">Book a workflow review <ArrowRight size={17} /></Link>
                    <Link to="/features" className="btn-secondary">View ERP modules</Link>
                  </div>
                </div>
                <div className="rounded-xl border border-surface-800 bg-surface-900 p-5 shadow-card">
                  <div className="grid grid-cols-2 gap-3">
                    {['Sales', 'Inventory', 'Purchasing', 'Expenses', 'Projects', 'Assets', 'Tickets', 'Audit'].map((item) => (
                      <div key={item} className="rounded-lg border border-surface-700 bg-surface-950 p-4">
                        <CheckCircle2 className="mb-3 text-emerald-300" size={20} />
                        <p className="font-semibold text-white">{item}</p>
                        <p className="mt-1 text-xs text-slate-500">Live records</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Role panels', 'Admin, Manager, and Employee workspaces show only the actions each role should handle.'],
                  ['Database-backed modules', 'Every operational panel uses persistent API records with create, edit, delete, search, and pagination.'],
                  ['Decision-ready dashboards', 'Live counts surface purchasing, expenses, projects, assets, tickets, inquiries, sales, and stock risk.'],
                ].map(([title, text]) => (
                  <article key={title} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="border-y border-surface-800 bg-surface-900/40">
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Control room</p>
                    <h2 className="mt-4 text-3xl font-bold text-white">A management layer for every operational record.</h2>
                    <p className="mt-4 text-sm leading-6 text-slate-400">
                      NexoraOps is organized around real actions: create purchase orders, approve expenses, assign assets, resolve tickets, qualify inquiries, and review live dashboard counts.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['Procurement desk', 'Supplier and PO records stay searchable, editable, and auditable.'],
                      ['Finance desk', 'Expenses show status, vendor, payment method, and ownership.'],
                      ['Service desk', 'Tickets capture priority, requester, source, and resolution.'],
                      ['Asset desk', 'Equipment stays connected to assignees, locations, and condition.'],
                    ].map(([title, text]) => (
                      <article key={title} className="rounded-xl border border-surface-800 bg-surface-950 p-5">
                        <h3 className="font-semibold text-white">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'features' && (
          <PageShell eyebrow="Modules" title="ERP modules that handle actual daily work." text="These modules map to database-backed panels inside the protected app, with role permissions and persistent records.">
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <article key={module.title} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                        <Icon size={22} />
                      </div>
                      <h2 className="text-lg font-semibold text-white">{module.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{module.text}</p>
                    </article>
                  );
                })}
              </div>
              <div className="mt-10 rounded-xl border border-surface-800 bg-surface-900 p-6">
                <h2 className="text-2xl font-bold text-white">Connected workflow coverage</h2>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {workflowRows.map(([title, text]) => (
                    <div key={title} className="rounded-lg border border-surface-700 bg-surface-950 p-4">
                      <h3 className="font-semibold text-brand-300">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </PageShell>
        )}

        {page === 'solutions' && (
          <PageShell eyebrow="Industries" title="Built for teams where stock, money, assets, and service work must stay connected." text="Different businesses use different workflows, but they all need reliable records, role ownership, and fast operational visibility.">
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-4 md:grid-cols-2">
                {industries.map((industry) => {
                  const Icon = industry.icon;
                  return (
                    <article key={industry.title} className="rounded-xl border border-surface-800 bg-surface-900 p-6">
                      <Icon className="text-brand-300" size={26} />
                      <h2 className="mt-5 text-xl font-semibold text-white">{industry.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{industry.text}</p>
                    </article>
                  );
                })}
              </div>
              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {['Owner visibility', 'Department control', 'Operational evidence'].map((title, index) => (
                  <article key={title} className="rounded-xl border border-surface-800 bg-surface-900 p-5">
                    <span className="text-sm font-bold text-brand-300">0{index + 1}</span>
                    <h2 className="mt-3 text-lg font-semibold text-white">{title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {index === 0 && 'Every record has a status, owner context, timestamps, and a clear next action.'}
                      {index === 1 && 'Admin can tune permissions by role so teams only handle the panels they own.'}
                      {index === 2 && 'Activity logs, seeded workflows, and live dashboards make operational reviews easier.'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </PageShell>
        )}

        {page === 'pricing' && (
          <PageShell eyebrow="Pricing" title="Choose the operating depth your business needs." text="Packages are positioned around workflow complexity, not vague feature names.">
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-4 lg:grid-cols-3">
                {pricing.map((plan) => (
                  <article key={plan.name} className="rounded-xl border border-surface-800 bg-surface-900 p-6">
                    <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                    <p className="mt-2 text-sm text-slate-500">{plan.bestFor}</p>
                    <p className="mt-5 text-3xl font-bold text-brand-300">{plan.price}</p>
                    <div className="mt-6 space-y-3">
                      {plan.items.map((item) => (
                        <p key={item} className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle2 size={15} className="text-emerald-300" />
                          {item}
                        </p>
                      ))}
                    </div>
                    <Link to="/contact" className="btn-secondary mt-6 w-full">Discuss rollout</Link>
                  </article>
                ))}
              </div>
              <div className="mt-10 rounded-xl border border-surface-800 bg-surface-900 p-6">
                <h2 className="text-2xl font-bold text-white">What each rollout includes</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {['Role setup and permission review', 'Seed data and workflow testing', 'Public inquiry capture', 'Dashboard KPI validation'].map((item) => (
                    <p key={item} className="flex items-center gap-3 rounded-lg border border-surface-700 bg-surface-950 p-4 text-sm text-slate-300">
                      <CheckCircle2 className="text-emerald-300" size={18} />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          </PageShell>
        )}

        {page === 'resources' && (
          <PageShell eyebrow="Playbooks" title="Operational playbooks for running the ERP properly." text="Use these as rollout guidance for teams adopting the new modules.">
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-3 md:grid-cols-2">
                {playbooks.map((playbook, index) => (
                  <article key={playbook} className="flex gap-4 rounded-xl border border-surface-800 bg-surface-900 p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-sm font-bold text-brand-300">{index + 1}</span>
                    <p className="text-sm leading-6 text-slate-300">{playbook}</p>
                  </article>
                ))}
              </div>
              <div className="mt-10 rounded-xl border border-surface-800 bg-surface-900 p-6">
                <h2 className="text-2xl font-bold text-white">Implementation timeline</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {rolloutSteps.map(([week, text]) => (
                    <article key={week} className="rounded-lg border border-surface-700 bg-surface-950 p-4">
                      <p className="text-sm font-bold text-brand-300">{week}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </PageShell>
        )}

        {page === 'contact' && (
          <PageShell eyebrow="Contact" title="Start with a workflow review, not a generic demo." text="Submit your requirements and the inquiry is saved directly into the Admin panel for qualification and follow-up.">
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <aside className="rounded-xl border border-surface-800 bg-surface-900 p-6">
                  <LockKeyhole className="text-brand-300" size={26} />
                  <h2 className="mt-5 text-xl font-semibold text-white">What happens after submission</h2>
                  <div className="mt-5 space-y-4 text-sm text-slate-400">
                    <p>1. Your inquiry is stored in MongoDB.</p>
                    <p>2. Admin reviews it in Public Inquiries.</p>
                    <p>3. The team updates status from new to contacted, qualified, or closed.</p>
                  </div>
                </aside>
                <form onSubmit={handleSubmit} className="rounded-xl border border-surface-800 bg-surface-900 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="input-field" placeholder="Name" value={form.name} required onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
                    <input className="input-field" type="email" placeholder="Email" value={form.email} required onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
                    <input className="input-field" placeholder="Company" value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} />
                    <input className="input-field" placeholder="Phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
                  </div>
                  <input className="input-field mt-4" placeholder="Main workflow to improve" value={form.interest} onChange={(event) => setForm((prev) => ({ ...prev, interest: event.target.value }))} />
                  <textarea className="input-field mt-4 min-h-36" placeholder="Tell us about your current operations" value={form.message} required onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))} />
                  <button type="submit" disabled={submitting} className="btn-primary mt-5 min-w-36">{submitting ? 'Submitting...' : 'Submit inquiry'}</button>
                </form>
              </div>
            </section>
          </PageShell>
        )}

        <section className="border-t border-surface-800 bg-surface-950">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:px-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
                  <BarChart3 size={21} />
                </span>
                <span className="text-lg font-bold text-white">{brandName}</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                A database-backed ERP workspace for sales, inventory, procurement, finance, projects, assets, service operations, and role-based administration.
              </p>
              <div className="mt-5 space-y-2 text-sm text-slate-500">
                <p className="flex items-center gap-2"><Mail size={15} className="text-brand-300" /> hello@nexoraops.local</p>
                <p className="flex items-center gap-2"><Phone size={15} className="text-brand-300" /> +880 1000 000 000</p>
                <p className="flex items-center gap-2"><MapPin size={15} className="text-brand-300" /> Dhaka, Bangladesh</p>
              </div>
            </div>
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{group.title}</h3>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <p key={link} className="text-sm text-slate-500">{link}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-800">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
              <div className="flex gap-4">
                <Link to="/contact" className="hover:text-brand-300">Contact</Link>
                <Link to="/login" className="hover:text-brand-300">Secure login</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicSite;
