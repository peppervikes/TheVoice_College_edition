<script>
  import api from '$lib/api.js';
  import { onMount } from 'svelte';
  
  let stats = $state({ totalReviews: 0, totalUniversities: 0, totalUsers: 0 });
  let pendingFlags = $state(0);
  let loading = $state(true);

  onMount(async () => {
    try {
      const [statsRes, flagsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/flags?status=pending')
      ]);
      stats = statsRes.data;
      pendingFlags = flagsRes.data.length;
    } catch (error) {
      console.error('Failed to load admin dashboard stats:', error);
    } finally {
      loading = false;
    }
  });
</script>

<div class="bg-white border-4 border-black p-8 neo-shadow mb-8">
  <h1 class="text-4xl font-headline font-black uppercase tracking-tighter mb-4">Command Center</h1>
  <p class="font-bold text-lg">System Overview & Quick Actions</p>
</div>

{#if loading}
  <div class="font-black p-8 bg-white border-4 border-black neo-shadow uppercase">Loading statistics...</div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
    <!-- Metrics -->
    <div class="bg-[#004be2] text-white border-4 border-black p-8 neo-shadow flex flex-col items-center">
      <span class="text-7xl font-headline font-black">{stats.totalUsers || 0}</span>
      <span class="font-black uppercase tracking-widest mt-2">Registered Users</span>
    </div>
    
    <div class="bg-[#fdd400] text-black border-4 border-black p-8 neo-shadow flex flex-col items-center">
      <span class="text-7xl font-headline font-black">{stats.totalReviews || 0}</span>
      <span class="font-black uppercase tracking-widest mt-2">Total Reviews</span>
    </div>
    
    <div class="bg-white text-black border-4 border-black p-8 neo-shadow flex flex-col items-center">
      <span class="text-7xl font-headline font-black">{stats.totalUniversities || 0}</span>
      <span class="font-black uppercase tracking-widest mt-2">Listed Colleges</span>
    </div>

    <!-- Alert / Action Needed -->
    <div class="bg-[#b41924] text-white border-4 border-black p-8 neo-shadow flex flex-col items-center justify-center relative overflow-hidden">
      <span class="text-7xl font-headline font-black relative z-10">{pendingFlags}</span>
      <span class="font-black uppercase tracking-widest mt-2 relative z-10">Pending Flags</span>
      
      {#if pendingFlags > 0}
        <a href="/admin/flags" class="mt-6 bg-black text-white px-6 py-2 font-black uppercase tracking-widest hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-colors relative z-10">
          Review Now
        </a>
      {/if}
    </div>
  </div>
{/if}
