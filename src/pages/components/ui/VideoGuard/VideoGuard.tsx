import classes from "pages/components/ui/VideoGuard/VideoGuard.module.css";
import YouTube, {YouTubeProps} from "react-youtube";
import {YtState} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";

//https://www.youtube.com/watch?v=XIMLoLxmTDw
const BLACK_SCREEN_VID = "XIMLoLxmTDw";

/*
* 다른플레이어 덮어씌워서 볼륨조절때 유튜브 노출 안되게 할수 있는거 아님?
* */
function YoutubeGuardModule() {
    const opts: YouTubeProps["opts"] = {
        //https://www.npmjs.com/package/react-youtube
        height: "10",
        width: "10",
        playerVars: {
            autoplay: 1,
        },
    };

    function onStateChange(e: any) {
        const player = e.target;
        const state = e.data as YtState;
        if (state === YtState.Paused || state === YtState.Finished) {
            player.seekTo(0, true);
            player.playVideo();
        }
    }

    return <YouTube videoId={BLACK_SCREEN_VID} opts={opts} onStateChange={onStateChange}/>;
}

export default function VideoGuard() {
    return <div className={classes.hudPanel}>
        <div className={classes.hide}>
            <YoutubeGuardModule/>
        </div>
    </div>;
}

