<script>
  import { page } from '$app/stores';
  import axios from 'axios';
  import { onMount } from 'svelte';

  const universityId = $page.params.id;
  let type = $state('course');
  let searchQuery = $state('');
  let results = $state([]);

  $effect(() => {
    // Reactively fetch when type or search query changes
    fetchObjects();
  });

  async function fetchObjects() {
    try {
      const res = await axios.get(`http://localhost:5000/api/search?universityId=${universityId}&type=${type}&q=${searchQuery}`);
      results = res.data;
    } catch (error) {
      console.error('Failed to fetch objects', error);
    }
  }

  onMount(() => {
    fetchObjects();
  });
</script>

<div class="py-6">
  <h2 class="text-3xl font-bold mb-6">Search University</h2>
  
  <div class="flex space-x-4 mb-8">
    <select bind:value={type} class="p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <option value="course">Courses</option>
      <option value="professor">Professors</option>
      <option value="ta">Teaching Assistants</option>
    </select>
    
    <input 
      type="text" 
      bind:value={searchQuery} 
      placeholder={`Search for a ${type}...`} 
      class="flex-grow p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div class="bg-white shadow rounded-lg overflow-hidden">
    <ul class="divide-y divide-gray-200">
      {#each results as item}
        <li class="p-4 hover:bg-gray-50 transition">
          <a href={`/object/${type}/${item._id}`} class="block">
            <h4 class="text-lg font-semibold text-blue-600">{item.name || item.code}</h4>
          </a>
        </li>
      {/each}
      {#if results.length === 0}
        <li class="p-4 text-gray-500">No results found.</li>
      {/if}
    </ul>
  </div>
</div>
