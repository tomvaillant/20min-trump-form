<script>
  import { createEventDispatcher } from 'svelte';
  import { handleImageUpload, processSubmission } from '../utils/apiUtils.js';
  import { getImageUrl } from '../utils/config.js';

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
  let success = '';

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
      success = '';

      // Process the image with consistent naming convention
      const eventDate = `${date}-${year}`;
      const eventTitle = description.substring(0, 20); // Use first 20 chars of description as title
      const imageResult = handleImageUpload(imageFile, eventDate, eventTitle);
      
      // Full GitHub raw URL path for the image
      const imagePath = imageResult.fullPath;
      
      // Create an entry object for submission
      const entry = {
        date,
        year,
        description,
        description2,
        description3,
        position,
        imagePath
      };
      
      // Process the submission through Vercel serverless function
      const result = await processSubmission(entry, imageFile, imageResult.filename);
      
      if (result.success) {
        // Reset the form after successful submission
        date = '';
        year = '';
        description = '';
        description2 = '';
        description3 = '';
        position = 'right';
        imageFile = null;
        imagePreview = null;
        
        success = 'Entry successfully added to the timeline!';
        
        // Notify parent component of success
        dispatch('success');
      } else {
        throw new Error(result.message);
      }
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
    <div class="message error-message">{error}</div>
  {/if}
  
  {#if success}
    <div class="message success-message">{success}</div>
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

  .message {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
  }

  .error-message {
    background-color: #fce8e6;
    color: #c5221f;
    border: 1px solid #f4c7c3;
  }
  
  .success-message {
    background-color: #e6f4ea;
    color: #0d652d;
    border: 1px solid #b7dfca;
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
</style>