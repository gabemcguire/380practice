<!-- pages/challenges.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import challengesData from '~/data/challenges.json'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon } from '@radix-icons/vue'

const router = useRouter()
const featuredChallenges = ref([])
const allChallenges = ref([])
featuredChallenges.value = challengesData.featured;
allChallenges.value = challengesData.all;

const goToChallenge = (id: string) => {
  router.push(`/challenge/${id}`)
}

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500'
}
const formatDifficulty = (difficulty: string) => {
  const colors = {
    Easy: 'text-green-600',
    Medium: 'text-yellow-600',
    Hard: 'text-red-600'
  }
  return `<span class="${colors[difficulty]}">${difficulty}</span>`
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Challenges</h1>
    
    <h2 class="text-2xl font-semibold mb-4">Featured Challenges</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card v-for="challenge in featuredChallenges" @click="goToChallenge(challenge.id)" :key="challenge.id" class="flex cursor-pointer hover:scale-105 transition-all duration-200 flex-col">
        <CardHeader>
          <CardTitle>{{ challenge.title }}</CardTitle>
          <CardDescription>
            <Badge :class="[difficultyColors[challenge.difficulty], 'text-white']" class="p-1">{{ challenge.difficulty }}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
    
    <h2 class="text-2xl font-semibold mb-4">All Challenges</h2>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Description</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="challenge in allChallenges" :key="challenge.id" class="cursor-pointer" @click="goToChallenge(challenge.id)">
            <TableCell class="font-bold">{{ challenge.title }}</TableCell>
            <TableCell v-html="formatDifficulty(challenge.difficulty)"></TableCell>
            <TableCell>{{ challenge.description }}</TableCell>
            <TableCell>
              <Button variant="ghost" @click="goToChallenge(challenge.id)">
                <!-- Start Challenge -->
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
