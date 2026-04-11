<script>
  import { page } from '$app/stores';
  import axios from 'axios';
  import { onMount } from 'svelte';

  const universityId = $page.params.id;
  let type = $state('course');
  let searchQuery = $state('');
  let results = $state([]);
  let universityName = $state('Loading...');

  $effect(() => {
    // Reactively fetch when type or search query changes
    fetchObjects();
  });

  async function fetchObjects() {
    try {
      if (universityName === 'Loading...') {
        // Quick hack to fetch university name
        const uniRes = await axios.get('http://localhost:5000/api/search');
        const uni = uniRes.data.find(u => u._id === universityId);
        if(uni) universityName = uni.name;
      }

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

<svelte:head>
  <title>RateMyCourse - {universityName}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <div class="mb-12 border-b-4 border-black pb-6 flex flex-col md:flex-row md:items-end justify-between items-start gap-4">
    <div>
      <h2 class="text-3xl md:text-5xl font-headline font-black uppercase tracking-tight text-white bg-black inline-block px-4 py-2 mb-2">EXPLORE CAMPUS</h2>
      <h3 class="text-2xl md:text-3xl font-black uppercase text-[#b41924]">{universityName}</h3>
    </div>
  </div>
  
  <div class="flex flex-col md:flex-row gap-6 mb-12">
    <div class="relative w-full md:w-1/3">
      <select bind:value={type} class="appearance-none w-full bg-[#fdd400] border-[6px] border-black p-4 text-xl font-black uppercase tracking-tighter neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none cursor-pointer">
        <option value="course">Courses</option>
        <option value="professor">Professors</option>
        <option value="ta">Teaching Assistants</option>
      </select>
      <span class="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-4xl">arrow_drop_down</span>
    </div>
    
    <div class="relative w-full md:w-2/3 group flex">
      <input 
        type="text" 
        bind:value={searchQuery} 
        placeholder={`FIND A ${type.toUpperCase()}`} 
        class="w-full bg-white border-[6px] border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none uppercase"
      />
      <div class="absolute right-4 top-1/2 -translate-y-1/2 bg-[#00fd83] border-4 border-black p-2 neo-shadow pointer-events-none">
        <span class="material-symbols-outlined text-3xl leading-none">search</span>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    {#each results as item}
      <div class="bg-white border-4 border-black neo-shadow flex flex-col overflow-hidden group hover:bg-[#deffe0] transition-colors">
        <div class="p-8 pb-4">
          <div class="flex justify-between items-start mb-4 gap-4">
            <h3 class="text-3xl font-headline font-black leading-none uppercase">{item.name || item.code}</h3>
            <span class="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-tighter whitespace-nowrap">
              {type === 'course' ? item.code : type.toUpperCase()}
            </span>
          </div>
          {#if type === 'professor' && item.courses?.length > 0}
            <p class="font-bold text-sm uppercase mb-4 text-[#b41924]">Teaches: {item.courses.map(c => c.code).join(', ')}</p>
          {/if}
          {#if type === 'course'}
            <p class="font-bold text-sm uppercase mb-4 text-[#b41924]">{item.name}</p>
          {/if}
        </div>
        <div class="mt-auto p-4 bg-gray-100 border-t-4 border-black flex justify-end">
          <a href={`/object/${type}/${item._id}`} class="font-black underline decoration-4 text-lg hover:text-[#004be2] uppercase">
            VIEW REVIEWS -&gt;
          </a>
        </div>
      </div>
    {/each}
  </div>

  {#if results.length === 0}
    <div class="mt-12 bg-white border-4 border-black p-12 text-center neo-shadow">
      <span class="material-symbols-outlined text-6xl text-[#b41924] mb-4">sentiment_dissatisfied</span>
      <h3 class="text-3xl font-headline font-black uppercase tracking-tighter">NO MATCHES FOUND</h3>
      <p class="font-bold mt-2 uppercase">Try adjusting your search terms.</p>
    </div>
  {/if}
</div>
