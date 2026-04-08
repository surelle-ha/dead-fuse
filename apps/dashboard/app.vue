<template>
  <div class="min-h-screen bg-fuse-black text-fuse-text font-sans">
    <NuxtPage />
  </div>
</template>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  color-scheme: dark;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #0a0a0a;
  color: #e8e8e8;
  font-family: 'Syne', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: #ff333366;
  color: #fff;
}

::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #0a0a0a;
}

::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #444444;
}
</style>
