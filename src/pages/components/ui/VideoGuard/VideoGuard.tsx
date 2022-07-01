import classes from "pages/components/ui/VideoGuard/VideoGuard.module.css";
import YouTube, {YouTubeProps} from "react-youtube";
import React, {Fragment, useContext, useEffect, useState} from "react";
import {IProps} from "system/types/CommonTypes";
import RoomContext from "system/context/roomInfo/room-context";
import {MusicStatus} from "system/types/GameTypes";
import {currentTimeInMills, elapsedSinceInMills} from "system/Constants/GameConstants";
import {YtState} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
//https://www.youtube.com/watch?v=XIMLoLxmTDw
const BLACK_SCREEN_VID =
    //"W9nZ6u15yis";
    "XIMLoLxmTDw";
//https://youtu.be/dXRo8UoUj7s
/*
* 다른플레이어 덮어씌워서 볼륨조절때 유튜브 노출 안되게 할수 있는거 아님?
* */
type Props = IProps & {
    vid: string
}
const autoOpts: YouTubeProps["opts"] = {
    height: "200",
    width: "200",
    playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        showinfo: 0,
        mute: 0,
        loop: 1,
        origin: window.location.href,
        // origin: 'https://localhost:3000'
    },
};

function YoutubeGuardModule(p: Props) {
    const [player, setPlayer] = useState<any>(null);
    useEffect(() => {
        if (player === null) return;
        player.pauseVideo();
        const inv = setInterval(() => {
            setTimeout(() => {
                player.playVideo();
            }, 1000);
        }, 2000);
        return () => {
            clearInterval(inv);
        };
    }, [player]);


    function onStateChange(e: any) {
        const player = e.target;
        setPlayer(player);
    }

    return <YouTube videoId={p.vid} opts={autoOpts} onStateChange={onStateChange}/>;
}

type tProps = IProps & {
    count: number;
}
// <div className={classes.hudPanel}>
//     <audio controls autoPlay={true} loop={true} src={bgm}/>
// </div>
export default function VideoGuard(p: tProps) {
    const [jsx, setJSX] = useState(<div/>);
    const [n, setn] = useState<JSX.Element[]>([]);
    const [lastTime, setLastTime] = useState<number>(currentTimeInMills());
    const ctx = useContext(RoomContext);
    const musicEntry = ctx.room.game.musicEntry;
    const playerState = musicEntry.status;
    const useBlocker = ctx.room.header.settings.blocker;

    function onStateChange(e: any) {
        const player = e.target;
        const state = e.data as YtState;
        if (state === YtState.Playing && player.getPlaybackQuality() !== "tiny") {
            // console.log(player.getAvailableQualityLevels());
            player.setPlaybackQuality("tiny");
        }
    }

    useEffect(() => {
        if (!useBlocker) return;
        if (playerState === MusicStatus.Revealing) {
            setLastTime(currentTimeInMills());
        }
        if (playerState === MusicStatus.ReceivingAnswers) {
            setn([]);
            return;
        }
        if (playerState !== MusicStatus.Playing) return;

        const inv = setInterval(() => {
            if (elapsedSinceInMills(lastTime) < (4000 + 500)) {
                //console.log(elapsedSinceInMills(lastTime) - 5000);
                return;
            }
            setn((prev) => {
                    if (prev.length > 8) return [...prev];
                    return [...prev,
                        <YouTube key={Math.random()} videoId={BLACK_SCREEN_VID} opts={autoOpts}
                                 onError={() => {
                                     console.log("Error");
                                 }}
                                 loading={"lazy"}
                                 onStateChange={onStateChange}/>
                    ];
                }
            );
        }, 1000);
        return () => {
            clearTimeout(inv);
        };
    }, [playerState, useBlocker]);

    useEffect(() => {
        if (useBlocker) return;
        setJSX(<Fragment/>);
        const timer = setTimeout(() => {
            setJSX(<YoutubeGuardModule vid={BLACK_SCREEN_VID}/>);
        }, 1000);
        return () => {
            clearTimeout(timer);
        };
    }, [
        p.count, useBlocker
    ]);
    return <div className={classes.hudPanel}>
        <div className={classes.hide}>
            {useBlocker ?
                [...n]
                : jsx}
        </div>
    </div>;
}

