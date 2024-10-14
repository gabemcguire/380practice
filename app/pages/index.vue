<!-- pages/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <Alert class="mb-4">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        Your progress  on this page will now be saved!
      </AlertDescription>
    </Alert>
    <h1 class="text-3xl font-bold mb-6">Practice</h1>
    <SectionSelector />
  </div>
</template>

<script setup lang="ts">
import SectionSelector from '~/components/SectionSelector.vue'
</script>
