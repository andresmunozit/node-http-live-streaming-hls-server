const fs = require('fs');

const playListStart = `\
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2\n
`;

const playListEnd = `
#EXT-X-ENDLIST`;

const segmentTemplate = (sequence, fileExtension, segmentDuration, mediaName, stream) => {
    return `#EXTINF:${segmentDuration},\n${mediaName}/${stream ? `${stream}/` : ''}seq-${sequence}.${fileExtension}\n`;
};

const playListGenerator = (videoFileSize, segmentSize, fileExtension, videoDurationInSeconds, mediaName, stream) => {
    const segmentDuration = (videoDurationInSeconds * (+segmentSize / +videoFileSize)).toFixed(1);
    const segmentsCount = parseInt(videoFileSize / segmentSize);
    let playListBody = '';
    for (let sequence = 0; sequence < segmentsCount; sequence++) {
        playListBody = playListBody + segmentTemplate(sequence, fileExtension, segmentDuration, mediaName, stream);
    };
    return playListStart + playListBody + playListEnd;
};

module.exports = playListGenerator;