<script>
  import { page } from '$app/stores';
  import axios from 'axios';

  const type = $page.url.searchParams.get('type');
  const id = $page.url.searchParams.get('id');
  const universityId = $page.url.searchParams.get('uni');

  let difficulty = $state(3);
  let textReview = $state('');
  let anonymous = $state(true);
  let isSubmitting = $state(false);
  let errorMsg = $state('');

  async function submitReview() {
    isSubmitting = true;
    errorMsg = '';
    
    try {
      await axios.post('http://localhost:5000/api/reviews', {
        objectType: type,
        objectId: id,
        universityId,
        anonymous,
        ratings: { difficulty },
        textReview
      });
      window.location.href = `/object/${type}/${id}`;
    } catch (error) {
      errorMsg = error.response?.data?.error || 'Failed to submit review';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>RateMyCourse - Drop Knowledge</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12 md:py-24">
  <div class="bg-white p-8 md:p-12 border-4 border-black neo-shadow-lg mb-16 relative">
    <!-- Decorative tag -->
    <div class="absolute -top-6 -right-6 bg-[#00fd83] border-4 border-black p-4 neo-shadow rotate-12 z-10 hidden md:block">
      <span class="font-headline font-black text-2xl uppercase">UNFILTERED.</span>
    </div>

    <div class="mb-12 border-b-6 border-black pb-8">
      <h2 class="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter leading-none text-[#004be2]">
        DROP <br/> <span class="text-black inline-block bg-[#fdd400] px-4 transform -rotate-1 border-4 border-black mt-2">KNOWLEDGE.</span>
      </h2>
      <p class="font-bold uppercase tracking-widest mt-6 text-xl">Reviewing {type.toUpperCase()} ID: {id.slice(-6)}</p>
    </div>
    
    {#if errorMsg}
      <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] p-6 text-xl font-bold uppercase neo-shadow mb-8">
        {errorMsg}
      </div>
    {/if}

    <form onsubmit={submitReview} class="space-y-12">
      
      <div class="bg-[#deffe0] p-8 border-4 border-black neo-shadow">
        <label class="block text-3xl font-headline font-black uppercase mb-6 tracking-tighter">Overall Difficulty (1-5)</label>
        
        <div class="flex items-center gap-6">
          <input type="range" min="1" max="5" bind:value={difficulty} class="w-full h-4 bg-black appearance-none cursor-pointer outline-none border-2 border-black" />
          <div class="w-20 h-20 bg-white border-4 border-black flex items-center justify-center font-headline font-black text-4xl neo-shadow flex-shrink-0">
            {difficulty}
          </div>
        </div>
      </div>
      
      <div>
        <label class="block text-3xl font-headline font-black uppercase mb-6 tracking-tighter">The Raw Truth</label>
        <div class="relative group">
          <textarea 
             bind:value={textReview} 
             rows="6" 
             required 
             minlength="10" 
             maxlength="350" 
             class="w-full p-6 text-xl font-bold bg-white border-[6px] border-black neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none resize-none" 
             placeholder="Spill the tea. Was the midterm impossible? Is the TA a lifesaver? Be brutally honest.">
          </textarea>
          <div class="absolute bottom-4 right-6 pointer-events-none">
            <span class="bg-black text-white px-3 py-1 font-black text-sm uppercase">
              {textReview.length} / 350
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-[#ffc3bf] p-6 border-4 border-black neo-shadow">
        <div class="relative flex items-center">
          <input type="checkbox" id="anon" bind:checked={anonymous} class="appearance-none w-10 h-10 border-4 border-black bg-white checked:bg-black outline-none cursor-pointer neo-shadow focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all" />
          {#if anonymous}
            <span class="absolute pointer-events-none text-white material-symbols-outlined left-[4px] font-black">check</span>
          {/if}
        </div>
        <label for="anon" class="text-2xl font-black uppercase cursor-pointer tracking-tighter">Stay Under The Radar (Anonymous)</label>
      </div>

      <button type="submit" disabled={isSubmitting} class="w-full bg-[#004be2] disabled:bg-gray-400 hover:bg-black text-white border-8 border-black font-headline font-black text-4xl uppercase py-8 neo-shadow active-press transition-colors">
        {isSubmitting ? 'UPLOADING...' : 'SUBMIT REVIEW ->'}
      </button>
    </form>
  </div>
</div>
