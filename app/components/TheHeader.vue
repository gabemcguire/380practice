<script setup lang="ts">
import { ref, computed } from 'vue'
import { MoonIcon, SunIcon } from '@radix-icons/vue'
import { useColorMode } from '@vueuse/core'
import { useMagicKeys } from '@vueuse/core'

// In Nuxt 3, we should use the built-in composables for data imports
const questions = await useAsyncData('questions', () => {
  return Promise.resolve(questionsData) // Replace questionsData with your actual data source
})

interface NavItem {
  title: string
  href: string
}

interface Question {
  id: string
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface Section {
  id: string
  type: string
  title: string
  difficulty: string
  questions: Question[]
}

const color = useColorMode()
const searchQuery = ref('')
const isOpen = ref(false)

function toggleDark() {
  color.preference = color.value === 'dark' ? 'light' : 'dark'
}

const mainNav = [
  {
    title: 'Practice',
    href: '/',
  },
  {
    title: 'Challenges',
    href: '/challenges',
  },
  {
    title: 'About',
    href: '/about',
  },
]

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey))
      e.preventDefault()
  },
})

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1])
    isOpen.value = true
})

const filteredResults = computed(() => {
  if (!searchQuery.value || !questions.data.value?.sections) return []
  
  const query = searchQuery.value.toLowerCase()
  const results: Array<{ type: string; title: string; href: string; subtitle?: string }> = []

  // Search through sections/topics
  questions.data.value.sections.forEach((section: Section) => {
    if (section.title.toLowerCase().includes(query)) {
      results.push({
        type: 'topic',
        title: section.title,
        href: `/topic/${section.id}`,
        subtitle: `${section.difficulty} • ${section.questions.length} questions`
      })
    }

    // Search through questions in each section
    section.questions.forEach((question: Question) => {
      if (question.question.toLowerCase().includes(query)) {
        results.push({
          type: 'question',
          title: question.question,
          href: `/topic/${section.id}#${question.id}`,
          subtitle: `${section.title} • ${section.difficulty}`
        })
      }
    })
  })

  return results
})

function handleSelectLink(item: any) {
  navigateTo(item.href)
  isOpen.value = false
  searchQuery.value = ''
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
    <div class="h-14 max-w-screen-2xl flex items-center container">
      <div class="mr-4 flex items-center">
        <NuxtLink to="/">
          <h1 class="text-lg font-bold mr-6">380 Practice</h1>
        </NuxtLink>
        <nav class="flex items-center text-sm font-medium space-x-6">
          <NuxtLink
            v-for="route in mainNav"
            :key="route.title"
            :to="route.href"
            class="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            {{ route.title }}
          </NuxtLink>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-end space-x-2">
        <div class="w-full flex-1 hidden md:w-auto md:flex-none">
          <Button
            variant="outline"
            class="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm text-muted-foreground font-normal shadow-none lg:w-64 md:w-40 sm:pr-12"
            @click="isOpen = true"
          >
            <span class="hidden lg:inline-flex">Search topics...</span>
            <span class="inline-flex lg:hidden">Search...</span>
            <Kbd class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 border rounded bg-muted px-1.5 text-[10px] font-medium font-mono opacity-100 sm:flex">
              <span class="text-xs">⌘</span>K
            </Kbd>
          </Button>
        </div>
        <ClientOnly>
          <Button
            class="h-9 w-9"
            aria-label="Toggle dark mode"
            variant="ghost"
            size="icon"
            @click="toggleDark()"
          >
            <component
              :is="color.preference !== 'dark' ? MoonIcon : SunIcon"
              class="h-5 w-5 text-foreground"
            />
          </Button>
        </ClientOnly>
      </div>
    </div>
  </header>

  <Dialog v-model:open="isOpen">
    <DialogContent class="p-0">
      <Command>
        <CommandInput 
          placeholder="Search topics or questions..." 
          v-model="searchQuery"
        />
        <CommandEmpty>
          No results found.
        </CommandEmpty>
        <CommandList @escape-key-down="isOpen = false">
          <!-- Navigation Group -->
          <CommandGroup v-if="!searchQuery" heading="Navigation">
            <CommandItem
              v-for="item in mainNav"
              :key="item.title"
              :value="item.title"
              class="py-3"
              @select="handleSelectLink(item)"
            >
              <Icon name="radix-icons:file" class="mr-2 h-5 w-5" />
              <span>{{ item.title }}</span>
            </CommandItem>
          </CommandGroup>

          <!-- Search Results -->
          <template v-if="searchQuery && filteredResults.length">
            <!-- Topics Group -->
            <CommandGroup heading="Topics">
              <CommandItem
                v-for="result in filteredResults.filter(r => r.type === 'topic')"
                :key="result.title"
                :value="result.title"
                class="py-3"
                @select="handleSelectLink(result)"
              >
                <Icon name="radix-icons:component-2" class="mr-2 h-5 w-5" />
                <div class="flex flex-col">
                  <span>{{ result.title }}</span>
                  <span class="text-sm text-muted-foreground">{{ result.subtitle }}</span>
                </div>
              </CommandItem>
            </CommandGroup>

            <!-- Questions Group -->
            <CommandGroup heading="Questions">
              <CommandItem
                v-for="result in filteredResults.filter(r => r.type === 'question')"
                :key="result.title"
                :value="result.title"
                class="py-3"
                @select="handleSelectLink(result)"
              >
                <Icon name="radix-icons:question-mark" class="mr-2 h-5 w-5" />
                <div class="flex flex-col">
                  <span>{{ result.title }}</span>
                  <span class="text-sm text-muted-foreground">{{ result.subtitle }}</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
