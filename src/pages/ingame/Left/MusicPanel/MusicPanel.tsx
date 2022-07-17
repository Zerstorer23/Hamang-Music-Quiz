import MusicModule, {clearTimer, doTimer} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import {MyTimer} from "pages/components/ui/MyTimer/MyTimer";
import gc from "index/global.module.css";

import classes from "./MusicPanel.module.css";
import React, {useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {MusicEntry, MusicStatus} from "system/types/GameTypes";
import {TurnManager} from "system/GameStates/TurnManager";
import {randomInt} from "system/Constants/GameConstants";

const HINT_TIME_SEC = 4;
const HINT_CHANCE_PERCENTILE = 20;
export default function MusicPanel() {
    const ctx = useContext(RoomContext);
    const isPlaying = ctx.room.game.musicEntry.status === MusicStatus.Playing;
    const isTakingAnswers = ctx.room.game.musicEntry.status === MusicStatus.ReceivingAnswers;
    const remainingSongs = TurnManager.getRemainingSongs(ctx);

    const [hintText, setHint] = useState("");
    const [musicTimer, setMusicTimer] = useState<any>(null);
    // const myId = localCtx.getVal(LocalField.Id);
    const musicEntry = ctx.room.game.musicEntry;
    const playerState = musicEntry.status;
    const hintTime = ctx.room.header.settings.guessTime - HINT_TIME_SEC;
    useEffect(() => {
        switch (playerState) {
            case MusicStatus.Playing:
                doTimer(setMusicTimer, hintTime, () => {
                    setHint(getHint(ctx.room.game.musicEntry));
                });
                break;
            case MusicStatus.ReceivingAnswers:
                clearTimer(musicTimer);
                setHint("");
                break;
        }

    }, [playerState]);

    return <div className={`${classes.container} ${gc.borderColor} ${gc.round_border}`}>
        {isPlaying && <p className={classes.remainingGame}>{`${remainingSongs} 곡 남음`}</p>}
        <MusicModule/>
        {isPlaying && <p className={classes.remainingTime}><MyTimer/>초 남음...</p>}
        {hintText.length > 0 && <p className={classes.hintText}>{`힌트: ${hintText}`}</p>}
        {isTakingAnswers && <p className={classes.remainingTime}>곧 정답을 공?개합니다</p>}
    </div>;
}

function getHint(music: MusicEntry): string {
    const title = music.music.title;
    let name = title;
    if (title.includes("(")) {
        // name = name.replaceAll(")", "");
        const tokens = name.split("(");
        if (tokens.length >= 1) {
            name = tokens[0];
        } else {
            name = title;
        }
    }
    let hint = "";
    for (const c of name) {
        if (randomInt(0, 99) < HINT_CHANCE_PERCENTILE) {
            hint += c;
        } else {
            hint += "_ ";
        }
    }
    return hint;
}