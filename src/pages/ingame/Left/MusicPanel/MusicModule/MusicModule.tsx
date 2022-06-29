import classes from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule.module.css";
import {Fragment, useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {TurnManager} from "system/GameStates/TurnManager";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicEntry, MusicStatus} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import TransitionManager from "system/GameStates/TransitionManager";
import {YoutubeModule} from "pages/ingame/Left/MusicPanel/MusicModule/YoutubeModule";
import {setMyTimer} from "pages/components/ui/MyTimer/MyTimer";
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";

export const HEURISTIC_INIT_TIME = 3;
export const REVEAL_TIME = 5;
export const RECEIVE_ANSWER_TIME = 1;

export enum PlayAt {
    Start,
    Random,
    End
}

// const rates = e.target.getAvailablePlaybackRates();
// console.log("Rates ", rates);
// e.target.setPlaybackRate(3);
//TODO
//0.25 0.5 0.75 1 1.25 1.5 1.75 2
export enum PlaySpeed {
    Slowest = 0.25,
    Slow = 0.5,
    Normal = 1,
    Fast = 1.5,
    Fastest = 2,
}

export enum YtState {
    NotStarted = -1,
    Finished = 0,
    Playing = 1,
    Paused = 2,
    Buffering = 3,
    VideoSignaal = 5,
}

export default function MusicModule() {
    const localCtx = useContext(LocalContext);
    const ctx = useContext(RoomContext);
    const musicEntry = ctx.room.game.musicEntry;
    const playerState = musicEntry.status;
    // const [playerState, setPlayerState] = useState<MusicStatus>(ctx.room.game.music.status);
    const [youtubeElement, setJSX] = useState(<Fragment/>);
    const [musicTimer, setMusicTimer] = useState<any>(null);

    // const myId = localCtx.getVal(LocalField.Id);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const guessTime = ctx.room.header.settings.guessTime;
    useEffect(() => {
        switch (playerState) {
            case MusicStatus.WaitingMusic:
                setJSX(<p>로딩중</p>);
                if (!amHost) return;
                clearTimer(musicTimer);
                const success = pollMusic(ctx);
                if (success) return;
                TransitionManager.pushEndGame();
                break;
            case MusicStatus.Playing:
                setJSX(<YoutubeModule videoId={ctx.room.game.musicEntry.music.videoId} onStateChange={onStateChange}/>);
                setMyTimer(localCtx, guessTime);
                if (!amHost) return;
                doTimer(setMusicTimer, guessTime, () => {
                    TransitionManager.pushMusicState(MusicStatus.ReceivingAnswers);
                });
                break;
            case MusicStatus.ReceivingAnswers:
                if (!amHost) return;
                doTimer(setMusicTimer, RECEIVE_ANSWER_TIME, () => {
                    TransitionManager.pushMusicState(MusicStatus.Revealing);
                });
                break;
            case MusicStatus.Revealing:
                if (!amHost) return;
                doTimer(setMusicTimer, REVEAL_TIME, () => {
                    TransitionManager.pushMusicState(MusicStatus.WaitingMusic);
                });
                break;
        }
    }, [playerState]);

    function onStateChange(e: any) {
        const player = e.target;
        const state = e.data as YtState;
        if (state === YtState.Playing) {
            adjustPlayTime(player, e, guessTime, musicEntry.seed);
        }
    }

    const blockCss = `${classes.youtubeBlock} ${(playerState === MusicStatus.Revealing) ? classes.show : classes.hide}`;
    return <div className={classes.container}>
        <div className={blockCss}>
            {youtubeElement}
        </div>
    </div>;
}

function pollMusic(ctx: RoomContextType): boolean {
    // console.log(`remianing ${TurnManager.getRemainingSongs(ctx)}, counter ${ctx.room.game.musicEntry.counter}, total ${ctx.room.header.settings.songsPlay}`);
    if (TurnManager.getRemainingSongs(ctx) - 1 < 0) return false;
    const counter = ctx.room.game.musicEntry.counter;
    const me: MusicEntry | null = MusicManager.pollNext(counter + 1);
    if (me === null) return false;
    ReferenceManager.updateReference(DbFields.GAME_musicEntry, me);
    return true;
}

function doTimer(setTimer: any, durationInSec: number, onExpire: any) {
    setTimer((prevTimer: any) => {
        clearTimer(prevTimer);
        return setTimeout(() => {
            onExpire();
        }, durationInSec * 1000);
    });
}

function clearTimer(prevTimer: any) {
    if (prevTimer !== null && prevTimer !== undefined) {
        clearTimeout(prevTimer);
    }
}

export function cleanMusic() {
    const cRef = ReferenceManager.getRef(DbFields.GAME_musicEntry);
    cRef.set(RoomManager.getDefaultMusic());
}

function adjustPlayTime(player: any, e: any, guessTime: number, seed: number) {
    if (player.getCurrentTime() >= HEURISTIC_INIT_TIME) return;
    const duration = e.target.getDuration();
    const totalPlayTime = guessTime + REVEAL_TIME;
    const acceptableEndTime = duration - totalPlayTime;//Make sure video does not finish.
    if (acceptableEndTime < HEURISTIC_INIT_TIME) return;//no need to set time.  it will reach the end no matter what.
    const randomOffset = HEURISTIC_INIT_TIME + (seed / 100) * (acceptableEndTime - HEURISTIC_INIT_TIME); // total length of available time.
    // console.log("Random ", randomOffset);
    e.target.seekTo(randomOffset, true);
    // const rates = e.target.getAvailablePlaybackRates();
    // console.log("Rates ", rates);
    e.target.setPlaybackRate(3);
    //TODO
    //0.25 0.5 0.75 1 1.25 1.5 1.75 2
}
