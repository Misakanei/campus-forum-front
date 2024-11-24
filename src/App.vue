<template>
  <div class="app">
    <nav-header></nav-header>
    <div class="main-container">
      <router-view></router-view>
    </div>
    <nav-footer></nav-footer>
  </div>
</template>

<script setup>
import NavHeader from './components/NavHeader.vue'
import NavFooter from './components/NavFooter.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
