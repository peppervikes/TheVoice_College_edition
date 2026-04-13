<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth.js';

  let { children } = $props();
  let authState = $state({ user: null, isLoggedIn: false });

  // Subscribe to auth store
  auth.subscribe((value) => {
    authState = value;
  });

  onMount(() => {
    auth.loadSession();
  });

  function handleLogout() {
    auth.logout();
    window.location.href = '/';
  }
</script>

<!-- TopNavBar -->
<header class="w-full border-b-4 border-black sticky top-0 z-50 bg-[#deffe0] shadow-[4px_4px_0px_0px_#000000] flex justify-between items-center px-6 py-4">
  <div class="flex items-center gap-8">
    <a href="/" class="text-3xl font-headline font-black text-black uppercase tracking-tighter hover:underline decoration-4">RateMyCourse</a>
    <nav class="hidden md:flex gap-6">
      <a class="font-headline font-black tracking-tighter uppercase text-[#004be2] hover:underline decoration-4" href="/">Home</a>
      {#if authState.isLoggedIn && (authState.user?.role === 'admin' || authState.user?.role === 'moderator')}
        <a class="font-headline font-black tracking-tighter uppercase text-black hover:bg-[#004be2] hover:text-white transition-none px-2" href="/admin">Admin</a>
      {/if}
    </nav>
  </div>
  <div class="flex items-center gap-4">
    {#if authState.isLoggedIn}
      <div class="flex items-center gap-4">
        <div class="hidden md:flex items-center gap-3 bg-white border-4 border-black px-4 py-2 neo-shadow">
          <div class="w-8 h-8 bg-[#fdd400] border-2 border-black flex items-center justify-center font-black text-sm uppercase">
            {authState.user?.pseudonym?.charAt(0) || 'U'}
          </div>
          <span class="font-black uppercase tracking-tight text-sm">{authState.user?.pseudonym || 'User'}</span>
          {#if authState.user?.role === 'admin'}
            <span class="bg-[#b41924] text-white text-xs px-2 py-0.5 font-black uppercase">Admin</span>
          {/if}
        </div>
        <button 
          onclick={handleLogout}
          class="bg-[#b41924] text-white border-4 border-black px-6 py-2 font-headline font-black uppercase neo-shadow active-press cursor-pointer">
          Logout
        </button>
      </div>
    {:else}
      <a href="/login" class="bg-[#004be2] text-white border-4 border-black px-6 py-2 font-headline font-black uppercase neo-shadow active-press block cursor-pointer">Sign In</a>
    {/if}
  </div>
</header>

<div class="min-h-[calc(100vh-200px)]">
  {@render children()}
</div>

<!-- Footer -->
<footer class="bg-[#b41924] border-t-4 border-black mt-auto flex flex-col md:flex-row justify-between items-center p-12 w-full text-white">
  <div class="mb-8 md:mb-0">
    <span class="text-4xl font-black text-white font-headline">RATEMYCOURSE</span>
    <p class="font-bold uppercase tracking-widest mt-2">© 2026 RATEMYCOURSE. NO POLISH. JUST TRUTH.</p>
  </div>
  <div class="flex gap-12">
    <div class="flex flex-col gap-2">
      <a class="font-bold uppercase tracking-widest text-white hover:bg-black hover:text-[#deffe0] px-2 transition-none" href="#">Terms</a>
      <a class="font-bold uppercase tracking-widest text-white hover:bg-black hover:text-[#deffe0] px-2 transition-none" href="#">Privacy</a>
    </div>
    <div class="flex flex-col gap-2">
      <a class="font-bold uppercase tracking-widest text-white hover:bg-black hover:text-[#deffe0] px-2 transition-none" href="#">Contact</a>
      <a class="font-bold uppercase tracking-widest text-white hover:bg-black hover:text-[#deffe0] px-2 transition-none" href="#">Archive</a>
    </div>
  </div>
</footer>
