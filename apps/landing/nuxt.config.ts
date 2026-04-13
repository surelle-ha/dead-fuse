export default defineNuxtConfig({
  app: {
    head: {
      title: 'Dead Fuse — Landing',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Dead Fuse landing page for remote app control and project orchestration.' }
      ]
    }
  },
  css: ['~/assets/css/main.css']
})
