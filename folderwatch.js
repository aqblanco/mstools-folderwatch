#!/usr/bin/env node

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const listFile = '/var/log/mstools/finishedList.json';
const configFile = 'config/config.json';
let watchedFolders = '';

if (fs.existsSync(configFile)) {
    let rawData = fs.readFileSync(configFile);
    config = JSON.parse(rawData);
    watchedFolders = config.watchedFolders;
}

if (watchedFolders != '') {
    chokidar.watch(watchedFolders, {ignoreInitial: true, depth: 0}).on('add', (p) => {

        console.log('New file found: ' + path.resolve(p))
        
        // Retrieve current file content
        let filesObject = {};
        if (fs.existsSync(listFile)) {
            let rawData = fs.readFileSync(listFile);
            filesObject = JSON.parse(rawData);
        }  

        // Transform object into array
        let files = [];
        if (filesObject !== {}) {
            Object.keys(filesObject).forEach(k => {
                files.push(filesObject[k]);
            });
        }

        // Add new item
        files.push({ 
            name: path.resolve(p),
            timestamp: Date.now()
        });

        let data = JSON.stringify(files, null, 2);

        fs.writeFileSync(listFile, data);
    });
} else {
    console.log("No folders to watch. Please check your configuration file.");
}
