<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class=" p-8 rounded-lg shadow-md max-w-2xl">
      <h1 class="font-bold text-4xl mb-6 text-center text-indigo-600">About CSE380 Study Aid</h1>
      <div class="space-y-4">
        <p class="text-lg text-gray-700">
          Welcome! I'm a fellow student who created this site over a weekend to help others like me study for CSE380.
        </p>
        <p class="text-lg text-gray-700">
          <strong class="text-indigo-600">Important Note:</strong> This site does not distribute any course materials. All questions are original and designed to supplement your studies.
        </p>
        <div class="mt-8 bg-indigo-100 p-6 rounded-lg">
          <h2 class="font-semibold text-2xl mb-4 text-indigo-800">Support This Project</h2>
          <p class="text-lg text-indigo-700 mb-4">
            If you've found this site helpful in your studies, consider supporting its continued development and maintenance!
          </p>
          <a 
            href="https://buymeacoffee.com/realgabe" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="inline-flex items-center px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-full hover:bg-yellow-300 transition duration-300"
          >
            <span class="mr-2">☕</span>
            Buy Me a Coffee
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>
