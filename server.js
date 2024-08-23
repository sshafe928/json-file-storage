const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

// Handle form submissions
app.post('/submit', (req, res) => {
    const data = req.body;
    const filePath = path.join(__dirname, 'data.json');

    // Read existing data from file
    fs.readFile(filePath, (err, fileData) => {
        let jsonData = [];

        if (!err) {
            jsonData = JSON.parse(fileData);
        }

        // Add new data to existing data
        jsonData.push(data);

        // Write updated data back to file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                res.status(500).json({ success: false });
            } else {
                res.json({ success: true });
            }
        });
    });
});


app.get('/view-data', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');

    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            res.status(500).send('Error reading data file.');
            return;
        }

        let jsonData;
        try {
            jsonData = JSON.parse(fileData);
        } catch (parseErr) {
            res.status(500).send('Error parsing data file.');
            return;
        }

        const historyItems = jsonData.map((item, index) => `
            <div class="history-item">
                <h2>Entry ${index + 1}</h2>
                <div class="message">
                    <p><strong>Message:</strong></p>
                    <p>${item.message}</p>
                </div>
                <div class="email">
                    <p><strong>Gmail Input:</strong></p>
                    <p>${item.email}</p>
                </div>
                <button class="delete-button" data-id="${item.id}">Delete</button>
            </div>
        `).join('');

        res.send(`

            <body>
                <div class="container">
                    <div class="history-list">
                        ${historyItems}
            </body>
            </html>
        `);
    });
});

app.delete('/delete-entry/:id', (req, res) => {
    const entryId = req.params.id;
    const filePath = path.join(__dirname, 'data.json');

    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return res.status(500).send('Error reading data file.');
        }

        let jsonData;
        try {
            jsonData = JSON.parse(fileData);
        } catch (parseErr) {
            return res.status(500).send('Error parsing data file.');
        }

        // Find the index of the entry to delete
        const index = jsonData.findIndex(item => item.id === entryId);
        if (index === -1) {
            return res.status(404).send('Entry not found.');
        }

        // Remove the entry
        jsonData.splice(index, 1);

        // Write updated data back to file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing data file.');
            }
            res.json({ success: true });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});