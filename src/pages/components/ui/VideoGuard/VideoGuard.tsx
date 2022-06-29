import classes from "pages/components/ui/VideoGuard/VideoGuard.module.css";
import YouTube, {YouTubeProps} from "react-youtube";
import {YtState} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import {useEffect, useState} from "react";
import {IProps} from "system/types/CommonTypes";
import {MusicStatus} from "system/types/GameTypes";

//https://www.youtube.com/watch?v=XIMLoLxmTDw
const BLACK_SCREEN_VID = "XIMLoLxmTDw";
//https://youtu.be/dXRo8UoUj7s
/*
* 다른플레이어 덮어씌워서 볼륨조절때 유튜브 노출 안되게 할수 있는거 아님?
* */
type Props = IProps & {
    vid: string
}

function YoutubeGuardModule(p: Props) {
    const opts: YouTubeProps["opts"] = {
        height: "200",
        width: "200",
        playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            showinfo: 0,
            mute: 0,
            loop: 1
        },
    };

    function onStateChange(e: any) {
        const player = e.target;
        const state = e.data as YtState;
        if (
            // state !== YtState.Playing
            state === YtState.Paused || state === YtState.Finished
            // || state === YtState.NotStarted
        ) {
            player.seekTo(1, true);
            player.pauseVideo();
            player.playVideo();
        }
    }

    return <YouTube videoId={p.vid} opts={opts} onStateChange={onStateChange}/>;
}

export default function VideoGuard() {
    const [status, setStatus] = useState(MusicStatus.WaitingMusic);
    const [jsx, setJSX] = useState(<div/>);
    useEffect(() => {
        switch (status) {
            case MusicStatus.WaitingMusic:
                setTimeout(() => {
                    setStatus(MusicStatus.Playing);
                }, 1000);
                break;
            case MusicStatus.Playing:
                setJSX(<YoutubeGuardModule vid={BLACK_SCREEN_VID}/>);
                break;
        }
    }, [status]);
    return <div className={classes.hudPanel}>
        <div className={classes.hide}>
            {jsx}
        </div>
    </div>;
}

