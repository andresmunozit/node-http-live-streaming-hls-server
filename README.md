# Node HLS (HTTP Live Streaming) Server
Implementation of an HLS (HTTP Live Streaming) server with pure Node.js

## Installation
```
$ git clone https://github.com/andresmunozit/node-http-live-streaming-hls-server
$ npm install
```

## Usage

To run the development environment:

```
$ npm run dev
```

Into the application directory, create the following directory tree:
```
/video
    /media_name1
        video.ts
    /media_name2
        video.ts
```

The name of the folder will determine the name of the media streaming. The video must be renamed to `video.ts`. The video must be in `.ts` format.

Into [VLC](https://www.videolan.org/) or any other media player that supports HLS, use the `.m3u8` path:
```
http://localhost:3000/media_name1.m3u8
```

![VLC](https://github.com/andresmunozit/node-http-live-streaming-hls-server/blob/master/img/vlc.png?raw=true)

Then click play and see the HLS stream reproducing.

![VLC](https://github.com/andresmunozit/node-http-live-streaming-hls-server/blob/master/img/city.png?raw=true)

If you want to download the `.m3u8` playlist, go to the browser and hit `http://localhost:3000/yourMediaName.m3u8`.

## About HLS

HLS is a media streaming protocol based on HTTP. Instead of sending a "continous" stream of video data, the client requests sequentially an specific segment of the entire media (audio or video), based in a `.m3u8` playlist.

### The playlist

There are two types of playlists, the master playlist and the media playlist.

#### The master playlist

The master playlist contains all the available nested playlists for the specified media. Those playlist can contain the same multimedia content, in different qualities, and includes other metadata, as resolution, codecs, etc., that the client will use depending on the bandwitdth available and other client specific factors. The following is an example of a master playlist:

```
#EXTM3U
#EXT-X-VERSION:5

#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="English stereo",LANGUAGE="en",AUTOSELECT=YES,URI="f08e80da-bf1d-4e3d-8899-f0f6155f6efa_audio_1_stereo_128000.m3u8"

#EXT-X-STREAM-INF:BANDWIDTH=628000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=320x180,AUDIO="audio"
f08e80da-bf1d-4e3d-8899-f0f6155f6efa_video_180_250000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=928000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=480x270,AUDIO="audio"
f08e80da-bf1d-4e3d-8899-f0f6155f6efa_video_270_400000.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1728000,CODECS="avc1.42c00d,mp4a.40.2",RESOLUTION=640x360,AUDIO="audio"
f08e80da-bf1d-4e3d-8899-f0f6155f6efa_video_360_800000.m3u8
```

#### The media playlist

Once the client has selected an stream from the master playlist, then it requests the specified `.m3u8` media playlist. The media playlist contains direct links to the actual multimedia content, divided in ordered segments, which duration in seconds is specified in the playlist. 

```
#EXTM3U

#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:4

#EXTINF:4.0
../video/180_250000/hls/segment_0.ts
#EXTINF:4.0
../video/180_250000/hls/segment_1.ts
#EXTINF:4.0
../video/180_250000/hls/segment_2.ts
#EXTINF:4.0
../video/180_250000/hls/segment_3.ts
#EXTINF:4.0
../video/180_250000/hls/segment_4.ts
#EXTINF:4.0
../video/180_250000/hls/segment_5.ts
#EXTINF:4.0
../video/180_250000/hls/segment_6.ts
#EXTINF:4.0
../video/180_250000/hls/segment_7.ts
```

#### The client

A video client that supports HLS, will sequentially download the content of each video segment specified in the media playlist.

#### ¿Why it uses .ts format video?

`.ts` video files contains flat video data. It allows to divide the entire video content in independent segments, that are reproducible, without the needing of metadata like other video formats (`.mp4` for example).

## About this implementation

This is an experimental implementation based on Node.js [http](https://nodejs.org/api/http.html), [fs](https://nodejs.org/api/fs.html) and [path](https://nodejs.org/api/path.html) APIs.

### The .m3u8 media playlist

One `.m3u8` media playlist is generated by each media content in the `video` directory. This is an example of a `.m3u8` playlist generated for an example media called `city`:

Media location:
```
./video
    /city
        /video.ts
```
Playlist:
```
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:1.8
#EXTINF:1.8,
city/video/seq-0.ts
#EXTINF:1.8,
city/video/seq-1.ts
#EXTINF:1.8,
city/video/seq-2.ts
#EXTINF:1.8,
city/video/seq-3.ts
#EXTINF:1.8,
city/video/seq-4.ts
#EXTINF:1.8,
city/video/seq-5.ts
#EXTINF:1.8,
city/video/seq-6.ts
#EXTINF:1.8,
city/video/seq-7.ts
#EXTINF:1.8,
city/video/seq-8.ts
#EXTINF:1.8,
city/video/seq-9.ts
#EXTINF:1.8,
city/video/seq-10.ts

#EXT-X-ENDLIST
```

### Internal behavior

The following diagram is provided to understand how it works. Take into account that for clarity, pseudo code is being used:

![HLS Node Server Operation](https://github.com/andresmunozit/node-http-live-streaming-hls-server/blob/master/img/hls-node-server-operation.png?raw=true)

### Internal configuration

There are three constants that can be defined in the top of the main `app.js` file:

`PORT`: The listening port fot the HTTP server

`SEGMENT_SIZE`: The size in bytes of each read stream video segment

`VIDEO_EXT`: The file extension of the video data

The video location folder is not configurable at the moment.

## Project status

This is an exploratory project no longer mantained. A new version is being developed using Express.js, and will include other features like uoload and transform video to `.ts` format and generate different qualities or use AWS S3.