<script setup lang="ts">
import { MoonIcon, SunIcon } from '@radix-icons/vue'

const color = useColorMode()

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
  
/*  {
    title: 'Progress',
    href: '/progress',
  }, */
  {
    title: 'About',
    href: '/about',
  },
]

const isOpen = ref(false)
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

function handleSelectLink(item: any) {
  navigateTo({ path: item.href })
  isOpen.value = false
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
        <CommandInput placeholder="Search topics or questions..." />
        <CommandEmpty>
          No results found.
        </CommandEmpty>
        <CommandList
          @escape-key-down="isOpen = false"
        >
          <CommandGroup heading="Navigation">
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
          <!-- You can add more command groups here for topics or specific questions -->
        </CommandList>
      </Command>
    </DialogContent>
  </Dialog>
</template>
