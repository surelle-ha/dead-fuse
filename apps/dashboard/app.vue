<template>
  <NuxtLayout />
</template>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root { color-scheme: dark; }
html { scroll-behavior: smooth; }
body {
  background-color: #0a0a0a;
  color: #f0f0f0;
  font-family: 'Syne', sans-serif;
  -webkit-font-smoothing: antialiased;
}
::selection { background: #ff333344; color: #fff; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #444444; }
</style>