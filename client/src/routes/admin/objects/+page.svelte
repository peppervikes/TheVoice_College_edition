<script>
  import api from '$lib/api.js';
  import { onMount } from 'svelte';
  
  let objectType = $state('university');
  
  // Form fields
  let name = $state('');
  let country = $state('');
  let domain = $state('');
  let code = $state('');
  let isOnline = $state(false);
  
  // Selection
  let universities = $state([]);
  let selectedUniversityId = $state('');

  let isLoading = $state(false);
  let errorMsg = $state('');
  let successMsg = $state('');

  onMount(async () => {
    try {
      const res = await api.get('/universities');
      universities = res.data;
    } catch (error) {
      console.error('Failed to load universities', error);
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    isLoading = true;
    errorMsg = '';
    successMsg = '';

    let data = {};
    if (objectType === 'university') {
      data = { name, country, domain };
    } else if (objectType === 'course') {
      if (!selectedUniversityId) { errorMsg = 'University required'; isLoading = false; return; }
      data = { universityId: selectedUniversityId, name, code, isOnline, createdBy: 'admin' };
    } else if (objectType === 'professor' || objectType === 'ta') {
      if (!selectedUniversityId) { errorMsg = 'University required'; isLoading = false; return; }
      data = { universityId: selectedUniversityId, name };
    }

    try {
      await api.post('/admin/object', { type: objectType, data });
      successMsg = `Successfully created ${objectType}!`;
      // Reset common fields
      name = ''; code = ''; domain = ''; country = '';
      
      if (objectType === 'university') {
        const res = await api.get('/universities');
        universities = res.data;
      }
    } catch (error) {
      errorMsg = error.response?.data?.error || `Failed to create ${objectType}.`;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="bg-white border-4 border-black p-8 neo-shadow mb-8">
  <h1 class="text-4xl font-headline font-black uppercase tracking-tighter mb-2">Manage Objects</h1>
  <p class="font-bold text-lg text-gray-700">Add new entities to the platform database.</p>
</div>

<div class="bg-white border-4 border-black p-8 neo-shadow max-w-2xl">
  <h2 class="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-4">Create New Object</h2>

  {#if errorMsg}
    <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] p-4 mb-6 font-bold uppercase tracking-wider text-sm">
      {errorMsg}
    </div>
  {/if}

  {#if successMsg}
    <div class="bg-[#deffe0] border-4 border-[#008944] text-[#006a33] p-4 mb-6 font-bold uppercase tracking-wider text-sm relative">
      {successMsg}
      <button class="absolute top-2 right-4 font-black text-xl" onclick={() => successMsg=''}>&times;</button>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-6">
    
    <div>
      <label class="block font-black text-xl mb-2 uppercase tracking-tight">Entity Type</label>
      <select bind:value={objectType} class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none">
        <option value="university">University</option>
        <option value="course">Course</option>
        <option value="professor">Professor</option>
        <option value="ta">Teaching Assistant</option>
      </select>
    </div>

    <!-- Common Fields depending on type -->
    
    {#if objectType !== 'university'}
      <div>
        <label class="block font-black text-xl mb-2 uppercase tracking-tight">Select University</label>
        <select bind:value={selectedUniversityId} class="w-full bg-[#fdd400] border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" required>
          <option value="" disabled>-- Select a University --</option>
          {#each universities as uni}
            <option value={uni._id}>{uni.name}</option>
          {/each}
        </select>
      </div>
    {/if}

    <div>
      <label class="block font-black text-xl mb-2 uppercase tracking-tight">Name / Title</label>
      <input type="text" bind:value={name} required placeholder={`Enter ${objectType} name...`} class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" />
    </div>

    {#if objectType === 'university'}
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block font-black text-xl mb-2 uppercase tracking-tight">Country</label>
          <input type="text" bind:value={country} required placeholder="USA, UK, etc." class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" />
        </div>
        <div>
          <label class="block font-black text-xl mb-2 uppercase tracking-tight">Domain (Optional)</label>
          <input type="text" bind:value={domain} placeholder="mit.edu" class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" />
        </div>
      </div>
    {/if}

    {#if objectType === 'course'}
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block font-black text-xl mb-2 uppercase tracking-tight">Course Code</label>
          <input type="text" bind:value={code} required placeholder="CS101" class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" />
        </div>
        <div class="flex items-center pt-8">
          <label class="flex items-center gap-4 cursor-pointer font-black text-xl uppercase tracking-tight">
            <input type="checkbox" bind:checked={isOnline} class="w-8 h-8 accent-[#004be2] border-4 border-black" />
            Is Online Course?
          </label>
        </div>
      </div>
    {/if}

    <button type="submit" disabled={isLoading} class="w-full bg-[#00fd83] text-black border-4 border-black font-headline font-black text-2xl uppercase py-4 neo-shadow active-press disabled:opacity-50 mt-8">
      {isLoading ? 'Creating...' : `Create ${objectType}`}
    </button>
  </form>
</div>
