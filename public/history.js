document.addEventListener('DOMContentLoaded', () => {
    fetch('/view-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.querySelector('.history-list').innerHTML = html;

            // Add event listeners for delete buttons
document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', (event) => {
        // Show a confirmation dialog
        const confirmDelete = confirm('Are you sure you want to delete this entry?');
        
        if (confirmDelete) {
            const entryId = event.target.getAttribute('data-id');
            
            // Send delete request to the server
            fetch(`/delete-entry/${entryId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Remove the entry from the DOM
                    event.target.closest('.history-item').remove();
                } else {
                    alert('Failed to delete entry');
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }
    });
});
})
.catch(error => {
    console.error('There was a problem with the fetch operation:', error);
});
});