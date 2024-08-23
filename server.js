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
            </div>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>History Page</title>
                <link rel="stylesheet" href="styles.css">
            </head>
            <body>
                <div class="container">
                    <h1>Data History</h1>
                    <div class="history-list">
                        ${historyItems}
                    </div>
                    <a href="/" class="back-link">Go Back to Home</a>
                </div>
            </body>
            </html>
        `);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});