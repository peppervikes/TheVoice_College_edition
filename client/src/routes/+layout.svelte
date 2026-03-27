<script>
  import '../app.css'; // Restart dev server if SvelteKit keeps complaining it's missing
  let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50 flex flex-col font-sans">
  <header class="bg-blue-600 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold"><a href="/">UniReviewPlatform</a></h1>
      <nav>
        <a href="/login" class="hover:underline font-semibold">Login / Profile</a>
      </nav>
    </div>
  </header>

  <main class="flex-grow container mx-auto p-4 mt-8 bg-white rounded shadow-sm">
    {@render children()}
  </main>

  <footer class="bg-gray-800 text-white text-center p-4 mt-8">
    <p>&copy; 2026 University Review Platform</p>
  </footer>
</div>
