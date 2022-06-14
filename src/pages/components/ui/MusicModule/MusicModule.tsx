import classes from "./MusicModule.module.css";
import {Fragment, useContext, useEffect, useState} from "react";
import YouTube, {YouTubeProps} from "react-youtube";
import {IProps} from "system/types/CommonTypes";
import RoomContext from "system/context/roomInfo/room-context";
import {TurnManager} from "system/GameStates/TurnManager";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicEntry} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";
import {MusicManager} from "pages/components/ui/MusicModule/MusicManager";
import {randomInt} from "system/Constants/GameConstants";

export const MAX_MUSIC_SEC = 20;
export const USE_SMART_RANDOM = true;
export const HEURISTIC_INIT_TIME = 4;
export const REVEAL_TIME = 5;

enum YtState {
    NotStarted = -1,
    Finished = 0,
    Playing = 1,
    Paused = 2,
    Buffering = 3,
    VideoSignaal = 5,
}

enum PlayerState {
    WaitingMusic,
    Injecting,
    Playing,
    Revealing,
}

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

export default function MusicModule() {
    const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.WaitingMusic);
    const [youtubeElement, setJSX] = useState(<Fragment/>);
    const [musicTimer, setMusicTimer] = useState<any>(null);

    const localCtx = useContext(LocalContext);
    const ctx = useContext(RoomContext);
    // const myId = localCtx.getVal(LocalField.Id);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const c = ctx.room.game.music.c;


    useEffect(() => {
        switch (playerState) {
            case PlayerState.WaitingMusic:
                setJSX(<Fragment/>);
                if (!amHost) return;
                clearTimer(musicTimer);
                const success = pollMusic(ctx);
                if (success) return;
                cleanMusic();
                break;
            case PlayerState.Injecting:
                setJSX(<p>로딩중</p>);
                setPlayerState((p) => PlayerState.Playing);
                break;
            case PlayerState.Playing:
                //TODO play invis
                setJSX(<YoutubeModule videoId={ctx.room.game.music.vid} onStateChange={onStateChange}/>);
                console.log("Playing");
                setMusicTimer((prevTimer: any) => {
                    clearTimer(prevTimer);
                    return setTimeout(() => {
                        setPlayerState(PlayerState.Revealing);
                    }, MAX_MUSIC_SEC * 1000);
                });
                break;
            case PlayerState.Revealing:
                console.log("Revealing");
                if (!amHost) return;
                setMusicTimer((prevTimer: any) => {
                    return setTimeout(() => {
                        setPlayerState(PlayerState.WaitingMusic);
                    }, REVEAL_TIME * 1000);
                });
                break;
        }
    }, [playerState]);
    useEffect(() => {
        if (c < 0) return;
        setPlayerState(PlayerState.Injecting);
    }, [c]);
    useEffect(() => {
        if (!amHost) return;
        setPlayerState(PlayerState.WaitingMusic);
    }, [ctx.room.header.hostId]);
    const guessTime = ctx.room.header.settings.guessTime;

    function onStateChange(e: any) {
        if (!amHost) return;
        const player = e.target;
        const state = e.data as YtState;
        switch (state) {
            case YtState.Playing:
                if (player.getCurrentTime() < HEURISTIC_INIT_TIME) {
                    const duration = e.target.getDuration();
                    e.target.seekTo(randomInt(HEURISTIC_INIT_TIME, Math.max(HEURISTIC_INIT_TIME, duration - guessTime)), true);
                }
                break;
        }
    }

    const blockCss = `${classes.youtubeBlock} ${(playerState === PlayerState.Revealing) ? classes.show : classes.hide}`;
    return <div className={classes.container}>
        <div className={blockCss}>
            {youtubeElement}
        </div>
    </div>;
}

function pollMusic(ctx: RoomContextType): boolean {
    const me = MusicManager.testPollRandom();
    if (me === null) return false;
    pushCurrentMusic(ctx.room.game.music.c, me);
    return true;
}

function clearTimer(prevTimer: any) {
    if (prevTimer !== null && prevTimer !== undefined) {
        clearTimeout(prevTimer);
    }
}

export function pushCurrentMusic(c: number, me: MusicEntry) {
    me.c = c + 1;
    ReferenceManager.updateReference(DbFields.GAME_music, me);
}

export function cleanMusic() {
    const cRef = ReferenceManager.getRef(DbFields.GAME_music);
    cRef.set(RoomManager.getDefaultMusic());
}

