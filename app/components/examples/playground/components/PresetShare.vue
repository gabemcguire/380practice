<script setup lang="ts">
import { CopyIcon } from '@radix-icons/vue'
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="secondary">
        Share
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-[520px]">
      <div class="flex flex-col text-center space-y-2 sm:text-left">
        <h3 class="text-lg font-semibold">
          Share preset
        </h3>
        <p class="text-sm text-muted-foreground">
          Anyone who has this link and an OpenAI account will be able to view
          this.
        </p>
      </div>
      <div class="flex items-center pt-4 space-x-2">
        <div class="grid flex-1 gap-2">
          <Label for="link" class="sr-only">
            Link
          </Label>
          <Input
            id="link"
            default-value="https://platform.openai.com/playground/p/7bbKYQvsVkNmVb8NGcdUOLae?model=text-davinci-003"
            read-only
            class="h-9"
          />
        </div>
        <Button type="submit" size="sm" class="px-3">
          <span class="sr-only">Copy</span>
          <CopyIcon class="h-4 w-4" />
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
