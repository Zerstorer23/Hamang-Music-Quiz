/* eslint-disable react-hooks/exhaustive-deps */
import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import classes from "pages/lobby/Left/LobbySettings.module.css";
import gc from "index/global.module.css";
import {InputManager} from "system/GameStates/InputManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {Fragment, useContext, useEffect, useRef} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import Dropdown from "pages/components/ui/Dropdown";
import {PlayAt, PlaySpeed} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";
import {ItemPair} from "system/types/CommonTypes";
import {presetToName} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/Presets";
import {sendAnnounce} from "pages/components/ui/ChatModule/system/ChatContextProvider";

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
    }

    function onUseArtists() {
        const toggle = !ctx.room.header.settings.useArtists;
        ReferenceManager.updateReference(DbFields.HEADER_settings_useArtists, toggle);
        const targetNumber = MusicManager.pushArtists(toggle);
        sendAnnounce(`${presetToName(localCtx.getVal(LocalField.SelectedPreset))}${toggle ? "+가수" : ""} 목록이 설정됨. 수록곡 ${targetNumber}개`);
        if (toggle) sendAnnounce("\"곡제목-가수1,가수2..\" 형식으로 답을 입력하세요");
    }

    /*    function onAssistMode() {
            const toggle = !ctx.room.header.settings.assistMode;
            ReferenceManager.updateReference(DbFields.HEADER_settings_assistMode, toggle);
        }*/

    function onFinishEditGuessTime(event: any) {
        if (!amHost) return;
        let guessTime = InputManager.cleanseTime(event, 8, 20);
        if (guessTime === null) return;
        guessRef.current!.value = guessTime + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_guessTime, guessTime);
    }

    function onFinishEditSongNumbers(event: any) {
        if (!amHost) return;
        let songNumber = InputManager.cleanseSongs(event);
        songNumRef.current!.value = songNumber + "";
        ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumber);
    }

    function onSelectPlayAt(value: PlayAt) {
        if (!amHost) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_playAt, +value);
    }

    function onSelectPlaySpeed(value: PlaySpeed) {
        if (!amHost) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_speed, +value);
    }


    return <Fragment>
        <input type="checkbox" id={"safeChat"}
               onChange={onToggleSafeChat}
               checked={ctx.room.header.settings.limitedCommunication}/>
        <label htmlFor={"safeChat"}>채팅제한</label>
        <br/>
        <input type="checkbox" id={"useArtists"}
               onChange={onUseArtists}
               checked={ctx.room.header.settings.useArtists}/>
        <label htmlFor={"useArtists"}>가수 맞추기</label>
        <br/>
        {/*     <input type="checkbox" id={"assistMode"}
               onChange={onAssistMode}
               checked={ctx.room.header.settings.assistMode}/>
        <label htmlFor={"assistMode"}>정답미리확인</label>*/}
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
        case PlayAt.StartLimited.toString():
            return "전주 5초만";
        case PlayAt.Start.toString():
            return "전주";
        case PlayAt.Random.toString():
            return "무작위";
        case PlayAt.End.toString():
            return "끝";
        case PlayAt.EndLimited.toString():
            return "마지막 5초만";
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

const playSpeedPairs: ItemPair[] = [
    PlaySpeed.Slowest,
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
    PlayAt.StartLimited,
    PlayAt.Start,
    PlayAt.Random,
    PlayAt.End,
    PlayAt.EndLimited,
].map((value) => {
    return {
        label: getPlayAtName(value),
        value: value.toString(),
    };
});
