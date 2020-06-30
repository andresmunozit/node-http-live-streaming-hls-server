const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const VIDEO_EXT = 'ts';
const VIDEO_FILE_PATH = path.join(__dirname, `video/beach.${VIDEO_EXT}`);
const CHUNK_SIZE = 10000000;
const PLAYLIST = `\
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2

#EXTINF:2,
0.${VIDEO_EXT}
#EXTINF:2,
1.${VIDEO_EXT}
#EXTINF:2,
2.${VIDEO_EXT}
#EXTINF:2,
3.${VIDEO_EXT}
#EXTINF:2,
4.${VIDEO_EXT}
#EXTINF:2,
5.${VIDEO_EXT}
#EXTINF:2,
6.${VIDEO_EXT}
#EXTINF:2,
7.${VIDEO_EXT}
#EXTINF:2,
8.${VIDEO_EXT}
`;

const videoChunkStream = (videoFilePath, sequence, chunkSize) => {
    if(!fs.existsSync(videoFilePath)) return {error: 'File not found'};
    const start = sequence * chunkSize;
    const end = start + chunkSize;

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
        res.write(PLAYLIST);
        res.end()

    } else if (req.url.match(`.${VIDEO_EXT}`)){

        console.log(req.url);

        const size = fs.statSync(VIDEO_FILE_PATH).size;
        const headers = {
            // 'Content-Length': `${CHUNK_SIZE}`,
            // 'Content-Type': 'video/mp2t'
            'Content-Type': 'video/mp2t'
        };
        

        const sequence = req.url.replace(`.${VIDEO_EXT}`, '').replace('/','');
        const videoChunkStreamToSend = videoChunkStream(VIDEO_FILE_PATH, +sequence, CHUNK_SIZE);

        if(videoChunkStreamToSend.error) {
            res.writeHead(500);
            return res.end();
        };

        res.writeHead(200, headers);
        videoChunkStreamToSend.pipe(res, {end: true});
    } else {
        res.writeHead(404); // Default will always be 200
    };
});

server.listen( PORT, () => console.log(`Server listen at port: ${PORT}`));

// http://localhost:3000/playlist.m3u8