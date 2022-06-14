import YouTube, {YouTubeProps} from "react-youtube";
import {IProps} from "system/types/CommonTypes";

type YtProps = IProps & {
    videoId: string;
    onStateChange: (e: any) => void;
};

export function YoutubeModule(props: YtProps) {
    //https://developers.google.com/youtube/iframe_api_reference#onStateChange
    const width = window.screen.availWidth * 0.4;
    const height = window.screen.availHeight * 0.4;
    const opts: YouTubeProps["opts"] = {
        //https://www.npmjs.com/package/react-youtube
        height: height,
        width: width,
        playerVars: {
            autoplay: 1,
            controls: 0,
        },
    };

    function onError(e: any) {
        console.warn(`Error with ${props.videoId} ${e.data}`);
    }

    return <YouTube videoId={props.videoId} opts={opts} onError={onError}
                    onStateChange={props.onStateChange}/>;
}