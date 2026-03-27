<script>
  import axios from 'axios';
  
  let email = $state('');
  let password = $state('');
  let errorMsg = $state('');

  async function handleLogin() {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      alert('Login successful');
      window.location.href = '/';
    } catch (error) {
      errorMsg = error.response?.data?.error || 'Login failed';
    }
  }

  function handleGoogleLogin() {
    // Stub
    alert('Google login not implemented in MVP UI');
  }
</script>

<div class="max-w-md mx-auto mt-16 bg-white p-8 border rounded shadow-sm">
  <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

  {#if errorMsg}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {errorMsg}
    </div>
  {/if}

  <form on:submit|preventDefault={handleLogin} class="space-y-4">
    <div>
      <label class="block text-gray-700">Email</label>
      <input type="email" bind:value={email} required class="w-full p-2 border rounded mt-1 focus:ring focus:border-blue-300" />
    </div>
    <div>
      <label class="block text-gray-700">Password</label>
      <input type="password" bind:value={password} required class="w-full p-2 border rounded mt-1 focus:ring focus:border-blue-300" />
    </div>
    
    <button type="submit" class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
      Login
    </button>
  </form>

  <div class="mt-6 text-center">
    <p class="text-gray-600">Or</p>
    <button on:click={handleGoogleLogin} class="mt-4 w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-50 transition flex items-center justify-center">
      Login with Google
    </button>
  </div>
</div>
