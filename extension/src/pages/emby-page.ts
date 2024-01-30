import { VideoDataSubtitleTrack } from '@project/common';
import { VideoData } from '@project/common';

declare const ApiClient: any | undefined;

document.addEventListener(
    'asbplayer-get-synced-data',
    async () => {
        const deviceID = ApiClient?._deviceId;
        const apikey = ApiClient?._userAuthInfo.AccessToken;
        const response: VideoData = { error: '', basename: '', subtitles: [] };
        await fetch("/Sessions?api_key=" + apikey + "&IsPlaying=True&DeviceId=" + deviceID).then((webResponse) => {
            return webResponse.json()
        }).then((sessions) => {
            var session = sessions[0];
            var mediaID = session.PlayState.MediaSourceId;
            var nowPlayingItem = session.NowPlayingItem;
            response.basename = nowPlayingItem.FileName;
            const subtitles: VideoDataSubtitleTrack[] = [];
            nowPlayingItem.MediaStreams.filter((stream: { IsTextSubtitleStream: any; }) => stream.IsTextSubtitleStream).forEach((sub: { Codec: string; DisplayTitle: any; Language: any; Index: number }) => {
                var url = "/Videos/"+ nowPlayingItem.Id + "/" + mediaID + "/Subtitles/" + sub.Index + "/Stream." + sub.Codec + "?api_key=" + apikey;
                subtitles.push({
                    label: sub.DisplayTitle,
                    language: sub.Language,
                    url: url,
                    extension: sub.Codec,
                });
            });
            response.subtitles = subtitles;

            document.dispatchEvent(
                new CustomEvent('asbplayer-synced-data', {
                    detail: response,
                })
            );
        });
    },
    false
);

