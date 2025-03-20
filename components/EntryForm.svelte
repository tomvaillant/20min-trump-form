<script>
  import { createEventDispatcher } from 'svelte';
  import { handleImageUpload, processSubmission, compressImage } from '../utils/apiUtils.js';
  import { getImageUrl } from '../utils/config.js';

  const dispatch = createEventDispatcher();

  // Form fields
  let date = '';
  let description = '';
  let description2 = '';
  let description3 = '';
  let description4 = '';
  let description5 = '';
  let description6 = '';
  let link = '';
  let link2 = '';
  let link3 = '';
  let link4 = '';
  let link5 = '';
  let link6 = '';
  let imageFile = null;
  let imagePreview = null;
  let submitting = false;
  let error = '';
  let success = '';
  let originalImageSize = '';
  let compressedImageSize = '';

  // Handle image selection
  async function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      // Store original size for display
      originalImageSize = (file.size / 1024).toFixed(2) + ' KB';
      
      // Store original file
      imageFile = file;
      
      // Show preview of the original image
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Try to compress the image in background to see size reduction
      try {
        const compressed = await compressImage(file);
        compressedImageSize = (compressed.size / 1024).toFixed(2) + ' KB';
      } catch (err) {
        console.error('Preview compression error:', err);
        compressedImageSize = originalImageSize;
      }
    }
  }

  // Form submission
  async function handleSubmit() {
    if (!date || !description || !imageFile) {
      error = 'Please fill out all required fields';
      return;
    }

    try {
      submitting = true;
      error = '';
      success = '';

      // Process the image with consistent naming convention
      const eventDate = date;
      const eventTitle = description.substring(0, 20); // Use first 20 chars of description as title
      const imageResult = handleImageUpload(imageFile, eventDate, eventTitle);
      
      // Full GitHub raw URL path for the image
      const imagePath = imageResult.fullPath;
      
      // Create an entry object for submission
      const entry = {
        date,
        year: '',
        description,
        description2,
        description3,
        description4,
        description5,
        description6,
        link,
        link2,
        link3,
        link4,
        link5,
        link6,
        imagePath
      };
      
      // Process the submission through Vercel serverless function
      const result = await processSubmission(entry, imageFile, imageResult.filename);
      
      if (result.success) {
        // Reset the form after successful submission
        date = '';
        description = '';
        description2 = '';
        description3 = '';
        description4 = '';
        description5 = '';
        description6 = '';
        link = '';
        link2 = '';
        link3 = '';
        link4 = '';
        link5 = '';
        link6 = '';
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
    <label for="date">Date <span class="required">*</span></label>
    <input 
      type="text" 
      id="date" 
      bind:value={date} 
      placeholder="e.g. Jul 5" 
      required
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description">Event <span class="required">*</span></label>
    <textarea 
      id="description" 
      bind:value={description} 
      rows="3" 
      placeholder="Main event description" 
      required
      disabled={submitting}
    ></textarea>
  </div>

  <div class="form-group">
    <label for="link">Link (optional)</label>
    <input 
      type="url" 
      id="link" 
      bind:value={link} 
      placeholder="URL for reference (e.g., https://example.com)"
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description2">Event 2 (optional)</label>
    <textarea 
    id="description2" 
    bind:value={description2} 
    rows="3" 
    placeholder="Additional event description"
    disabled={submitting}
    ></textarea>
  </div>

  <div class="form-group">
    <label for="link2">Link 2 (optional)</label>
    <input 
      type="url" 
      id="link2" 
      bind:value={link2} 
      placeholder="URL for reference (e.g., https://example.com)"
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description3">Event 3 (optional)</label>
    <textarea 
      id="description3" 
      bind:value={description3} 
      rows="3" 
      placeholder="Additional event description"
      disabled={submitting}
    ></textarea>
  </div>

  <div class="form-group">
    <label for="link3">Link 3 (optional)</label>
    <input 
      type="url" 
      id="link3" 
      bind:value={link3} 
      placeholder="URL for reference (e.g., https://example.com)"
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description4">Event 4 (optional)</label>
    <textarea 
      id="description4" 
      bind:value={description4} 
      rows="3" 
      placeholder="Additional event description"
      disabled={submitting}
    ></textarea>
  </div>

  <div class="form-group">
    <label for="link4">Link 4 (optional)</label>
    <input 
      type="url" 
      id="link4" 
      bind:value={link4} 
      placeholder="URL for reference (e.g., https://example.com)"
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description5">Event 5 (optional)</label>
    <textarea 
      id="description5" 
      bind:value={description5} 
      rows="3" 
      placeholder="Additional event description"
      disabled={submitting}
    ></textarea>
  </div>

  <div class="form-group">
    <label for="link5">Link 5 (optional)</label>
    <input 
      type="url" 
      id="link5" 
      bind:value={link5} 
      placeholder="URL for reference (e.g., https://example.com)"
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="description6">Event 6 (optional)</label>
    <textarea 
      id="description6" 
      bind:value={description6} 
      rows="3" 
      placeholder="Additional event description"
      disabled={submitting}
    ></textarea>
  </div>
  
  <div class="form-group">
    <label for="link6">Link 6 (optional)</label>
    <input 
      type="url" 
      id="link6" 
      bind:value={link6} 
      placeholder="URL for reference (e.g., https://example.com)"
      disabled={submitting}
    >
  </div>
  
  <div class="form-group">
    <label for="image">Image <span class="required">*</span> <span class="file-info">(Will be compressed to max 300KB)</span></label>
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
        <div class="image-info">
          <p>Original size: {originalImageSize}</p>
          {#if compressedImageSize && compressedImageSize !== originalImageSize}
            <p>Will be compressed to: {compressedImageSize} 
              <span class="compression-info">
                ({Math.round((1 - (parseFloat(compressedImageSize) / parseFloat(originalImageSize))) * 100)}% reduction)
              </span>
            </p>
          {/if}
        </div>
      </div>
    {/if}
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
    color: #0088ff;
  }
  
  .file-info {
    font-size: 0.8rem;
    font-weight: normal;
    color: #666;
    margin-left: 5px;
  }

  input[type="text"],
  input[type="url"],
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
  
  .image-info {
    margin-top: 8px;
    font-size: 0.85rem;
    color: #555;
    background-color: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
  }
  
  .image-info p {
    margin: 4px 0;
  }
  
  .compression-info {
    color: #0088ff;
    font-weight: 600;
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
    background-color: #0088ff;
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
    background-color: #0066cc;
  }

  .submit-btn[disabled] {
    background-color: #cccccc;
    cursor: not-allowed;
  }
</style>