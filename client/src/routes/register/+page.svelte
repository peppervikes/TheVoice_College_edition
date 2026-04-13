<script>
  import { auth } from '$lib/stores/auth.js';

  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let pseudonym = $state('');
  let errorMsg = $state('');
  let isLoading = $state(false);

  async function handleRegister(e) {
    e.preventDefault();
    errorMsg = '';

    if (password !== confirmPassword) {
      errorMsg = 'Passwords do not match.';
      return;
    }

    if (password.length < 6) {
      errorMsg = 'Password must be at least 6 characters.';
      return;
    }

    if (pseudonym.length < 2) {
      errorMsg = 'Pseudonym must be at least 2 characters.';
      return;
    }

    isLoading = true;

    try {
      await auth.register(email, password, pseudonym);
      window.location.href = '/';
    } catch (error) {
      errorMsg = error.response?.data?.error || 'Registration failed. Try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>RateMyCourse - Create Account</title>
</svelte:head>

<div class="max-w-xl mx-auto mt-16 mb-32 bg-white pb-8 border-4 border-black neo-shadow-lg">
  <div class="bg-[#004be2] border-b-4 border-black p-6">
    <h2 class="text-4xl font-headline font-black text-white uppercase tracking-tighter">Create Account</h2>
    <p class="text-[#00fd83] font-bold uppercase tracking-widest mt-1 text-sm">Join the conversation.</p>
  </div>

  <div class="px-8 pt-8">
    {#if errorMsg}
      <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] px-4 py-3 mb-6 font-bold uppercase tracking-wider text-sm">
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={handleRegister} class="space-y-6">
      <div>
        <label for="reg-pseudonym" class="block font-black text-xl mb-2 uppercase tracking-tight">
          Pseudonym
          <span class="text-sm text-[#b41924] font-bold normal-case ml-2">(your public display name)</span>
        </label>
        <input id="reg-pseudonym" type="text" bind:value={pseudonym} required minlength="2" maxlength="30"
          class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" 
          placeholder="CampusNerd99" />
      </div>

      <div>
        <label for="reg-email" class="block font-black text-xl mb-2 uppercase tracking-tight">Email</label>
        <input id="reg-email" type="email" bind:value={email} required
          class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" 
          placeholder="student@uni.edu" />
      </div>

      <div>
        <label for="reg-password" class="block font-black text-xl mb-2 uppercase tracking-tight">Password</label>
        <input id="reg-password" type="password" bind:value={password} required minlength="6"
          class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" 
          placeholder="Min 6 characters" />
      </div>

      <div>
        <label for="reg-confirm" class="block font-black text-xl mb-2 uppercase tracking-tight">Confirm Password</label>
        <input id="reg-confirm" type="password" bind:value={confirmPassword} required
          class="w-full bg-white border-4 border-black p-4 text-xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" 
          placeholder="••••••••" />
      </div>
      
      <button type="submit" disabled={isLoading} class="w-full bg-[#00fd83] text-black border-4 border-black font-headline font-black text-2xl uppercase py-4 neo-shadow active-press mt-4 disabled:opacity-50">
        {isLoading ? 'Creating...' : 'Create Account ->'}
      </button>
    </form>

    <p class="mt-8 text-center font-bold uppercase tracking-wider">
      Already have an account? 
      <a href="/login" class="text-[#004be2] underline decoration-4 hover:bg-[#004be2] hover:text-white px-1 transition-none">Sign In</a>
    </p>
  </div>
</div>
