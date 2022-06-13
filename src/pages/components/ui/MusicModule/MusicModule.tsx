import classes from "./MusicModule.module.css";
import {Fragment, useContext, useEffect, useState} from "react";
import YouTube, {YouTubeProps} from "react-youtube";
import {IProps} from "system/types/CommonTypes";
import MusicContext, {
    cleanMusic,
    MusicContextType,
    pushCurrentMusic
} from "pages/components/ui/MusicModule/musicInfo/MusicContextProvider";
import RoomContext from "system/context/roomInfo/room-context";
import {TurnManager} from "system/GameStates/TurnManager";
import {ChatFormat, sendChat} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {useTranslation} from "react-i18next";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";

export const MAX_MUSIC_QUEUE = 16;
export const MAX_PERSONAL_QUEUE = 3;
export const MAX_MUSIC_SEC = 2 * (60) + 22;
export const USE_SMART_RANDOM = true;

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
}

type YtProps = IProps & {
    videoId: string;
    onStateChange: (e: any) => void;
};

export function YoutubeModule(props: YtProps) {
    //https://developers.google.com/youtube/iframe_api_reference#onStateChange
    const width = 720;
    const height = 360;//TODO
    const opts: YouTubeProps["opts"] = {
        //https://www.npmjs.com/package/react-youtube
        height: height,
        width: width,
        playerVars: {
            autoplay: 1,
        },
    };
    return <YouTube videoId={props.videoId} opts={opts} onStateChange={props.onStateChange}/>;
}

export default function MusicModule() {
    const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.WaitingMusic);
    const [youtubeElement, setJSX] = useState(<Fragment/>);
    const [musicTimer, setMusicTimer] = useState<any>(null);
    const musicCtx = useContext(MusicContext);
    const localCtx = useContext(LocalContext);
    const ctx = useContext(RoomContext);
    // const myId = localCtx.getVal(LocalField.Id);
    const amHost = TurnManager.amHost(ctx, localCtx);
    useEffect(() => {
        switch (playerState) {
            case PlayerState.WaitingMusic:
                setJSX(<Fragment/>);
                if (!amHost) return;
                clearTimer(musicTimer);
                const success = pollMusic(musicCtx);
                if (success) return;
                cleanMusic();
                break;
            case PlayerState.Injecting:
                setJSX(<p>로딩중</p>);
                setPlayerState((p) => PlayerState.Playing);
                break;
            case PlayerState.Playing:
                setJSX(<YoutubeModule videoId={musicCtx.current.entry.vid} onStateChange={onStateChange}/>);
                if (!amHost) return;
                sendChat(ChatFormat.announcement, "", "_playing_next" + musicCtx.list.length);//TODO
                setMusicTimer((prevTimer: any) => {
                    clearTimer(prevTimer);
                    return setTimeout(() => {
                        // console.log("Timer expired");
                        setPlayerState(PlayerState.WaitingMusic);
                    }, MAX_MUSIC_SEC * 1000);
                });
                break;
        }
    }, [playerState]);
    useEffect(() => {
        if (musicCtx.current.c < 0) return;
        setPlayerState(PlayerState.Injecting);
    }, [musicCtx.current.c]);
    useEffect(() => {
        if (!amHost) return;
        setPlayerState(PlayerState.WaitingMusic);
    }, [ctx.room.header.hostId]);



    function onStateChange(e: any) {
        if (!amHost) return;
        const state = e.data as YtState;
        switch (state) {
            case YtState.Finished:
                // setPlayerState(PlayerState.WaitingMusic);
                break;
            case YtState.Paused:
                // setPlayerState(PlayerState.WaitingMusic);
                break;
        }
    }

    return <div className={classes.container}>
        {youtubeElement}
    </div>;
}

function pollMusic(musicCtx: MusicContextType): boolean {
    const me = (USE_SMART_RANDOM) ? musicCtx.smartRandom() : musicCtx.dequeue();
    if (me === null) return false;
    pushCurrentMusic(musicCtx.current.c, me);
    return true;
}

function clearTimer(prevTimer: any) {
    if (prevTimer !== null && prevTimer !== undefined) {
        clearTimeout(prevTimer);
    }
}