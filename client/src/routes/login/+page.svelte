<script>
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth.js';
  
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  let email = $state('');
  let password = $state('');
  let errorMsg = $state('');
  let isLoading = $state(false);
  let googleReady = $state(false);

  onMount(() => {
    if (!GOOGLE_CLIENT_ID) return;

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      googleReady = true;
    };
    document.head.appendChild(script);
  });

  async function handleGoogleCredential(response) {
    isLoading = true;
    errorMsg = '';
    try {
      await auth.googleLogin(response.credential);
      window.location.href = '/';
    } catch (error) {
      errorMsg = error.response?.data?.error || 'Google login failed. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function triggerGoogleLogin() {
    if (!GOOGLE_CLIENT_ID) {
      errorMsg = 'Google login is not configured yet. Please use email/password.';
      return;
    }
    window.google.accounts.id.prompt();
  }

  async function handleLogin(e) {
    e.preventDefault();
    isLoading = true;
    errorMsg = '';
    
    try {
      await auth.login(email, password);
      window.location.href = '/';
    } catch (error) {
      errorMsg = error.response?.data?.error || 'Login failed. Check your credentials.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>RateMyCourse - Sign In</title>
</svelte:head>

<div class="max-w-xl mx-auto mt-24 mb-32 bg-white pb-8 border-4 border-black neo-shadow-lg">
  <div class="bg-[#b41924] border-b-4 border-black p-6">
    <h2 class="text-4xl font-headline font-black text-white uppercase tracking-tighter">Sign In</h2>
  </div>

  <div class="px-8 pt-8">
    {#if errorMsg}
      <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] px-4 py-3 mb-6 font-bold uppercase tracking-wider text-sm">
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleLogin} class="space-y-6">
      <div>
        <label for="login-email" class="block font-black text-xl mb-2 uppercase tracking-tight">Email</label>
        <input id="login-email" type="email" bind:value={email} required class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" placeholder="student@uni.edu" />
      </div>
      <div>
        <label for="login-password" class="block font-black text-xl mb-2 uppercase tracking-tight">Password</label>
        <input id="login-password" type="password" bind:value={password} required class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" placeholder="••••••••" />
      </div>
      
      <button type="submit" disabled={isLoading} class="w-full bg-[#004be2] text-white border-4 border-black font-headline font-black text-2xl uppercase py-4 neo-shadow active-press mt-4 disabled:opacity-50">
        {isLoading ? 'Logging in...' : 'Login ->'}
      </button>
    </form>

    <div class="mt-10 text-center">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t-4 border-black"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white font-black text-xl uppercase tracking-widest text-[#b41924]">Or</span>
        </div>
      </div>
      
      <button onclick={triggerGoogleLogin} class="mt-8 w-full bg-[#fdd400] text-black border-4 border-black font-headline font-black text-xl uppercase py-4 neo-shadow active-press flex items-center justify-center gap-4">
        <span class="material-symbols-outlined text-3xl leading-none">login</span>
        {GOOGLE_CLIENT_ID ? 'Sign in with Google' : 'Google (Not Configured)'}
      </button>

      <p class="mt-8 font-bold uppercase tracking-wider">
        Don't have an account? 
        <a href="/register" class="text-[#004be2] underline decoration-4 hover:bg-[#004be2] hover:text-white px-1 transition-none">Register</a>
      </p>
    </div>
  </div>
</div>
