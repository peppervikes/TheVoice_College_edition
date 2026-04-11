<script>
  import '../app.css';
  let { children } = $props();
</script>

<!-- TopNavBar -->
<header class="w-full border-b-4 border-black sticky top-0 z-50 bg-[#deffe0] shadow-[4px_4px_0px_0px_#000000] flex justify-between items-center px-6 py-4">
  <div class="flex items-center gap-8">
    <a href="/" class="text-3xl font-headline font-black text-black uppercase tracking-tighter hover:underline decoration-4">RateMyCourse</a>
    <nav class="hidden md:flex gap-6">
      <a class="font-headline font-black tracking-tighter uppercase text-[#004be2] hover:underline decoration-4" href="/">Home</a>
      <a class="font-headline font-black tracking-tighter uppercase text-black hover:bg-[#004be2] hover:text-white transition-none px-2" href="/university/65f12ab345cd67890ef12345">Universities</a>
    </nav>
  </div>
  <div class="flex items-center gap-4">
    <a href="/login" class="bg-[#004be2] text-white border-4 border-black px-6 py-2 font-headline font-black uppercase neo-shadow active-press block cursor-pointer">Sign In</a>
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
