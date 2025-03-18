<script>
  import { onMount } from 'svelte';
  import EntryForm from './components/EntryForm.svelte';
  import EntriesList from './components/EntriesList.svelte';
  import { fetchTimelineData } from './utils/dataUtils.js';

  let timelineItems = [];
  let isLoading = true;
  let error = null;
  let successMessage = '';

  // Function to load existing entries
  async function loadEntries() {
    try {
      isLoading = true;
      timelineItems = await fetchTimelineData();
      isLoading = false;
    } catch (err) {
      console.error('Error loading timeline data:', err);
      error = err.message || 'Error loading entries';
      isLoading = false;
    }
  }

  // Handle form submission success
  function handleFormSuccess(event) {
    successMessage = 'Entry added successfully!';
    
    // Reload entries to show the new one
    loadEntries();
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage = '';
    }, 5000);
  }

  onMount(() => {
    loadEntries();
  });
</script>

<div class="container">
  <h1>Add New Trump Event</h1>
  
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <EntryForm on:success={handleFormSuccess} />

  <div class="entries-section">
    <h2>Current Entries</h2>
    
    {#if isLoading}
      <div class="loading">Loading entries...</div>
    {:else if error}
      <div class="error">Error: {error}</div>
    {:else}
      <EntriesList entries={timelineItems} />
    {/if}
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'BatonTurbo', system-ui, sans-serif;
  }

  h1, h2 {
    color: #b24846; /* Trump red */
    text-align: center;
  }

  .entries-section {
    margin-top: 40px;
  }

  .message {
    margin: 20px 0;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
  }

  .message.success {
    background-color: #e6f4ea;
    color: #0d652d;
    border: 1px solid #b7dfca;
  }

  .message.error {
    background-color: #fce8e6;
    color: #c5221f;
    border: 1px solid #f4c7c3;
  }

  .loading, .error {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    background-color: #f9f9f9;
    border-radius: 4px;
    margin-top: 20px;
  }

  .error {
    color: #c5221f;
    background-color: #fce8e6;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f7f7f7;
    color: #333;
  }
</style>