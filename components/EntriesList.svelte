<script>
  export let entries = [];
  
  // Sort entries by date (most recent first)
  $: sortedEntries = [...entries].sort((a, b) => {
    // Simple comparison assuming dates in format "Month Day, Year"
    return new Date(b.date) - new Date(a.date);
  });
</script>

{#if sortedEntries.length === 0}
  <div class="no-entries">No entries found. Add your first entry above!</div>
{:else}
  <div class="entries-grid">
    {#each sortedEntries as entry}
      <div class="entry-card">
        <span class="entry-date">{entry.date}</span>
        <h3>{entry.year}</h3>
        
        <div class="entry-image">
          <img src={entry.image} alt={entry.year} />
        </div>
        
        <div class="entry-descriptions">
          <p>{entry.description}</p>
          {#if entry.description2 && entry.description2.trim() !== ''}
            <p>{entry.description2}</p>
          {/if}
          {#if entry.description3 && entry.description3.trim() !== ''}
            <p>{entry.description3}</p>
          {/if}
        </div>
        
        <span class="entry-position">Position: {entry.position}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .no-entries {
    text-align: center;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 6px;
    font-style: italic;
    color: #666;
  }

  .entries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .entry-card {
    background-color: white;
    border-radius: 6px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .entry-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .entry-date {
    font-weight: bold;
    color: #666;
    display: block;
    margin-bottom: 5px;
  }

  h3 {
    margin-top: 0;
    color: #b24846;
    margin-bottom: 15px;
  }

  .entry-image {
    width: 100%;
    margin: 10px 0;
    border-radius: 4px;
    overflow: hidden;
  }

  .entry-image img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }

  .entry-image img:hover {
    transform: scale(1.03);
  }

  .entry-descriptions p {
    margin: 8px 0;
    line-height: 1.4;
  }

  .entry-position {
    display: inline-block;
    padding: 4px 8px;
    margin-top: 10px;
    background-color: #f0f0f0;
    border-radius: 20px;
    font-size: 0.8rem;
    color: #666;
  }

  @media (max-width: 768px) {
    .entries-grid {
      grid-template-columns: 1fr;
    }
  }
</style>