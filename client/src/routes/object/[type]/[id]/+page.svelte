<script>
  import { page } from '$app/stores';
  import api from '$lib/api.js';
  import { auth } from '$lib/stores/auth.js';
  import { onMount } from 'svelte';

  const type = $page.params.type;
  const id = $page.params.id;

  let details = $state(null);
  let loading = $state(true);
  let errorMsg = $state('');
  let authState = $state({ user: null, isLoggedIn: false });

  // Flag modal state
  let showFlagModal = $state(false);
  let flagReviewId = $state('');
  let flagReason = $state('');
  let flagSubmitting = $state(false);

  auth.subscribe((value) => {
    authState = value;
  });

  onMount(async () => {
    try {
      const res = await api.get(`/object/${type}/${id}`);
      details = res.data;
    } catch (error) {
      errorMsg = 'Failed to load object details';
    } finally {
      loading = false;
    }
  });

  async function handleVote(reviewId, voteType) {
    if (!authState.isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await api.post(`/reviews/${reviewId}/vote`, { voteType });
      // Update the review in our local state
      const updatedReview = res.data.review;
      details.reviews = details.reviews.map(r =>
        r._id === reviewId ? { ...r, likes: updatedReview.likes, dislikes: updatedReview.dislikes } : r
      );
    } catch (error) {
      console.error('Vote failed:', error);
    }
  }

  function openFlagModal(reviewId) {
    if (!authState.isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    flagReviewId = reviewId;
    flagReason = '';
    showFlagModal = true;
  }

  async function submitFlag(e) {
    e.preventDefault();
    flagSubmitting = true;
    try {
      await api.post('/flags', { reviewId: flagReviewId, reason: flagReason });
      showFlagModal = false;
      flagReason = '';
    } catch (error) {
      console.error('Flag failed:', error);
    } finally {
      flagSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>RateMyCourse - {details?.object?.name || details?.object?.code || 'Loading...'}</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  {#if loading}
    <div class="flex justify-center p-24">
      <div class="text-4xl font-black uppercase flex gap-4">
        <span class="material-symbols-outlined text-4xl animate-spin">autorenew</span>
        LOADING...
      </div>
    </div>
  {:else if errorMsg}
    <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] p-6 text-xl font-bold uppercase neo-shadow mb-8">
      {errorMsg}
    </div>
  {:else if details}
    <div class="bg-white p-8 md:p-12 border-4 border-black neo-shadow-lg mb-16">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b-4 border-black pb-8">
        <div>
          <h2 class="text-4xl md:text-6xl font-headline font-black text-black uppercase tracking-tighter leading-none mb-2">
            {details.object.name || details.object.code}
          </h2>
          <span class="inline-block bg-[#00fd83] border-2 border-black text-black text-sm px-4 py-1 font-black uppercase tracking-widest neo-shadow">
            {type}
          </span>
          {#if details.object.code && details.object.name}
            <span class="inline-block bg-black text-white text-sm px-4 py-1 ml-2 font-black uppercase tracking-widest neo-shadow">
              {details.object.code}
            </span>
          {/if}
        </div>
        {#if authState.isLoggedIn}
          <a href={`/review/new?type=${type}&id=${id}&uni=${details.object.universityId}`} 
             class="bg-[#b41924] text-white border-4 border-black font-headline font-black text-2xl uppercase py-4 px-8 neo-shadow active-press flex-shrink-0 text-center w-full md:w-auto">
            WRITE REVIEW ->
          </a>
        {:else}
          <a href="/login" 
             class="bg-[#004be2] text-white border-4 border-black font-headline font-black text-2xl uppercase py-4 px-8 neo-shadow active-press flex-shrink-0 text-center w-full md:w-auto">
            SIGN IN TO REVIEW
          </a>
        {/if}
      </div>

      <!-- Stats Section — now uses real aggregated data -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="bg-[#fdd400] p-8 border-4 border-black neo-shadow flex flex-col items-center justify-center text-center">
          <span class="text-6xl font-headline font-black mb-2">{details.stats?.avgDifficulty ?? 'N/A'}</span>
          <p class="font-bold uppercase tracking-widest text-sm">AVG DIFFICULTY (1-5)</p>
        </div>
        <div class="bg-[#004be2] text-white p-8 border-4 border-black neo-shadow flex flex-col items-center justify-center text-center">
          <span class="text-6xl font-headline font-black mb-2">{details.stats?.totalReviews || 0}</span>
          <p class="font-bold uppercase tracking-widest text-sm text-[#00fd83]">TOTAL REVIEWS</p>
        </div>
        <div class="bg-[#deffe0] p-8 border-4 border-black neo-shadow flex flex-col items-center justify-center text-center">
          <span class="text-6xl font-headline font-black mb-2">
            {details.stats?.wouldTakeAgainPct !== null ? details.stats.wouldTakeAgainPct + '%' : 'N/A'}
          </span>
          <p class="font-bold uppercase tracking-widest text-sm">WOULD TAKE AGAIN</p>
        </div>
      </div>

      <div>
        <h3 class="text-4xl font-headline font-black uppercase tracking-tighter mb-8 bg-black text-white px-6 py-2 inline-block">RAW FEEDBACK</h3>
        
        {#if details.reviews.length === 0}
          <div class="bg-[#ffc3bf] border-4 border-black p-12 text-center neo-shadow">
             <span class="material-symbols-outlined text-6xl mb-4">mic_off</span>
             <h3 class="text-3xl font-headline font-black uppercase">NO VOICES YET</h3>
             <p class="font-bold mt-2 uppercase">Be the first to speak the truth.</p>
          </div>
        {:else}
          <div class="space-y-8">
            {#each details.reviews as review, i}
              <div class={`relative ${i % 2 === 0 ? 'bg-white' : 'bg-[#deffe0]'} border-4 border-black p-8 neo-shadow z-10`}>
                <div class="flex justify-between items-start mb-6 pb-6 border-b-4 border-black">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 border-4 border-black bg-black text-white flex items-center justify-center font-black text-2xl uppercase">
                      {review.anonymous ? '?' : 'U'}
                    </div>
                    <div>
                      <span class="font-black text-xl uppercase tracking-widest block">{review.anonymous ? 'ANONYMOUS' : 'STUDENT'}</span>
                      <span class="text-sm font-bold uppercase">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div class="bg-[#b41924] text-white border-4 border-black px-4 py-2 font-black neo-shadow transform rotate-3">
                    DIFF: {review.ratings?.difficulty}/5
                  </div>
                </div>
                
                <div class="mb-8">
                  <p class="text-2xl font-bold leading-relaxed">"{review.reviewText}"</p>
                </div>

                {#if review.tags?.length > 0}
                  <div class="flex gap-2 flex-wrap mb-6">
                    {#each review.tags as tag}
                      <span class="bg-[#fdd400] border-2 border-black px-3 py-1 font-bold text-sm uppercase">{tag}</span>
                    {/each}
                  </div>
                {/if}
                
                <div class="flex items-center justify-between mt-4">
                  <div class="flex gap-4">
                    <button 
                      onclick={() => handleVote(review._id, 'like')}
                      class="bg-[#00fd83] border-4 border-black px-4 py-2 font-black uppercase tracking-widest hover:bg-black hover:text-[#00fd83] transition-colors flex items-center gap-2 cursor-pointer">
                       <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">thumb_up</span>
                       {review.likes}
                    </button>
                    <button 
                      onclick={() => handleVote(review._id, 'dislike')}
                      class="bg-white border-4 border-black px-4 py-2 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
                       <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">thumb_down</span>
                       {review.dislikes || 0}
                    </button>
                  </div>
                  <button 
                    onclick={() => openFlagModal(review._id)}
                    class="text-[#b41924] font-black uppercase tracking-widest underline decoration-2 hover:bg-black hover:text-white px-2 cursor-pointer">
                    FLAG
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Flag Modal -->
{#if showFlagModal}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6">
    <div class="bg-white border-4 border-black neo-shadow-lg max-w-lg w-full">
      <div class="bg-[#b41924] border-b-4 border-black p-6 flex justify-between items-center">
        <h3 class="text-2xl font-headline font-black text-white uppercase">Flag Review</h3>
        <button onclick={() => showFlagModal = false} class="text-white font-black text-2xl cursor-pointer">✕</button>
      </div>
      <form onsubmit={submitFlag} class="p-6 space-y-4">
        <label for="flag-reason" class="block font-black text-lg uppercase">Why are you flagging this?</label>
        <textarea 
          id="flag-reason"
          bind:value={flagReason} 
          required 
          minlength="5"
          rows="4" 
          class="w-full border-4 border-black p-4 font-bold neo-shadow focus:shadow-none outline-none resize-none"
          placeholder="Explain the issue...">
        </textarea>
        <button type="submit" disabled={flagSubmitting} class="w-full bg-[#b41924] text-white border-4 border-black font-headline font-black text-xl uppercase py-3 neo-shadow active-press disabled:opacity-50">
          {flagSubmitting ? 'Submitting...' : 'Submit Flag'}
        </button>
      </form>
    </div>
  </div>
{/if}
