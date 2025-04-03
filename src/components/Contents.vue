<script setup lang="ts">

import Markdown from "../views/Markdown.vue";
</script>

<template>
  <div>
    <markdown></markdown>
    <div v-html="html"></div>
    <router-view></router-view>
  </div>
</template>

<style scoped>

</style>