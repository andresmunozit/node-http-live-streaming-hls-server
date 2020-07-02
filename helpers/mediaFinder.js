// This helper searchs the media in a repository. There are two alternatives S3 and local
// Any media resource must contain at least one of the following files:
// - A video file named video.ts
// - An audio file named audio.aac

const fs = require('fs');
const path = require('path');

const s3Finder = mediaPath => false; // Not implemented yet

const localFinder = mediaName => {
    let mediaContent = {};
    const mediaPath = path.join(__dirname, `../video/${mediaName}`);
    if(!fs.existsSync(mediaPath)) return false;
    const videoFilePath = path.join(mediaPath, 'video.ts')
    if(!fs.existsSync(videoFilePath)) return false;
    mediaContent.videoFilePath = videoFilePath;
    if(!fs.existsSync(path.join(mediaPath, 'audio.aac'))) return mediaContent;
};

const mediaFinder = (repository, mediaName) => {
    if(repository === 's3') return s3Finder(mediaName);
    if(repository === 'local') return localFinder(mediaName);
    throw 'Only local and s3 are accepted repositories';
};

module.exports = mediaFinder;