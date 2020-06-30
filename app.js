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
    
    if(req.url.match('playlist.m3u8')){
        const headers = {
            'Content-Type':'text',
            'Content-Disposition':'attachment; playlist.m3u8'
        };
        res.writeHead(200, headers);
        res.write(playlist);
        res.end();

    } else if (req.url.match(`.${VIDEO_EXT}`)){

        console.log(`Video segment requested: ${req.url}`);

        const headers = {
            // 'Content-Length': `${5000}`,
            // 'Content-Type': 'video/mp2t'
            'Content-Type': 'application/vnd.apple.mpegurl'
        };
        
        const sequence = req.url.replace(`.${VIDEO_EXT}`, '').replace('/seq-','');
        const readStream = videoSegmentStream(VIDEO_FILE_PATH, +sequence, SEGMENT_SIZE);

        readStream.on('end', () => console.log(`Video segment sent: ${req.url.replace('/', '')}`));

        if(readStream.error) {
            res.writeHead(500);
            return res.end();
        };

        res.writeHead(200, headers);
        readStream.pipe(res);
    } else {
        res.writeHead(404); // Default will always be 200
    };
});

server.listen( PORT, () => console.log(`HLS server listen at port: ${PORT}`));

// http://localhost:3000/playlist.m3u8