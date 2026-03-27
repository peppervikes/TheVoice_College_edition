<script>
  import { page } from '$app/stores';
  import axios from 'axios';
  import { onMount } from 'svelte';

  const type = $page.params.type;
  const id = $page.params.id;

  let details = $state(null);
  let loading = $state(true);
  let errorMsg = $state('');

  onMount(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/object/${type}/${id}`);
      details = res.data;
    } catch (error) {
      errorMsg = 'Failed to load object details';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="flex justify-center p-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
{:else if errorMsg}
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {errorMsg}
  </div>
{:else if details}
  <div class="bg-white p-8 rounded shadow-md border border-gray-100">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h2 class="text-3xl font-extrabold text-gray-800">{details.object.name || details.object.code}</h2>
        <span class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 mt-2 rounded-full font-semibold uppercase tracking-wide">
          {type}
        </span>
      </div>
      <a href={`/review/new?type=${type}&id=${id}&uni=${details.object.universityId}`} 
         class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
        Write a Review
      </a>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div class="bg-gray-50 p-6 rounded border">
        <h3 class="text-xl font-bold mb-2">Aggregated Stats</h3>
        <p class="text-gray-700"><strong>Average Difficulty:</strong> {details.stats.avgDifficulty} / 5</p>
        <!-- Additional stats would go here -->
      </div>
    </div>

    <div>
      <h3 class="text-2xl font-bold mb-4">Reviews</h3>
      {#if details.reviews.length === 0}
        <p class="text-gray-500 bg-gray-50 p-6 rounded border border-dashed border-gray-300 text-center">No reviews yet. Be the first to review!</p>
      {:else}
        <div class="space-y-4">
          {#each details.reviews as review}
            <div class="bg-white border rounded p-6 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <span class="font-bold text-gray-800">{review.anonymous ? 'Anonymous' : 'Student'}</span>
                <span class="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="mb-4">
                <p class="text-gray-700"><strong>Difficulty:</strong> {review.ratings?.difficulty} / 5</p>
                <p class="text-gray-700 mt-2 whitespace-pre-line">{review.reviewText}</p>
              </div>
              <div class="flex items-center space-x-4 text-sm mt-4 pt-4 border-t">
                <button class="text-gray-500 hover:text-blue-600 font-semibold flex items-center space-x-1">
                  <span>👍</span> <span>{review.likes} Helpful</span>
                </button>
                <button class="text-gray-500 hover:text-red-500 font-semibold flex items-center space-x-1">
                  <span>👎</span> <span>{review.dislikes}</span>
                </button>
                <button class="text-red-400 hover:text-red-600 uppercase text-xs font-bold tracking-wider ml-auto">
                  Flag
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
