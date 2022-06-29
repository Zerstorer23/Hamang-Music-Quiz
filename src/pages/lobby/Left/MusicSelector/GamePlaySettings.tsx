import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import classes from "pages/lobby/Left/LobbySettings.module.css";
import gc from "index/global.module.css";
import {InputManager} from "system/GameStates/InputManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Fragment, useContext, useEffect, useRef} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import Dropdown from "pages/components/ui/Dropdown";
import {PlayAt, PlaySpeed} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import {ItemPair} from "system/types/CommonTypes";

export default function GamePlaySettings() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const songNumRef = useRef<HTMLTextAreaElement>(null);
    const guessRef = useRef<HTMLTextAreaElement>(null);


    const amHost = TurnManager.amHost(ctx, localCtx);
    const numSongs = ctx.room.header.settings.songsPlay;
    const currLen = MusicManager.MusicList.length;
    useEffect(() => {
        if (numSongs > currLen) {
            songNumRef.current!.value = currLen + "";
            ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, currLen);
        }
    }, [currLen]);

    useEffect(() => {
        songNumRef.current!.value = numSongs + "";
    }, [numSongs]);


    function onToggleSafeChat() {
        const toggle = !ctx.room.header.settings.limitedCommunication;
        ReferenceManager.updateReference(DbFields.HEADER_settings_limitedCommunication, toggle);
        if (toggle) {
            sendAnnounce(`채팅제한 켜짐. 채팅은 3글자만. 닉네임은 ㅇㅇ만 표기.`);
        } else {
            sendAnnounce("채팅제한 꺼짐");
        }
    }

    function onFinishEditGuessTime(event: any) {
        if (!amHost) return;
        let guessTime = InputManager.cleanseTime(event, 8, 20);
        if (guessTime === null) return;
        guessRef.current!.value = guessTime + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_guessTime, guessTime);
        sendAnnounce(`답안제출시간: ${guessTime}`);
    }

    function onFinishEditSongNumbers(event: any) {
        if (!amHost) return;
        let songNumber = InputManager.cleanseSongs(event);
        songNumRef.current!.value = songNumber + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumber);
        sendAnnounce(`플레이 곡 수: ${songNumber}`);
    }

    function onSelectPlayAt(value: PlayAt) {
        if (!amHost) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_playAt, +value);
        sendAnnounce(`재생모드: ${getPlayAtName(+value)}`);
    }

    function onSelectPlaySpeed(value: PlaySpeed) {
        if (!amHost) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_speed, +value);
        sendAnnounce(`재생속도: ${getPlaySpeedName(+value)}`);
    }


    return <Fragment>
        <input type="checkbox" id={"safeChat"}
               onChange={onToggleSafeChat}
               checked={ctx.room.header.settings.limitedCommunication}/>
        <label htmlFor={"safeChat"}>채팅제한</label>
        <HorizontalLayout>
            <p>재생시간:</p>
            <textarea
                ref={guessRef}
                className={`${classes.fieldTypeSmall}`}
                onBlur={onFinishEditGuessTime}
                defaultValue={ctx.room.header.settings.guessTime}
            />
        </HorizontalLayout>
        <HorizontalLayout>
            <p>음악재생 곡 수</p>
            <textarea
                className={`${classes.fieldTypeSmall}`}
                ref={songNumRef}
                onBlur={onFinishEditSongNumbers}
                defaultValue={numSongs}
            />
        </HorizontalLayout>
        <HorizontalLayout>
            <p className={classes.reloadButton}>재생위치</p>
            <Dropdown className={`${classes.fieldTypeSmall} ${gc.centerText}`}
                      value={ctx.room.header.settings.playAt.toString()}
                      options={playAtPairs} onChange={(e: any) => {
                onSelectPlayAt(e.target.value as PlayAt);
            }}/>
        </HorizontalLayout>
        <HorizontalLayout className={gc.borderBottom}>
            <p className={classes.reloadButton}>재생속도</p>
            <Dropdown className={`${classes.fieldTypeSmall} ${gc.centerText}`}
                      value={ctx.room.header.settings.speed.toString()}
                      options={playSpeedPairs} onChange={(e: any) => {
                onSelectPlaySpeed(e.target.value as PlaySpeed);
            }}/>
        </HorizontalLayout>
    </Fragment>;
}

export function getPlayAtName(playAt: PlayAt): string {
    switch (playAt.toString()) {
        case PlayAt.Start.toString():
            return "전주";
        case PlayAt.Random.toString():
            return "무작위";
        case PlayAt.End.toString():
            return "끝";
    }
    return "?";
}

export function getPlaySpeedName(speed: PlaySpeed) {
    switch (speed.toString()) {
        case PlaySpeed.Slowest.toString():
            return `x${speed.toFixed(2)}`;
        default:
            return `x${speed.toFixed(1)}`;
    }
}

const playSpeedPairs: ItemPair[] = [PlaySpeed.Slowest,
    PlaySpeed.Slow,
    PlaySpeed.Normal,
    PlaySpeed.Fast,
    PlaySpeed.Fastest
].map((value) => {
    return {
        label: getPlaySpeedName(value),
        value: value.toString()
    };
});
const playAtPairs: ItemPair[] = [
    PlayAt.Start,
    PlayAt.Random,
    PlayAt.End,
].map((value, index, array) => {
    return {
        label: getPlayAtName(value),
        value: value.toString(),
    };
});
