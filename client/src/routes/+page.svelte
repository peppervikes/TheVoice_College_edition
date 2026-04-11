<script>
  import axios from 'axios';
  import { onMount } from 'svelte';

  let universities = $state([]);
  let searchQuery = $state('');

  onMount(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/search');
      universities = res.data;
    } catch (error) {
      console.error('Failed to load universities:', error);
    }
  });

  // Example placeholder for hot topics if needed for functionality
  function searchTopic(topic) {
    searchQuery = topic;
  }
</script>

<svelte:head>
  <title>RateMyCourse - Unfilter Your Education</title>
</svelte:head>

<main class="max-w-7xl mx-auto px-6 py-12 lg:py-24">
  <!-- Hero Section -->
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
    <div class="lg:col-span-7">
      <h1 class="text-6xl md:text-8xl font-headline font-black tracking-tighter leading-none mb-8">
        UNFILTER_ YOUR <br/>
        <span class="bg-[#fdd400] px-4 border-4 border-black inline-block transform -rotate-2">EDUCATION.</span>
      </h1>
      <div class="relative max-w-2xl group">
        <input 
          class="w-full bg-white border-[6px] border-black p-6 text-2xl font-bold neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none" 
          placeholder="Search for your University..." 
          bind:value={searchQuery}
          type="text"
        />
        <button class="absolute right-4 top-1/2 -translate-y-1/2 bg-[#004be2] text-white border-4 border-black p-4 neo-shadow active-press">
          <span class="material-symbols-outlined text-4xl leading-none">search</span>
        </button>
      </div>
      <div class="mt-8 flex gap-4 flex-wrap">
        <span class="bg-[#00fd83] border-2 border-black px-4 py-1 font-black text-sm uppercase">Quick Search:</span>
        {#each universities.slice(0, 3) as uni}
          <a href={`/university/${uni._id}`} class="bg-white border-2 border-black px-4 py-1 font-bold text-sm hover:bg-[#b41924] hover:text-white cursor-pointer transition-none">
            {uni.name.split(' (')[0]}
          </a>
        {/each}
      </div>
      
      <!-- Live Search Results appearing below the bar -->
      {#if searchQuery !== ''}
        <div class="mt-8 grid grid-cols-1 gap-4 max-w-2xl">
          <h2 class="text-2xl font-black bg-black text-white px-4 py-2 uppercase tracking-tighter w-max">Search Results</h2>
          {#each universities.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())) as uni}
            <a href={`/university/${uni._id}`} class="block p-6 bg-white border-4 border-black neo-shadow hover:bg-[#deffe0] transition-colors group cursor-pointer text-left">
              <h3 class="text-2xl font-headline font-black text-black mb-1 group-hover:text-[#004be2] transition-colors">{uni.name}</h3>
              <p class="font-bold text-[#b41924] uppercase tracking-widest">{uni.country}</p>
            </a>
          {/each}
          {#if universities.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0}
            <div class="p-6 bg-white border-4 border-black neo-shadow text-center">
              <p class="font-bold text-xl uppercase text-[#b41924]">No universities found matching "{searchQuery}"</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    
    <div class="lg:col-span-5 relative hidden md:block">
      <div class="border-4 border-black neo-shadow-lg rotate-2 overflow-hidden bg-white">
        <img alt="University Campus" class="w-full h-[500px] object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClRtsQvdZZT2EzCH-qA04IaPDrKoPfmSo9XdHAZBe941uKoNUt7WEnAjaf4N980-ahL8g456TgKZxVH-Kq5DdYTvDutP9mChQ3RuiqsF2mQT_NEyNMkXbrQV15lCN3ApqRXxvhV0_rKE5NovoFG7cuOaAFkvOTm1oeXiC3O7fG6kPm9dhroMJf8Gln5aVybmWzBo5yBmiKarm3wbaVKSQU973G4RVey8FpzMmXo9f0dlO20OP0fFbElcyDVuKbmhKejw7_ieuzCVlF"/>
      </div>
      <div class="absolute -bottom-6 -left-6 bg-[#b41924] text-white border-4 border-black p-6 neo-shadow -rotate-3 z-10">
        <p class="font-headline font-black text-2xl">TRUTH &gt; GRADES</p>
      </div>
    </div>
  </section>

  <!-- THE CAMPUS PULSE -->
  <section class="mb-24">
    <div class="flex items-center gap-4 mb-12">
      <h2 class="text-4xl font-headline font-black uppercase tracking-tighter bg-black text-white px-6 py-2">THE CAMPUS PULSE</h2>
      <div class="h-1 flex-grow bg-black"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="bg-white border-4 border-black p-8 neo-shadow flex flex-col items-center text-center">
        <span class="text-6xl font-headline font-black text-[#004be2]">{(Math.random() * 100).toFixed(1)}k+</span>
        <p class="font-black uppercase tracking-widest mt-2">REVIEWS SUBMITTED</p>
      </div>
      <div class="bg-[#fdd400] border-4 border-black p-8 neo-shadow flex flex-col items-center text-center">
        <span class="text-6xl font-headline font-black">{universities.length || 0}+</span>
        <p class="font-black uppercase tracking-widest mt-2">COLLEGES TRACKED</p>
      </div>
      <div class="bg-white border-4 border-black p-8 neo-shadow flex flex-col items-center text-center">
        <span class="text-6xl font-headline font-black text-[#b41924]">100%</span>
        <p class="font-black uppercase tracking-widest mt-2">ANONYMOUS</p>
      </div>
      <div class="bg-[#00fd83] border-4 border-black p-8 neo-shadow flex flex-col items-center text-center">
        <span class="text-6xl font-headline font-black">24/7</span>
        <p class="font-black uppercase tracking-widest mt-2">MODERATED FEED</p>
      </div>
    </div>
  </section>

  <!-- STUDENT VOICES -->
  <section class="mb-24 bg-[#004be2] border-4 border-black p-12 neo-shadow">
    <h2 class="text-4xl font-headline font-black text-white uppercase mb-12 tracking-tighter">STUDENT VOICES</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
      <div class="relative">
        <div class="bg-white border-4 border-black p-6 neo-shadow relative z-10">
          <p class="text-lg font-bold leading-tight">"THE REVIEWER WHO SAID CS-201 WAS EASY IS A LIAR. BUT THE NOTES THEY SHARED SAVED MY GPA."</p>
        </div>
        <div class="absolute -bottom-4 left-8 w-8 h-8 bg-white border-r-4 border-b-4 border-black rotate-45 z-0"></div>
        <div class="mt-8 ml-8 flex items-center gap-4">
          <div class="w-12 h-12 border-4 border-black bg-[#fdd400] flex items-center justify-center font-black">JS</div>
          <div>
            <p class="font-black uppercase text-white leading-none">JORDAN S.</p>
            <p class="text-[#00fd83] text-sm font-bold uppercase">SENIOR @ MIT</p>
          </div>
        </div>
      </div>
      
      <div class="relative">
        <div class="bg-[#fdd400] border-4 border-black p-6 neo-shadow relative z-10">
          <p class="text-lg font-bold leading-tight">"I FINALLY FOUND OUT WHICH PROFESSORS ACTUALLY CARE ABOUT TEACHING VS. JUST THEIR RESEARCH."</p>
        </div>
        <div class="absolute -bottom-4 left-8 w-8 h-8 bg-[#fdd400] border-r-4 border-b-4 border-black rotate-45 z-0"></div>
        <div class="mt-8 ml-8 flex items-center gap-4">
          <div class="w-12 h-12 border-4 border-black bg-white flex items-center justify-center font-black">AM</div>
          <div>
            <p class="font-black uppercase text-white leading-none">ANNA M.</p>
            <p class="text-[#00fd83] text-sm font-bold uppercase">JUNIOR @ NYU</p>
          </div>
        </div>
      </div>
      
      <div class="relative">
        <div class="bg-white border-4 border-black p-6 neo-shadow relative z-10">
          <p class="text-lg font-bold leading-tight">"RATEMYCOURSE IS THE ONLY REASON I DIDN'T TAKE THAT 8AM ORGANIC CHEM LECTURE WITH PROF. V."</p>
        </div>
        <div class="absolute -bottom-4 left-8 w-8 h-8 bg-white border-r-4 border-b-4 border-black rotate-45 z-0"></div>
        <div class="mt-8 ml-8 flex items-center gap-4">
          <div class="w-12 h-12 border-4 border-black bg-[#b41924] text-white flex items-center justify-center font-black">LK</div>
          <div>
            <p class="font-black uppercase text-white leading-none">LEO K.</p>
            <p class="text-[#00fd83] text-sm font-bold uppercase">SOPHOMORE @ UCLA</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>
