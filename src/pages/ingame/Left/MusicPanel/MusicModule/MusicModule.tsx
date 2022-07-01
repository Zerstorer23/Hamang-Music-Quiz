/* eslint-disable react-hooks/exhaustive-deps */
import classes from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule.module.css";
import React, {Fragment, useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {TurnManager} from "system/GameStates/TurnManager";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicEntry, MusicStatus, RoomSettings} from "system/types/GameTypes";
import {RoomManager} from "system/Database/RoomManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import TransitionManager from "system/GameStates/TransitionManager";
import {YoutubeModule} from "pages/ingame/Left/MusicPanel/MusicModule/YoutubeModule";
import {setMyTimer} from "pages/components/ui/MyTimer/MyTimer";
import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {DS} from "system/configs/DS";
import ReactDOM from "react-dom";
import VideoGuard from "pages/components/ui/VideoGuard/VideoGuard";

export const HEURISTIC_INIT_TIME = 3;
export const REVEAL_TIME = 5;
export const LIMITED_PLAYTIME = 6;
export const RECEIVE_ANSWER_TIME = 1;

export enum PlayAt {
    StartLimited,
    Start,
    Random,
    End,
    EndLimited
}

// const rates = e.target.getAvailablePlaybackRates();

// e.target.setPlaybackRate(3);
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

let latestPlayer: any = null;
let latestTimeout: any = null;

export default function MusicModule() {
    const localCtx = useContext(LocalContext);
    const ctx = useContext(RoomContext);
    const musicEntry = ctx.room.game.musicEntry;
    const playerState = musicEntry.status;
    // const [playerState, setPlayerState] = useState<MusicStatus>(ctx.room.game.music.status);
    const [youtubeElement, setJSX] = useState(<Fragment/>);
    const [musicTimer, setMusicTimer] = useState<any>(null);
    const [count, setCount] = useState(0);

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
                resumePlay(ctx.room.header.settings);
                doTimer(setMusicTimer, REVEAL_TIME, () => {
                    TransitionManager.pushMusicState(MusicStatus.WaitingMusic);
                });
                break;
        }

    }, [playerState]);
    useEffect(() => {
        const inv = setInterval(() => {
            const elems = document.querySelectorAll("iframe");
            elems.forEach((node) => {
                node.setAttribute("title", "");
            });
        }, 5000);
        return () => {
            clearInterval(inv);
        };
    }, []);

    function onStateChange(e: any) {
        latestPlayer = e.target;
        const state = e.data as YtState;
        if (state === YtState.Playing && playerState === MusicStatus.Playing) {
            const settings = ctx.room.header.settings;
            adjustPlayTime(latestPlayer, musicEntry.seed, settings);
            setCount((n) => n + 1);
            triggerLimitedPlay(settings);
        }
    }


    const blockCss = `${classes.youtubeBlock} 
    ${
        (DS.ytDebug || playerState === MusicStatus.Revealing) ? classes.show : classes.hide
    }`;
    const guard = document.getElementById("guard") as HTMLElement;
    return <div className={classes.container}>
        {ReactDOM.createPortal(<VideoGuard count={count}/>, guard)}
        <div className={blockCss}>
            {youtubeElement}
        </div>
    </div>;
}

function pollMusic(ctx: RoomContextType): boolean {
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

function adjustPlayTime(player: any, seed: number, settings: RoomSettings) {
    player.setPlaybackRate(+settings.speed);
    if (player.getCurrentTime() >= HEURISTIC_INIT_TIME) return;
    const duration = player.getDuration();
    const totalPlayTime = (settings.guessTime + REVEAL_TIME) * +settings.speed;
    const acceptableEndTime = duration - totalPlayTime;//Make sure video does not finish.
    let offset = 0;
    switch (settings.playAt) {
        case PlayAt.Start:
            return;
        case PlayAt.StartLimited:
            offset = HEURISTIC_INIT_TIME + duration * 0.05; // total length of available time.
            break;
        case PlayAt.Random:
            offset = HEURISTIC_INIT_TIME + (seed / 100) * (acceptableEndTime - HEURISTIC_INIT_TIME); // total length of available time.
            break;
        case PlayAt.End:
            offset = acceptableEndTime;
            break;
        case PlayAt.EndLimited:
            offset = Math.max(0, duration * 0.95 - LIMITED_PLAYTIME);
            break;
    }
    if (offset < HEURISTIC_INIT_TIME) return;//no need to set time.  it will reach the end no matter what.
    player.seekTo(offset, true);
    return;
}

function triggerLimitedPlay(settings: RoomSettings) {
    if (latestTimeout !== null) {
        clearTimeout(latestTimeout);
    }
    if (settings.playAt === PlayAt.EndLimited || settings.playAt === PlayAt.StartLimited) {
        latestTimeout = setTimeout(() => {
            latestPlayer.pauseVideo();
        }, LIMITED_PLAYTIME * 1000);
    }
}

function resumePlay(settings: RoomSettings) {
    if (latestTimeout !== null) {
        clearTimeout(latestTimeout);
    }
    if (latestPlayer === null) return;
    const duration = latestPlayer.getDuration();
    if (settings.playAt === PlayAt.StartLimited) {
        latestPlayer.seekTo(HEURISTIC_INIT_TIME + duration * 0.05, true);
        latestPlayer.playVideo();
    } else if (settings.playAt === PlayAt.EndLimited) {
        latestPlayer.seekTo(Math.max(0, duration * 0.95 - LIMITED_PLAYTIME), true);
        latestPlayer.playVideo();
    }

}