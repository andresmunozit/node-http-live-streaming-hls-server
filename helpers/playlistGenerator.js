const playListStart = `\
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2\n
`;

const playListEnd = `
#EXT-X-ENDLIST`;

const segmentTemplate = (sequence, fileExtension, stream) => {
    return `#EXTINF:2,\n${stream ? `/${stream}` : ''}seq-${sequence}.${fileExtension}\n`;
};

const playListGenerator = (videoFileSize, segmentSize, fileExtension, stream) => {
    const segmentsCount = parseInt(videoFileSize / segmentSize);

    let playListBody = '';
    
    for (let sequence = 0; sequence < segmentsCount; sequence++) {
        playListBody = playListBody + segmentTemplate(sequence, fileExtension);
    };

    return playListStart + playListBody + playListEnd;
};

module.exports = playListGenerator;