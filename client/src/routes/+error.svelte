<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error {$page.status} - RateMyCourse</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-24 text-center">
  <div class="bg-[#b41924] text-white border-4 border-black p-12 neo-shadow">
    <h1 class="text-9xl md:text-[150px] font-headline font-black leading-none mb-4">
      {$page.status}
    </h1>
    <h2 class="text-4xl md:text-5xl font-headline font-black uppercase mb-8">
      {$page.error?.message || "Lost your way?"}
    </h2>
    <p class="text-xl font-bold uppercase tracking-widest mb-12 bg-black px-4 py-2 inline-block">
      The content doesn't exist or has been removed.
    </p>
    <br />
    <a href="/" class="bg-[#fdd400] text-black border-4 border-black font-headline font-black text-2xl uppercase py-4 px-8 neo-shadow active-press inline-block hover:bg-white transition-colors">
      RETURN TO HOME
    </a>
  </div>
</div>
