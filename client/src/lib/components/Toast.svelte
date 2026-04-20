<script>
  import { toasts, removeToast } from '$lib/stores/toasts.js';
  import { fade } from 'svelte/transition';
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-4 pointer-events-none">
  {#each $toasts as toast (toast.id)}
    <div 
      transition:fade
      class="pointer-events-auto border-4 border-black p-4 neo-shadow flex items-center justify-between min-w-[300px]
      {toast.type === 'error' ? 'bg-[#b41924] text-white' : 
       toast.type === 'success' ? 'bg-[#00fd83] text-black' : 
       'bg-[#004be2] text-white'}"
    >
      <span class="font-black uppercase tracking-widest">{toast.message}</span>
      <button class="ml-4 font-black text-xl hover:scale-110 transition-transform" onclick={() => removeToast(toast.id)}>
        &times;
      </button>
    </div>
  {/each}
</div>
