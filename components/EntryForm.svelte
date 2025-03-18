<script>
  import { createEventDispatcher } from 'svelte';
  import { handleImageUpload, appendToCSV } from '../utils/apiUtils.js';

  const dispatch = createEventDispatcher();

  // Form fields
  let date = '';
  let year = '';
  let description = '';
  let description2 = '';
  let description3 = '';
  let position = 'right';
  let imageFile = null;
  let imagePreview = null;
  let submitting = false;
  let error = '';

  // Handle image selection
  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      imageFile = file;
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Form submission
  async function handleSubmit() {
    if (!date || !year || !description || !imageFile) {
      error = 'Please fill out all required fields';
      return;
    }

    try {
      submitting = true;
      error = '';

      // Process the image with consistent naming convention
      const eventDate = `${date}-${year}`;
      const eventTitle = description.substring(0, 20); // Use first 20 chars of description as title
      const imageResult = handleImageUpload(imageFile, eventDate, eventTitle);
      
      // Save image to the images directory
      // In a client-side only app, we can only simulate this
      // For real app use, we'd need either:
      // 1. A small server component to handle file uploads
      // 2. Use the File System Access API (only works in some browsers)
      const imagePath = `/images/${imageResult.filename}`;
      
      // Save a copy of the image as a blob URL for demonstration
      const imageURL = URL.createObjectURL(imageFile);
      
      // Log what would happen in a real implementation
      console.log(`In a real implementation, '${imageFile.name}' would be saved as '${imageResult.filename}' to the images directory`);
      
      // Create an entry object for CSV
      const entry = {
        date,
        year,
        description,
        description2,
        description3,
        position,
        imagePath
      };
      
      // Append to CSV (simulated in client-side only app)
      await appendToCSV(entry);
      
      // For demo purposes - saves the image to the user's downloads or prompts to save
      // In a real implementation with a server, this would be handled server-side
      const downloadImage = async () => {
        const a = document.createElement('a');
        a.href = imageURL;
        a.download = imageResult.filename;
        a.click();
      };
      
      // Ask user if they want to save the image locally (for demonstration)
      if (confirm("This is a client-side only demo. Would you like to save the image file to your computer? In a real implementation, this would be saved server-side.")) {
        await downloadImage();
      }
      
      // Reset the form
      date = '';
      year = '';
      description = '';
      description2 = '';
      description3 = '';
      position = 'right';
      imageFile = null;
      imagePreview = null;
      
      // Notify parent component of success
      dispatch('success');
    } catch (err) {
      console.error('Submission error:', err);
      error = err.message || 'Error submitting form';
    } finally {
      submitting = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="entry-form">
  <div class="form-group">
    <label for="date">Month <span class="required">*</span></label>
    <input 
      type="text" 
      id="date" 
      bind:value={date} 
      placeholder="e.g. July 1" 
      required
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="year">Year <span class="required">*</span></label>
    <input 
      type="text" 
      id="year" 
      bind:value={year} 
      placeholder="Entry year" 
      required
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description">Description <span class="required">*</span></label>
    <textarea 
      id="description" 
      bind:value={description} 
      rows="3" 
      placeholder="Main description" 
      required
      disabled={submitting}
    ></textarea>
  </div>
  
  <div class="form-group">
    <label for="description2">Description 2 (optional)</label>
    <textarea 
      id="description2" 
      bind:value={description2} 
      rows="3" 
      placeholder="Additional description"
      disabled={submitting}
    ></textarea>
  </div>
  
  <div class="form-group">
    <label for="description3">Description 3 (optional)</label>
    <textarea 
      id="description3" 
      bind:value={description3} 
      rows="3" 
      placeholder="Additional description"
      disabled={submitting}
    ></textarea>
  </div>
  
  <div class="form-group">
    <label for="image">Image <span class="required">*</span></label>
    <input 
      type="file" 
      id="image" 
      accept="image/*" 
      on:change={handleImageChange} 
      required
      disabled={submitting}
    >
    {#if imagePreview}
      <div class="image-preview">
        <img src={imagePreview} alt="Preview" />
      </div>
    {/if}
  </div>
  
  <div class="form-group">
    <label for="position">Position <span class="required">*</span></label>
    <select id="position" bind:value={position} disabled={submitting}>
      <option value="left">Left</option>
      <option value="right">Right</option>
    </select>
  </div>
  
  {#if error}
    <div class="error-message">{error}</div>
  {/if}
  
  <button type="submit" class="submit-btn" disabled={submitting}>
    {submitting ? 'Submitting...' : 'Add Entry'}
  </button>
</form>

<style>
  .entry-form {
    background-color: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
  }

  .required {
    color: #b24846;
  }

  input[type="text"], 
  textarea, 
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    box-sizing: border-box;
  }

  textarea {
    resize: vertical;
  }

  input[type="file"] {
    padding: 10px 0;
  }

  .image-preview {
    margin-top: 10px;
    max-width: 100%;
    overflow: hidden;
  }

  .image-preview img {
    max-width: 100%;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .submit-btn {
    background-color: #b24846;
    color: white;
    border: none;
    padding: 12px 20px;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    transition: background-color 0.3s;
  }

  .submit-btn:hover:not([disabled]) {
    background-color: #943b39;
  }

  .submit-btn[disabled] {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .error-message {
    background-color: #fce8e6;
    color: #c5221f;
    border: 1px solid #f4c7c3;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
  }
</style>