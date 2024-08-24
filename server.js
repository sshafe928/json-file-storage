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


        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        const historyItems = jsonData.map((item, index) => `
            
            <div class="history-item">
                <h2 id = "${index + 1}">${item.category}</h2>
                <div class="date">
                    <p><strong>Date:</strong></p>
                    <p>${item.date}</p>
                </div>
                <div class="quantity">
                    <p><strong>Quantity:</strong></p>
                    <p>${item.quantity}</p>
                </div>
                <div class="where">
                    <p><strong>Where:</strong></p>
                    <p>${item.where}</p>
                </div>
                <div class="notes">
                    <p><strong>Notes:</strong></p>
                    <p>${item.notes}</p>
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

        // Debug output to check jsonData
        console.log('JSON Data:', jsonData);
        
        // Ensure entryId and item.id are of the same type
        const index = jsonData.findIndex(item => String(item.id) === String(entryId));
        
        console.log('Entry ID:', entryId);
        console.log('Index:', index);

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