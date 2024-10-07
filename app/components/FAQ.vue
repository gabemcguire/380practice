<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const defaultValue = 'item-1'

const accordionItems = [
  { value: 'item-1', title: 'How were the questions made?', content: 'Due to the large amount of content, generative AI played a pivotal role in creating the questions.' },
  { value: 'item-2', title: 'Is there any course content on this site?', content: 'No.' },
  { value: 'item-3', title: 'Are more questions going to be added?', content: 'Most likely.' },
]
</script>

<template>
  <div class='my-2'>
    <h2 class="text-2xl font-bold text-center">FAQ</h2>
    <Accordion type="single" class="w-full" collapsible :default-value="defaultValue">
      <AccordionItem v-for="item in accordionItems" :key="item.value" :value="item.value">
        <AccordionTrigger>{{ item.title }}</AccordionTrigger>
        <AccordionContent>
          {{ item.content }}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
</template>
