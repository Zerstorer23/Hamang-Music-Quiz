import classes from "pages/components/ui/VideoGuard/VideoGuard.module.css";
import YouTube, {YouTubeProps} from "react-youtube";
import {YtState} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import {Fragment, useEffect, useState} from "react";
import {IProps} from "system/types/CommonTypes";

//https://www.youtube.com/watch?v=XIMLoLxmTDw
const BLACK_SCREEN_VID =
    "XIMLoLxmTDw";
//"XIMLoLxmTDw";
//https://youtu.be/dXRo8UoUj7s
/*
* 다른플레이어 덮어씌워서 볼륨조절때 유튜브 노출 안되게 할수 있는거 아님?
* */
type Props = IProps & {
    vid: string
}

function YoutubeGuardModule(p: Props) {
    const [player, setPlayer] = useState<any>(null);
    useEffect(() => {
        if (player === null) return;
        player.pauseVideo();
        const inv = setInterval(() => {
            setTimeout(() => {
                player.playVideo();
                // console.log("Changed");
            }, 1000);
        }, 2000);
        return () => {
            clearInterval(inv);
        };
    }, [player]);
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
        setPlayer(player);
        const state = e.data as YtState;
        if (
            // state !== YtState.Playing
            state === YtState.Paused || state === YtState.Finished
            // || state === YtState.Playing
            // || state === YtState.NotStarted
        ) {
            /*       // if (player.getCurrentTime() > 5) return;
                   setTimeout(() => {
                       player.seekTo(10, true);
                       // player.pauseVideo();
                       player.playVideo();
                       console.log("Retrigger");
                   }, 1000);*/
        }
    }

    return <YouTube videoId={p.vid} opts={opts} onStateChange={onStateChange}/>;
}

type tProps = IProps & {
    count: number;
}
export default function VideoGuard(p: tProps) {
    const [jsx, setJSX] = useState(<div/>);
    useEffect(() => {
        setJSX(<Fragment/>);
        const timer = setTimeout(() => {
            setJSX(<YoutubeGuardModule vid={BLACK_SCREEN_VID}/>);
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [
        p.count
    ]);
    return <div className={classes.hudPanel}>
        <div className={classes.hide}>
            {jsx}
        </div>

    </div>;
}

