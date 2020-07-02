const http = require('http');
const fs = require('fs');
const path = require('path');
const { getVideoDurationInSeconds } = require('get-video-duration');
const playListGenerator = require('./helpers/playlistGenerator');
const mediaFinder = require('./helpers/mediaFinder');

const PORT = 3000;
const VIDEO_EXT = 'ts';
const VIDEO_FILE_PATH = path.join(__dirname, `video/beach.${VIDEO_EXT}`);
const SEGMENT_SIZE = 5000000;

const size = fs.statSync(VIDEO_FILE_PATH).size;

const videoSegmentStream = (videoFilePath, sequence, segmentSize) => {
    if(!fs.existsSync(videoFilePath)) return {error: 'File not found'};
    const start = sequence * segmentSize;
    const end = start + segmentSize;

    return fs.createReadStream(videoFilePath, {start, end});
};

const server = http.createServer( async (req, res) => {

    const videoDurationInSeconds = await getVideoDurationInSeconds(VIDEO_FILE_PATH);

    const playlist = playListGenerator(size, SEGMENT_SIZE, 'ts', videoDurationInSeconds);

    if(req.url.match(/.m3u8$/)){
        const mediaName = req.url.replace('/','').split('.')[0];
        const { videoFilePath } = mediaFinder('local', mediaName);
        if (!videoFilePath) {
            const headers = {'Content-Type': 'application/json'};
            res.writeHead(404, headers);
            res.write('{"msg":"Media not found"}');
            return res.end();
        };

        const size = fs.statSync(videoFilePath).size;
        const videoDurationInSeconds = await getVideoDurationInSeconds(videoFilePath);
        const playlist = playListGenerator(size, SEGMENT_SIZE, 'ts', videoDurationInSeconds, mediaName, 'video');
        const headers = {
            'Content-Type':'text',
            'Content-Disposition':'attachment; playlist.m3u8'
        };
        res.writeHead(200, headers);
        res.write(playlist);
        res.end();

    } else if (req.url.match(`.${VIDEO_EXT}`)){
        const [ emptyStr, mediaName, stream, sequenceRequested ] = req.url.split('/');
        const { videoFilePath } = mediaFinder('local', mediaName);
        if (!videoFilePath) {
            const headers = {'Content-Type': 'application/json'};
            res.writeHead(404, headers);
            res.write('{"msg":"Video not found"}');
            return res.end();
        };

        console.log(`Video segment requested: ${req.url}`);

        const headers = {
            'Content-Type': 'application/vnd.apple.mpegurl'
        };
        
        const sequence = +sequenceRequested.replace(`.${VIDEO_EXT}`, '').replace('seq-','');
        const readStream = videoSegmentStream(videoFilePath, sequence, SEGMENT_SIZE);

        readStream.on('end', () => console.log(`Video segment sent: ${req.url.replace('/', '')}`)); // This should be done in the writestream

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