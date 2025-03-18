<script>
  export let entries = [];
  
  // Sort entries by date (most recent first)
  $: sortedEntries = [...entries].sort((a, b) => {
    // Simple comparison based on month names
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const aMonth = a.date.split(' ')[0];
    const bMonth = b.date.split(' ')[0];
    
    // Get month indices
    const aMonthIndex = months.indexOf(aMonth);
    const bMonthIndex = months.indexOf(bMonth);
    
    if (aMonthIndex !== bMonthIndex) {
      return bMonthIndex - aMonthIndex;
    }
    
    // If months are the same, compare by day
    const aDay = parseInt(a.date.split(' ')[1]) || 0;
    const bDay = parseInt(b.date.split(' ')[1]) || 0;
    
    return bDay - aDay;
  });
</script>

{#if sortedEntries.length === 0}
  <div class="no-entries">No entries found. Add your first entry above!</div>
{:else}
  <div class="entries-grid">
    {#each sortedEntries as entry}
      <div class="entry-card">
        <div class="entry-header">
          <span class="entry-date">{entry.date}</span>
        </div>
        
        <div class="entry-image">
          {#if entry.image}
            <img src={entry.image} alt={entry.date} />
          {:else}
            <div class="placeholder-image">No image</div>
          {/if}
        </div>
        
        <div class="entry-descriptions">
          <p class="main-description">{entry.description}</p>
          {#if entry.description2 && entry.description2.trim() !== ''}
            <p>{entry.description2}</p>
          {/if}
          {#if entry.description3 && entry.description3.trim() !== ''}
            <p>{entry.description3}</p>
          {/if}
          {#if entry.description4 && entry.description4.trim() !== ''}
            <p>{entry.description4}</p>
          {/if}
          {#if entry.description5 && entry.description5.trim() !== ''}
            <p>{entry.description5}</p>
          {/if}
          {#if entry.description6 && entry.description6.trim() !== ''}
            <p>{entry.description6}</p>
          {/if}
        </div>
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

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .entry-date {
    font-weight: bold;
    color: #666;
  }

  .entry-image {
    width: 100%;
    height: 200px;
    margin: 10px 0;
    border-radius: 4px;
    overflow: hidden;
    background-color: #f0f0f0;
  }

  .entry-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .entry-image img:hover {
    transform: scale(1.03);
  }

  .placeholder-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-style: italic;
  }

  .entry-descriptions {
    margin: 15px 0;
  }

  .main-description {
    font-weight: 500;
  }

  .entry-descriptions p {
    margin: 8px 0;
    line-height: 1.4;
  }


  @media (max-width: 768px) {
    .entries-grid {
      grid-template-columns: 1fr;
    }
  }
</style>