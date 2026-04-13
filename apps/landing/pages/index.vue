<template>
  <main class="container">
    <section class="hero" style="padding: 5rem 0; display: grid; gap: 2rem;">
      <div style="max-width: 720px;">
        <p style="color: #ff7b72; text-transform: uppercase; letter-spacing: 0.24em; font-size: 0.75rem; margin-bottom: 1rem;">DeadFuse.js</p>
        <h1 style="font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.05; margin: 0 0 1.2rem;">Lightweight remote control for deployed web apps.</h1>
        <p style="font-size: 1rem; line-height: 1.8; color: #cbd5e1; max-width: 44rem; margin-bottom: 2rem;">Switch a client app into read-only, limited, or locked mode instantly from a dashboard — without redeploying. DeadFuse keeps your enforcement ethical, recoverable, and safe for freelancer workflows.</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
          <NuxtLink to="/" class="btn-primary">View the dashboard</NuxtLink>
          <a href="#features" style="color: #cbd5e1; font-weight: 600;">See how it works →</a>
        </div>
      </div>

      <div style="display: grid; gap: 1rem;">
        <div class="section-card">
          <p style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 0.75rem;">Ethical enforcement</p>
          <h2 style="margin: 0 0 0.5rem; font-size: 1.5rem;">Never destroy client data.</h2>
          <p style="margin: 0; color: #cbd5e1;">Use read-only as the default mode, block risky actions gracefully, and keep recovery fast after payment issues.</p>
        </div>
        <div class="section-card">
          <p style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 0.75rem;">Instant control</p>
          <h2 style="margin: 0 0 0.5rem; font-size: 1.5rem;">Remote state updates.</h2>
          <p style="margin: 0; color: #cbd5e1;">Connected client apps respond instantly over WebSocket when the dashboard changes project state.</p>
        </div>
      </div>
    </section>

    <section id="features" style="padding-bottom: 5rem;">
      <h2 style="font-size: 2rem; margin-bottom: 1rem;">Built for freelancers and agencies</h2>
      <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));">
        <div class="section-card">
          <strong>Dashboard-first</strong>
          <p style="margin: 0.75rem 0 0; color: #cbd5e1;">Manage all client projects from a single Nuxt dashboard with plan-aware limits baked in.</p>
        </div>
        <div class="section-card">
          <strong>SDK integration</strong>
          <p style="margin: 0.75rem 0 0; color: #cbd5e1;">Embed the DeadFuse client library once and let your app react to state changes without redeploying.</p>
        </div>
        <div class="section-card">
          <strong>Graceful fallback</strong>
          <p style="margin: 0.75rem 0 0; color: #cbd5e1;">From warning banners to locked access, the SDK supports smooth degradation without surprises.</p>
        </div>
      </div>
    </section>
  </main>
</template>
