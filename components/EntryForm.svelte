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
    }
  }

  // Authentication variables
  let showAuthDialog = false;
  let authUsername = '';
  let authPassword = '';
  let authError = '';

  // Function to get auth credentials
  async function getAuthCredentials() {
    if (authUsername && authPassword) {
      return { username: authUsername, password: authPassword };
    }
    
    // Show auth dialog and wait for credentials
    return new Promise((resolve, reject) => {
      showAuthDialog = true;
      
      // Set up a function to handle submission of the auth dialog
      window.submitAuth = () => {
        if (!authUsername || !authPassword) {
          authError = 'Please enter both username and password';
          return;
        }
        
        showAuthDialog = false;
        resolve({ username: authUsername, password: authPassword });
      };
      
      // Set up a function to handle cancellation
      window.cancelAuth = () => {
        showAuthDialog = false;
        reject(new Error('Authentication cancelled'));
      };
    });
  }

  // Form submission
  async function handleSubmit() {
    if (!date || !description) {
      error = 'Please fill out all required fields';
      return;
    }

    try {
      submitting = true;
      error = '';
      success = '';
      
      // Get authentication credentials
      let auth;
      try {
        auth = await getAuthCredentials();
      } catch (authError) {
        throw new Error('Authentication required to submit entries');
      }

      // Process the image with consistent naming convention (if provided)
      let imagePath = '';
      if (imageFile) {
        const eventDate = date;
        const eventTitle = description.substring(0, 20); // Use first 20 chars of description as title
        const imageResult = handleImageUpload(imageFile, eventDate, eventTitle);
        
        // Full GitHub raw URL path for the image
        imagePath = imageResult.fullPath;
      }
      
      // Create an entry object for submission
      const entry = {
        date,
        description, // Put main description in description field as API expects
        description2: description2 || '',
        description3: description3 || '',
        description4: description4 || '',
        description5: description5 || '',
        description6: description6 || '',
        link,
        link2,
        link3,
        link4,
        link5,
        link6,
        imagePath
      };
      
      // Create auth header
      const authHeader = 'Basic ' + btoa(`${auth.username}:${auth.password}`);
      
      // Process the submission through Vercel serverless function
      let result;
      if (imageFile) {
        // Get extension from original file
        const fileExt = imageFile.name.split('.').pop().toLowerCase();
        const imageFilename = date.replace(/[^\w]/g, '-').toLowerCase() + '_' + 
                            description.substring(0, 20).replace(/[^\w]/g, '-').toLowerCase() + '_' + 
                            Math.floor(Math.random() * 1000) + '.' + fileExt;
        
        // Use authentication with submission
        const requestBody = { entry, imageData: await fileToBase64(imageFile), filename: imageFilename };
        result = await fetch(`${location.origin}/api/submit-entry/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(requestBody)
        }).then(r => {
          if (r.status === 401) {
            throw new Error('Invalid credentials');
          }
          return r.json();
        });
      } else {
        // Submit without image, but with authentication
        result = await fetch(`${location.origin}/api/update-csv/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({ entry })
        }).then(r => {
          if (r.status === 401) {
            throw new Error('Invalid credentials');
          }
          return r.json();
        });
      }
      
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
  
  // Helper function to convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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
    <label for="image">Image</label>
    <input 
      type="file" 
      id="image" 
      accept="image/*" 
      on:change={handleImageChange} 
      disabled={submitting}
    >
    {#if imagePreview}
      <div class="image-preview">
        <img src={imagePreview} alt="Preview" />
        <div class="image-info">
          <p>Size: {originalImageSize}</p>
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

<!-- Authentication Dialog -->
{#if showAuthDialog}
  <div class="auth-dialog-overlay">
    <div class="auth-dialog">
      <h3>Authentication Required</h3>
      <p>Please enter your credentials to submit this entry.</p>
      
      {#if authError}
        <div class="auth-error">{authError}</div>
      {/if}
      
      <div class="auth-form-group">
        <label for="auth-username">Username</label>
        <input 
          type="text" 
          id="auth-username" 
          bind:value={authUsername} 
          placeholder="Username"
        >
      </div>
      
      <div class="auth-form-group">
        <label for="auth-password">Password</label>
        <input 
          type="password" 
          id="auth-password" 
          bind:value={authPassword} 
          placeholder="Password"
        >
      </div>
      
      <div class="auth-buttons">
        <button type="button" class="auth-cancel-btn" on:click={window.cancelAuth}>Cancel</button>
        <button type="button" class="auth-submit-btn" on:click={window.submitAuth}>Submit</button>
      </div>
    </div>
  </div>
{/if}

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

  input[type="text"],
  input[type="url"],
  input[type="password"],
  textarea {
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
  
  /* Authentication Dialog Styles */
  .auth-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .auth-dialog {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    padding: 24px;
    width: 400px;
    max-width: 90%;
  }
  
  .auth-dialog h3 {
    margin-top: 0;
    color: #0088ff;
  }
  
  .auth-form-group {
    margin-bottom: 16px;
  }
  
  .auth-error {
    background-color: #fce8e6;
    color: #c5221f;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }
  
  .auth-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  .auth-submit-btn {
    background-color: #0088ff;
    color: white;
    border: none;
    padding: 10px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .auth-cancel-btn {
    background-color: #f1f1f1;
    color: #333;
    border: none;
    padding: 10px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .auth-submit-btn:hover {
    background-color: #0066cc;
  }
  
  .auth-cancel-btn:hover {
    background-color: #e0e0e0;
  }
</style>