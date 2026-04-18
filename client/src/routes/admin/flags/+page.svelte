<script>
  import api from '$lib/api.js';
  import { onMount } from 'svelte';

  let flags = $state([]);
  let loading = $state(true);
  let errorMsg = $state('');

  onMount(async () => {
    fetchFlags();
  });

  async function fetchFlags() {
    loading = true;
    try {
      const res = await api.get('/flags?status=pending');
      flags = res.data;
    } catch (error) {
      console.error(error);
      errorMsg = 'Failed to load flags.';
    } finally {
      loading = false;
    }
  }

  async function handleDismiss(flagId) {
    try {
      await api.put(`/flags/${flagId}`, { status: 'reviewed' });
      flags = flags.filter(f => f._id !== flagId);
    } catch (error) {
      alert('Failed to dismiss flag.');
    }
  }

  async function handleDeleteReview(flagId, reviewId) {
    if (!confirm('Are you SURE you want to delete this review? This cannot be undone.')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      // Mark flag as reviewed too
      await api.put(`/flags/${flagId}`, { status: 'reviewed' });
      flags = flags.filter(f => f._id !== flagId);
    } catch (error) {
      alert('Failed to delete review.');
      console.error(error);
    }
  }
</script>

<div class="bg-white border-4 border-black p-8 neo-shadow mb-8">
  <h1 class="text-4xl font-headline font-black uppercase tracking-tighter mb-2">Review Flags</h1>
  <p class="font-bold text-lg text-[#b41924]">Content requiring moderator attention.</p>
</div>

{#if errorMsg}
  <div class="bg-[#ffefef] border-4 border-[#b41340] text-[#b41340] p-4 mb-6 font-bold uppercase tracking-wider text-sm">
    {errorMsg}
  </div>
{/if}

{#if loading}
  <div class="font-black p-8 bg-white border-4 border-black neo-shadow uppercase">Loading flags...</div>
{:else if flags.length === 0}
  <div class="font-black p-8 bg-[#deffe0] border-4 border-[#008944] text-[#006a33] neo-shadow uppercase text-xl">
    Hooray! No pending flags.
  </div>
{:else}
  <div class="space-y-6">
    {#each flags as flag}
      <div class="bg-white border-4 border-black p-6 neo-shadow">
        <div class="flex justify-between items-start mb-4 pb-4 border-b-4 border-black">
          <div>
            <span class="bg-[#b41924] text-white px-2 py-1 text-xs font-black uppercase tracking-widest mr-2">Flagged</span>
            <span class="font-bold uppercase tracking-widest text-sm text-gray-500">
              {new Date(flag.createdAt).toLocaleString()}
            </span>
            <p class="mt-2 font-bold">Reported By: <span class="text-[#004be2]">{flag.reportedBy?.pseudonym || 'Unknown'}</span></p>
          </div>
          <div class="flex gap-4">
            <button onclick={() => handleDismiss(flag._id)} class="bg-[#fdd400] text-black border-4 border-black px-4 py-2 font-black uppercase neo-shadow active-press">
              Dismiss Flag
            </button>
            <button onclick={() => handleDeleteReview(flag._id, flag.reviewId._id)} class="bg-[#b41924] text-white border-4 border-black px-4 py-2 font-black uppercase neo-shadow active-press">
              Delete Review
            </button>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="font-black uppercase tracking-widest mb-1 text-[#b41924]">Flag Reason:</h3>
          <p class="text-xl font-bold bg-[#ffefee] border-l-4 border-[#b41924] p-4">{flag.reasonText}</p>
        </div>

        <div>
          <h3 class="font-black uppercase tracking-widest mb-1">Review Content:</h3>
          {#if flag.reviewId}
             <div class="bg-gray-100 border-2 border-black p-4">
                <p class="text-lg italic">"{flag.reviewId.reviewText}"</p>
                <div class="mt-4 flex gap-4 text-sm font-bold uppercase tracking-widest text-gray-500">
                   <span>Difficulty: {flag.reviewId.ratings?.difficulty}</span>
                   <span>Likes: {flag.reviewId.likes}</span>
                </div>
             </div>
          {:else}
             <p class="text-gray-500 italic">Review has already been deleted.</p>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
