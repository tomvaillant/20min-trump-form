<script>
  import EntryForm from './components/EntryForm.svelte';
  let successMessage = '';

  // Handle form submission success
  function handleFormSuccess(event) {
    successMessage = 'Entry added successfully!';
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage = '';
    }, 5000);
  }
</script>

<div class="container">
  <h1>Add New Trump Event</h1>
  
  {#if successMessage}
    <div class="message success">{successMessage}</div>
  {/if}

  <EntryForm on:success={handleFormSuccess} />
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'BatonTurbo', system-ui, sans-serif;
  }

  h1 {
    color: #b24846; /* Trump red */
    text-align: center;
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

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f7f7f7;
    color: #333;
  }
</style>