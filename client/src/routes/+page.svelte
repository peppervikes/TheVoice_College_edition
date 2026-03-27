<script>
  import axios from 'axios';
  import { onMount } from 'svelte';

  let universities = $state([]);
  let searchQuery = $state('');

  onMount(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/search');
      universities = res.data;
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  });
</script>

<svelte:head>
  <title>University Review Platform</title>
</svelte:head>

<div class="text-center py-12">
  <h2 class="text-4xl font-extrabold mb-4">Find your University</h2>
  <p class="text-lg text-gray-600 mb-8">Search for courses, professors, and TAs to read and write reviews.</p>

  <div class="max-w-xl mx-auto mb-8">
    <input 
      type="text" 
      bind:value={searchQuery}
      placeholder="Search for a university..." 
      class="w-full p-4 rounded border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each universities.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())) as uni}
      <a href={`/university/${uni._id}`} class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-100 text-left">
        <h3 class="text-xl font-bold text-blue-600 mb-2">{uni.name}</h3>
        <p class="text-gray-500">{uni.country}</p>
      </a>
    {/each}
    {#if universities.length === 0}
      <p class="text-gray-500 col-span-3">Loading universities or no universities found.</p>
    {/if}
  </div>
</div>
