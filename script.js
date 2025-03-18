document.addEventListener('DOMContentLoaded', function() {
    // Image preview functionality
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener('load', function() {
                imagePreview.src = this.result;
                imagePreview.style.display = 'block';
            });
            reader.readAsDataURL(file);
        }
    });

    // Load existing entries
    loadEntries();
    
    // Form submission handler
    const timelineForm = document.getElementById('timelineForm');
    timelineForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Create FormData object
        const formData = new FormData(this);
        
        // Send the form data to the server
        submitForm(formData);
    });
});

// Load existing entries from CSV
async function loadEntries() {
    try {
        const response = await fetch('timeline-data.csv');
        if (!response.ok) {
            throw new Error('Failed to load timeline data');
        }
        
        const data = await response.text();
        const rows = data.split('\n');
        const headers = rows[0].split(',');
        
        // Parse the CSV data
        const items = rows.slice(1).filter(row => row.trim() !== '')
            .map(row => {
                const values = row.split(',');
                return {
                    date: values[0],
                    year: values[1],
                    description: values[2],
                    description2: values[3],
                    description3: values[4],
                    image: values[5],
                    position: values[6]
                };
            });
        
        displayEntries(items);
    } catch (err) {
        console.error('Error loading timeline data:', err);
        showMessage('Error loading existing entries', 'error');
    }
}

// Display entries in the UI
function displayEntries(entries) {
    const entriesContainer = document.getElementById('entriesContainer');
    entriesContainer.innerHTML = '';
    
    if (entries.length === 0) {
        entriesContainer.innerHTML = '<p>No entries found. Add your first entry above!</p>';
        return;
    }
    
    // Sort entries by date (latest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    entries.forEach(entry => {
        const entryCard = document.createElement('div');
        entryCard.classList.add('entry-card');
        
        entryCard.innerHTML = `
            <span class="entry-date">${entry.date}</span>
            <h3>${entry.year}</h3>
            <p>${entry.description}</p>
            ${entry.description2 && entry.description2.trim() ? `<p>${entry.description2}</p>` : ''}
            ${entry.description3 && entry.description3.trim() ? `<p>${entry.description3}</p>` : ''}
            <img class="entry-image" src="${entry.image}" alt="${entry.year}">
            <span class="entry-position">Position: ${entry.position}</span>
        `;
        
        entriesContainer.appendChild(entryCard);
    });
}

// Submit form data to the server
async function submitForm(formData) {
    try {
        const response = await fetch('/api/timeline-entry', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error submitting form');
        }
        
        const result = await response.json();
        
        // Show success message
        showMessage('Entry added successfully!', 'success');
        
        // Reset form and reload entries
        document.getElementById('timelineForm').reset();
        document.getElementById('imagePreview').style.display = 'none';
        loadEntries();
        
    } catch (err) {
        console.error('Error:', err);
        showMessage(err.message || 'Error submitting form', 'error');
    }
}

// Display message to user
function showMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = 'message ' + type;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}