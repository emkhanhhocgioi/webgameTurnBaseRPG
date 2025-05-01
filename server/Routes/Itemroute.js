const express = require('express')
const itemrouter = express.Router();
const path = require('path');

itemrouter.get('/item/:id.json', (req, res) => {
    const id = req.params.id;
    // Assuming the JSON file is stored in a directory named 'data'
    const filePath = path.join(__dirname, '../helper/metadata', `${id}.json`);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send({ error: 'File not found' });
        }
    });
});
module.exports = itemrouter;