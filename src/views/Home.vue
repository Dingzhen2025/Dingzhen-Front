<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <div>
    <h1>Welcome To Use</h1>
    <h1>“一眼盯珍”搜图桌面平台</h1>
    <button><router-link to="/about">Go to About</router-link></button>
  </div>

  <div class="card">
    <button type="button" @click="count++">点击加一 {{ count }}</button>
  </div>
</template>
