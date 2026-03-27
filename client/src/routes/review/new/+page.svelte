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
      alert('Review submitted successfully!');
      window.location.href = `/object/${type}/${id}`;
    } catch (error) {
      errorMsg = error.response?.data?.error || 'Failed to submit review';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto bg-white p-8 rounded shadow-md border border-gray-100 mt-8">
  <h2 class="text-2xl font-bold mb-6">Write a Review</h2>
  
  {#if errorMsg}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {errorMsg}
    </div>
  {/if}

  <form on:submit|preventDefault={submitReview} class="space-y-6">
    
    <div class="bg-gray-50 p-4 rounded border">
      <label class="block text-gray-800 font-bold mb-2">Overall Difficulty (1-5)</label>
      <input type="range" min="1" max="5" bind:value={difficulty} class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
      <div class="text-center mt-2 font-bold text-blue-600 text-xl">{difficulty}</div>
    </div>
    
    <div>
      <label class="block text-gray-800 font-bold mb-2">Review Text</label>
      <textarea bind:value={textReview} rows="5" required minlength="10" maxlength="350" class="w-full p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="What did you think of the class? (max 350 characters)"></textarea>
      <p class="text-sm text-gray-500 mt-1">{textReview.length} / 350</p>
    </div>

    <div class="flex items-center space-x-2">
      <input type="checkbox" id="anon" bind:checked={anonymous} class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
      <label for="anon" class="text-gray-700 font-semibold cursor-pointer">Post Anonymously</label>
    </div>

    <div class="pt-4 border-t">
      <button type="submit" disabled={isSubmitting} class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded shadow transition text-lg">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  </form>
</div>
