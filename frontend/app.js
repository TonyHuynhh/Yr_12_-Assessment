let isEditMode = false; // Track whether we're in edit mode
let editId = null; // Store the ID of the session being edited


// Function to add a new study session
function addStudySession(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const date = document.getElementById('date').value; 
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('notes').value;

    // Ensure all fields are filled out
    if (subject && date && duration) {
        if (!isEditMode) { // Add only if not in edit mode
            // Send a POST request to add the study session
            fetch('http://localhost:3001/api/study-sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, date, duration, notes }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Study session added:', data);
                loadStudySessions(); // Reload the list of study sessions
                studyForm.reset(); // Clear the form fields
                switchToAddMode(); // Reset to add mode after adding
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            updateStudySession(event); // If in edit mode, call update function
        }
    } else {
        alert('Please fill in all required fields.');
    }
}


// Function to switch to "Add" mode
function switchToAddMode() {
    isEditMode = false;
    editId = null;
    document.querySelector('button[type="submit"]').textContent = 'Add Study Session';
    studyForm.reset(); // Clear form fields
}

// Function to switch to "Edit" mode
function switchToEditMode() {
    isEditMode = true;
    document.querySelector('button[type="submit"]').textContent = 'Update Study Session';
}



// Function to load study sessions from the backend
function loadStudySessions() {
    const sort = document.getElementById('sort').value;
    const group = document.getElementById('group').value;

    const params = new URLSearchParams();
    params.append('sort', sort);
    params.append('group', group);

    fetch('http://localhost:3001/api/study-sessions?' + params.toString())
        .then(response => response.json())
        .then(data => {
            const studyList = document.getElementById('studyList');
            studyList.innerHTML = ''; // Clear the list before updating
            data.forEach(session => {
                const studyItem = document.createElement('div');
                studyItem.className = 'study-item';
                studyItem.innerHTML = `
                    <h3>${session.subject}</h3>
                    <p>Date: ${session.date}</p>
                    <p>Duration: ${session.duration} minutes</p>
                    <p>Notes: ${session.notes}</p>
                    <button onclick="editStudySession(${session.id})">Edit</button>
                    <button onclick="deleteStudySession(${session.id})">Delete</button>`;
                studyList.appendChild(studyItem);
            });
        })
        .catch(error => console.error('Error fetching study sessions:', error));
}



// Function to edit a study session
function editStudySession(id) {
    // Retrieve the current session details
    fetch(`http://localhost:3001/api/study-sessions/${id}`)
        .then(response => response.json())
        .then(data => {
            // Populate the form with the existing data
            document.getElementById('subject').value = data.subject;
            document.getElementById('date').value = data.date;
            document.getElementById('duration').value = data.duration;
            document.getElementById('notes').value = data.notes;

            // Set the form to update mode
            isEditMode = true;
            editId = id;
            switchToEditMode(); // Switch to edit mode
        })
        .catch(error => {
            console.error('Error fetching study session:', error);
        });
}



// Function to update an existing study session
function updateStudySession(event) {
    event.preventDefault();

    const subject = document.getElementById('subject').value;
    const date = document.getElementById('date').value;
    const duration = document.getElementById('duration').value;
    const notes = document.getElementById('notes').value;

    if (isEditMode && editId !== null) {
        // Send a PUT request to update the study session
        fetch(`http://localhost:3001/api/study-sessions/${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject, date, duration, notes }),
        })
        .then(() => {
            console.log('Study session updated');
            loadStudySessions(); // Reload the list of study sessions
            switchToAddMode(); // Switch back to "Add" mode
        })
        .catch(error => {
            console.error('Error updating study session:', error);
        });
    }
}




// Function to delete a study session
function deleteStudySession(id) {
    if (confirm('Are you sure you want to delete this study session?')) {
        fetch(`http://localhost:3001/api/study-sessions/${id}`, { method: 'DELETE' })
            .then(() => {
                console.log('Study session deleted');
                loadStudySessions(); // Reload the list after deletion
            })
            .catch(error => console.error('Error deleting study session:', error));
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadStudySessions(); // Load study sessions when the page loads
    document.getElementById('studyForm').onsubmit = addStudySession;
    document.getElementById('sort').onchange = loadStudySessions;
    document.getElementById('group').onchange = loadStudySessions;
});
