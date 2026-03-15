<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --ink:#e8f0ff;--ink2:#c0d0f0;--ink3:#8aA0cc;
    --surface:#0d1b3e;--surface2:#1a2a52;--surface3:#1e3060;
    --border:rgba(255,255,255,0.1);--border2:rgba(255,255,255,0.16);
    --green:#4dd87a;--green-bg:#0a2a1a;
    --amber:#f0b030;--amber-bg:#241c06;
    --blue:#90c0ff;--blue-bg:#0d1e40;
    --purple:#c09af8;--purple-bg:#1a0f2e;
    --red:#f87070;--red-bg:#2a0a0a;
  }
  body{font-family:'Sora',sans-serif;background:var(--surface);color:var(--ink);line-height:1.6;padding:2.5rem 3rem 4rem;max-width:900px;margin:0 auto}

  /* Hero — two column layout */
  .hero{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start;margin-bottom:3rem}
  .brand{display:flex;align-items:center;gap:10px;margin-bottom:.6rem}
  .brand-icon{width:40px;height:40px;background:rgba(255,255,255,0.12);border:0.5px solid rgba(255,255,255,0.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}
  .brand-name{font-size:2rem;font-weight:700;letter-spacing:-0.04em;color:var(--ink)}
  .tagline{font-size:.9rem;color:var(--ink3);font-weight:300;margin-bottom:1.2rem;line-height:1.8}
  .badges{display:flex;flex-wrap:wrap;gap:6px}
  .badge{font-family:'DM Mono',monospace;font-size:11px;padding:3px 8px;border-radius:4px;font-weight:500;white-space:nowrap}
  .b-green{background:var(--green-bg);color:var(--green)}
  .b-amber{background:var(--amber-bg);color:var(--amber)}
  .b-blue{background:var(--blue-bg);color:var(--blue)}
  .b-purple{background:var(--purple-bg);color:var(--purple)}
  .b-red{background:var(--red-bg);color:var(--red)}

  /* Hero right — stat cards stacked */
  .hero-stats{display:flex;flex-direction:column;gap:10px}
  .stat-card{background:var(--surface2);border:0.5px solid var(--border2);border-radius:10px;padding:.85rem 1.1rem;display:flex;align-items:center;justify-content:space-between}
  .stat-num{font-size:1.4rem;font-weight:700;letter-spacing:-0.03em;color:var(--ink)}
  .stat-lbl{font-size:11px;color:var(--ink3);font-family:'DM Mono',monospace;text-align:right}

  /* Sections */
  h2{font-size:1rem;font-weight:600;color:var(--ink);margin:2.5rem 0 1rem;display:flex;align-items:center;gap:8px;letter-spacing:-0.01em}
  h2::after{content:'';flex:1;height:0.5px;background:var(--border2)}

  /* Stack grid */
  .stack-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .stack-card{background:var(--surface2);border:0.5px solid var(--border);border-radius:10px;padding:1rem 1.2rem}
  .stack-title{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--ink3);margin-bottom:.7rem;font-family:'DM Mono',monospace}
  .tech-item{display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--ink2);padding:5px 0;border-bottom:0.5px solid var(--border)}
  .tech-item:last-child{border-bottom:none}
  .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .dot-green{background:var(--green)}
  .dot-blue{background:var(--blue)}
  .dot-amber{background:var(--amber)}
  .dot-purple{background:var(--purple)}

  /* Features */
  .feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .feat-card{background:var(--surface2);border:0.5px solid var(--border);border-radius:10px;padding:1rem 1.2rem}
  .feat-label{font-size:.72rem;font-weight:600;letter-spacing:.07em;text-transform:uppercase;margin-bottom:.65rem;font-family:'DM Mono',monospace}
  .fl-user{color:var(--blue)}.fl-admin{color:var(--purple)}.fl-auth{color:var(--red)}.fl-perf{color:var(--green)}.fl-analytics{color:var(--amber)}
  .feat-list{list-style:none;display:flex;flex-direction:column;gap:5px}
  .feat-list li{font-size:.82rem;color:var(--ink2);display:flex;align-items:flex-start;gap:7px;line-height:1.5}
  .feat-list li::before{content:'→';color:var(--ink3);font-size:.72rem;margin-top:2px;flex-shrink:0;font-family:'DM Mono',monospace}

  /* Status pills */
  .status-flow{display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin-top:10px}
  .status-pill{font-size:.7rem;font-family:'DM Mono',monospace;padding:3px 9px;border-radius:20px;white-space:nowrap}
  .s-processing{background:var(--amber-bg);color:var(--amber)}
  .s-shipped{background:var(--blue-bg);color:var(--blue)}
  .s-delivered{background:var(--green-bg);color:var(--green)}
  .s-cancelled{background:var(--red-bg);color:var(--red)}
  .status-arrow{font-size:.62rem;color:var(--ink3);font-family:'DM Mono',monospace}

  /* Install */
  .install-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .step{background:var(--surface2);border:0.5px solid var(--border);border-radius:10px;padding:1rem 1.2rem}
  .step-num{font-size:.7rem;font-family:'DM Mono',monospace;color:var(--ink3);margin-bottom:.4rem}
  .step-title{font-size:.84rem;font-weight:600;color:var(--ink);margin-bottom:.5rem}
  .step-desc{font-size:.76rem;color:var(--ink3);margin-bottom:.5rem;line-height:1.5}
  pre{background:var(--surface3);border:0.5px solid var(--border);border-radius:6px;padding:.6rem .8rem;font-family:'DM Mono',monospace;font-size:.72rem;color:var(--ink2);overflow-x:auto;white-space:pre;line-height:1.7;margin-top:4px}
  code{font-family:'DM Mono',monospace;font-size:.76rem;background:var(--surface3);padding:1px 5px;border-radius:3px}

  /* API */
  .api-grid{display:flex;flex-wrap:wrap;gap:8px}
  .api-pill{background:var(--surface2);border:0.5px solid var(--border2);border-radius:6px;padding:5px 14px;font-size:.78rem;font-family:'DM Mono',monospace;color:var(--ink2)}

  /* Author */
  .author-card{background:var(--surface2);border:0.5px solid var(--border);border-radius:12px;padding:1.1rem 1.4rem;margin-top:2rem}
  .author-name{font-size:.9rem;font-weight:600;color:var(--ink);margin-bottom:2px}
  .author-bio{font-size:.8rem;color:var(--ink3)}

  /* Footer */
  .footer-note{margin-top:2rem;padding-top:1.2rem;border-top:0.5px solid var(--border);font-size:.76rem;color:var(--ink3);text-align:center;font-family:'DM Mono',monospace}

  @media(max-width:600px){
    .hero{grid-template-columns:1fr}
    .stack-grid,.feat-grid,.install-grid{grid-template-columns:1fr}
    body{padding:1.5rem 1.2rem 3rem}
  }
</style>
</head>
<body>

<!-- Hero: description left, stats right -->
<div class="hero">
  <div class="hero-left">
    <div class="brand">
      <div class="brand-icon">🛒</div>
      <span class="brand-name">NestCart</span>
    </div>
    <p class="tagline">A full-stack e-commerce platform built for scale — secure auth, role-based control, real-time order management, and an analytics dashboard out of the box.</p>
    <div class="badges">
      <span class="badge b-green">NestJS</span>
      <span class="badge b-blue">React.js</span>
      <span class="badge b-amber">MySQL</span>
      <span class="badge b-purple">Prisma ORM</span>
      <span class="badge b-green">JWT Auth</span>
      <span class="badge b-red">RBAC</span>
      <span class="badge b-blue">Bcrypt</span>
    </div>
  </div>
  <div class="hero-stats">
    <div class="stat-card">
      <span class="stat-num">6</span>
      <span class="stat-lbl">API Modules</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">2</span>
      <span class="stat-lbl">User Roles</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">4</span>
      <span class="stat-lbl">Order States</span>
    </div>
    <div class="stat-card">
      <span class="stat-num">3+</span>
      <span class="stat-lbl">Perf Optimisations</span>
    </div>
  </div>
</div>

<!-- Tech Stack -->
<h2>Tech Stack</h2>
<div class="stack-grid">
  <div class="stack-card">
    <div class="stack-title">Backend</div>
    <div class="tech-item"><span class="dot dot-green"></span>NestJS — Scalable Node.js framework</div>
    <div class="tech-item"><span class="dot dot-purple"></span>Prisma ORM — Efficient DB queries</div>
    <div class="tech-item"><span class="dot dot-amber"></span>MySQL — Relational database</div>
    <div class="tech-item"><span class="dot dot-blue"></span>JWT — Secure token authentication</div>
    <div class="tech-item"><span class="dot dot-blue"></span>Bcrypt — Password hashing</div>
  </div>
  <div class="stack-card">
    <div class="stack-title">Frontend</div>
    <div class="tech-item"><span class="dot dot-blue"></span>React.js — Component-driven UI</div>
    <div class="tech-item"><span class="dot dot-green"></span>React Lazy Loading — Fast initial load</div>
    <div class="tech-item"><span class="dot dot-purple"></span>Pagination — Scalable data display</div>
    <div class="tech-item"><span class="dot dot-amber"></span>Chart Visualisation — Analytics UI</div>
    <div class="tech-item"><span class="dot dot-green"></span>Responsive — Mobile-first design</div>
  </div>
</div>

<!-- Features -->
<h2>Features</h2>
<div class="feat-grid">
  <div class="feat-card">
    <div class="feat-label fl-user">👤 User</div>
    <ul class="feat-list">
      <li>Register &amp; login securely</li>
      <li>Browse, search &amp; filter products</li>
      <li>Cart &amp; Wishlist management</li>
      <li>Place orders and track status</li>
      <li>View full order history</li>
    </ul>
  </div>
  <div class="feat-card">
    <div class="feat-label fl-admin">🛠 Admin</div>
    <ul class="feat-list">
      <li>Add &amp; manage products by category</li>
      <li>View and manage all user orders</li>
      <li>Update order status in real time</li>
      <li>Monitor product inventory</li>
      <li>Access analytics dashboard</li>
    </ul>
    <div class="status-flow">
      <span class="status-pill s-processing">Processing</span>
      <span class="status-arrow">→</span>
      <span class="status-pill s-shipped">Shipped</span>
      <span class="status-arrow">→</span>
      <span class="status-pill s-delivered">Delivered</span>
      <span class="status-arrow">|</span>
      <span class="status-pill s-cancelled">Cancelled</span>
    </div>
  </div>
  <div class="feat-card">
    <div class="feat-label fl-auth">🔐 Security</div>
    <ul class="feat-list">
      <li>JWT-based stateless auth</li>
      <li>Passwords hashed with Bcrypt</li>
      <li>RBAC — Admin &amp; User roles</li>
      <li>Protected API endpoints per role</li>
    </ul>
  </div>
  <div class="feat-card">
    <div class="feat-label fl-analytics">📊 Analytics</div>
    <ul class="feat-list">
      <li>Total company revenue at a glance</li>
      <li>Most sold products ranking</li>
      <li>Low stock product alerts</li>
      <li>Bar chart data visualisations</li>
    </ul>
  </div>
  <div class="feat-card" style="grid-column:1/-1">
    <div class="feat-label fl-perf">⚡ Performance</div>
    <ul class="feat-list" style="display:grid;grid-template-columns:1fr 1fr;gap:5px 2rem">
      <li>React Lazy Loading — reduced initial load</li>
      <li>Pagination — efficient large dataset handling</li>
      <li>Prisma ORM — optimised query execution</li>
      <li>Role-scoped queries — no over-fetching</li>
    </ul>
  </div>
</div>

<!-- API Modules -->
<h2>API Modules</h2>
<div class="api-grid">
  <span class="api-pill">Auth API</span>
  <span class="api-pill">Product API</span>
  <span class="api-pill">Cart API</span>
  <span class="api-pill">Wishlist API</span>
  <span class="api-pill">Order API</span>
  <span class="api-pill">Analytics API</span>
</div>

<!-- Getting Started -->
<h2>Getting Started</h2>
<div class="install-grid">
  <div class="step">
    <div class="step-num">Step 01</div>
    <div class="step-title">Clone the repo</div>
    <pre>git clone https://github.com/your-username/nestcart.git
cd nestcart</pre>
  </div>
  <div class="step">
    <div class="step-num">Step 02</div>
    <div class="step-title">Configure &amp; start backend</div>
    <div class="step-desc">Add <code>.env</code> with DB credentials &amp; JWT secret inside <code>/server</code>, then:</div>
    <pre>cd server && npm install
npx prisma migrate dev
npm run start:dev</pre>
  </div>
  <div class="step">
    <div class="step-num">Step 03</div>
    <div class="step-title">Start the frontend</div>
    <pre>cd client && npm install
npm run dev</pre>
  </div>
</div>

<!-- Author -->
<div class="author-card">
  <div class="author-name">Nikesh S</div>
  <div class="author-bio">Full Stack Developer — building scalable web applications with modern technologies.</div>
</div>

<div class="footer-note">⭐ If you find NestCart useful, consider starring it on GitHub.</div>

</body>
</html>
