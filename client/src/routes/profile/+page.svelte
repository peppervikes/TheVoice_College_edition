<script>
  import api from '$lib/api.js';
  import { auth } from '$lib/stores/auth.js';
  import { onMount } from 'svelte';

  let reviews = $state([]);
  let isLoading = $state(true);
  let errorMsg = $state('');

  onMount(async () => {
    // We already have a check in place for auth?
    // Let's redirect if not logged in.
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await api.get('/reviews/me');
      reviews = res.data;
    } catch (error) {
      console.error('Failed to load reviews:', error);
      errorMsg = 'Failed to load your reviews.';
    } finally {
      isLoading = false;
    }
  });

  async function handleDelete(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      reviews = reviews.filter(r => r._id !== reviewId);
    } catch (error) {
      alert('Failed to delete review.');
      console.error(error);
    }
  }
</script>

<svelte:head>
  <title>RateMyCourse - My Profile</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12 lg:py-24">
  <div class="mb-12">
    <h1 class="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter mb-4">
      My Profile
    </h1>
    <p class="text-xl font-bold uppercase tracking-widest bg-black text-white px-2 py-1 inline-block">
      Manage Your Reviews
    </p>
  </div>

  {#if errorMsg}
    <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] px-4 py-3 mb-6 font-bold uppercase tracking-wider text-sm">
      {errorMsg}
    </div>
  {/if}

  {#if isLoading}
    <div class="text-center font-bold text-xl uppercase tracking-widest py-10 border-4 border-black bg-white neo-shadow">
      Loading your reviews...
    </div>
  {:else if reviews.length === 0}
    <div class="text-center bg-white border-4 border-black p-12 neo-shadow">
      <h3 class="text-2xl font-headline font-black uppercase mb-4">No reviews yet</h3>
      <p class="font-bold mb-6">You haven't submitted any reviews.</p>
      <a href="/" class="bg-[#004be2] text-white border-4 border-black font-headline font-black text-xl uppercase py-3 px-6 neo-shadow active-press inline-block">
        Find a Course
      </a>
    </div>
  {:else}
    <div class="space-y-8">
      {#each reviews as review}
        <div class="bg-white border-4 border-black p-6 neo-shadow relative group">
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="bg-[#fdd400] text-black border-2 border-black px-2 py-1 text-xs font-black uppercase mr-2 tracking-widest">
                {review.objectType}
              </span>
              <span class="text-sm font-bold text-gray-500 uppercase tracking-widest">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div class="flex gap-2">
              <button onclick={() => window.location.href = `/object/${review.objectType}/${review.objectId}`} class="p-2 border-2 border-black bg-white hover:bg-[#deffe0] transition-colors title='View Object'">
                <span class="material-symbols-outlined text-sm leading-none">visibility</span>
              </button>
              <button onclick={() => handleDelete(review._id)} class="p-2 border-2 border-black bg-white hover:bg-[#b41924] hover:text-white transition-colors title='Delete Review'">
                <span class="material-symbols-outlined text-sm leading-none">delete</span>
              </button>
            </div>
          </div>
          
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-[#004be2] text-white border-4 border-black flex flex-col items-center justify-center neo-shadow">
              <span class="text-xs font-bold uppercase tracking-widest">Diff</span>
              <span class="text-xl font-black">{review.ratings?.difficulty || '?'}</span>
            </div>
            {#if review.grade}
              <div class="w-16 h-16 bg-white border-4 border-black flex flex-col items-center justify-center neo-shadow">
                <span class="text-xs font-bold uppercase tracking-widest">Grade</span>
                <span class="text-xl font-black">{review.grade}</span>
              </div>
            {/if}
          </div>

          <p class="text-lg font-bold mb-4">{review.reviewText}</p>

          {#if review.tags && review.tags.length > 0}
            <div class="flex flex-wrap gap-2 mb-4">
              {#each review.tags as tag}
                <span class="bg-[#deffe0] border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-widest">
                  {tag}
                </span>
              {/each}
            </div>
          {/if}

          <div class="flex items-center gap-4 border-t-4 border-black pt-4">
             <span class="font-bold text-sm uppercase tracking-widest">👍 {review.likes || 0} Likes</span>
             <span class="font-bold text-sm uppercase tracking-widest">👎 {review.dislikes || 0} Dislikes</span>
             <span class="font-bold text-sm uppercase tracking-widest">
               {review.anonymous ? '👀 Posted Anonymously' : `👤 Posted as ${$auth.user?.pseudonym}`}
             </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
