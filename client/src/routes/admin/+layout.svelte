<script>
  import { auth } from '$lib/stores/auth.js';
  import { onMount } from 'svelte';
  
  let { children } = $props();
  let loading = $state(true);

  onMount(() => {
    // Wait slightly to let auth load from local storage
    setTimeout(() => {
      if (!$auth.isLoggedIn || !['admin', 'moderator'].includes($auth.user?.role)) {
        window.location.href = '/';
      } else {
        loading = false;
      }
    }, 100);
  });
</script>

{#if loading}
  <div class="p-12 text-center font-black">AUTHORIZING...</div>
{:else}
  <div class="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
    <!-- Admin Sidebar -->
    <aside class="md:w-1/4">
      <div class="bg-black text-white p-6 neo-shadow mb-8">
        <h2 class="text-2xl font-headline font-black uppercase tracking-tighter">Admin Panel</h2>
        <p class="text-[#00fd83] text-sm font-bold tracking-widest mt-1">Logged in as {$auth.user?.role}</p>
      </div>
      <nav class="flex flex-col gap-4">
        <a href="/admin" class="border-4 border-black p-4 font-black uppercase hover:bg-[#deffe0] bg-white neo-shadow active-press transition-colors {typeof window !== 'undefined' && window.location.pathname === '/admin' ? 'bg-[#fdd400]' : ''}">
          Dashboard
        </a>
        <a href="/admin/objects" class="border-4 border-black p-4 font-black uppercase hover:bg-[#deffe0] bg-white neo-shadow active-press transition-colors {typeof window !== 'undefined' && window.location.pathname.includes('/objects') ? 'bg-[#fdd400]' : ''}">
          Manage Objects
        </a>
        <a href="/admin/flags" class="border-4 border-black p-4 font-black uppercase hover:bg-[#deffe0] bg-white neo-shadow active-press transition-colors {typeof window !== 'undefined' && window.location.pathname.includes('/flags') ? 'bg-[#fdd400]' : ''}">
          Review Flags
        </a>
      </nav>
    </aside>

    <!-- Admin Content -->
    <main class="md:w-3/4">
      {@render children()}
    </main>
  </div>
{/if}
