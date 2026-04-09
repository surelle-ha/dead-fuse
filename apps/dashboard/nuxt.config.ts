export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss"],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || "",
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
    public: {
      appUrl: process.env.APP_URL || "http://localhost:3000",
      wsPath: process.env.WS_PATH || "/fuse",
    },
  },

  nitro: {
    // WebSocket disabled - using Supabase Realtime instead
    // experimental: {
    //   websocket: true,
    // },
  },

  typescript: {
    strict: true,
  },

  app: {
    head: {
      title: "DeadFuse – License Control Dashboard",
      meta: [{ name: "description", content: "Remote license enforcement dashboard" }],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&display=swap",
        },
      ],
    },
  },
});
