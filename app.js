const http = require('http');
const fs = require('fs');
const path = require('path');
const playListGenerator = require('./helpers/playlistGenerator');

const PORT = 3000;
const VIDEO_EXT = 'ts';
const VIDEO_FILE_PATH = path.join(__dirname, `video/beach.${VIDEO_EXT}`);
const SEGMENT_SIZE = 10000000;

const size = fs.statSync(VIDEO_FILE_PATH).size;
const playlist = playListGenerator(size, SEGMENT_SIZE, 'ts');

const videoSegmentStream = (videoFilePath, sequence, segmentSize) => {
    if(!fs.existsSync(videoFilePath)) return {error: 'File not found'};
    const start = sequence * segmentSize;
    const end = start + segmentSize;

    return fs.createReadStream(videoFilePath, {start, end});
};

const server = http.createServer( (req, res) => {
    res.on('end', () => console.log(`Chunk sent: ${req.url}`));

    if(req.url.match('playlist.m3u8')){
        const headers = {
            'Content-Type':'text',
            'Content-Disposition':'attachment; playlist.m3u8'
        };
        res.writeHead(200, headers);
        res.write(playlist);
        res.end()

    } else if (req.url.match(`.${VIDEO_EXT}`)){

        console.log(req.url);

        const size = fs.statSync(VIDEO_FILE_PATH).size;
        const headers = {
            // 'Content-Length': `${SEGMENT_SIZE}`,
            // 'Content-Type': 'video/mp2t'
            'Content-Type': 'video/mp2t'
        };
        
        const sequence = req.url.replace(`.${VIDEO_EXT}`, '').replace('/seq-','');
        const videoSegmentStreamToSend = videoSegmentStream(VIDEO_FILE_PATH, +sequence, SEGMENT_SIZE);

        if(videoSegmentStreamToSend.error) {
            res.writeHead(500);
            return res.end();
        };

        res.writeHead(200, headers);
        videoSegmentStreamToSend.pipe(res, {end: true});
    } else {
        res.writeHead(404); // Default will always be 200
    };
});

server.listen( PORT, () => console.log(`Server listen at port: ${PORT}`));

// http://localhost:3000/playlist.m3u8