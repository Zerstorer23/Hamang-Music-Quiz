import {useContext, useEffect, useRef} from "react";

import gc from "index/global.module.css";
import classes from "./LobbySettings.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {InputManager} from "system/GameStates/InputManager";
import {DS} from "system/configs/DS";
import VerticalLayout from "pages/components/ui/VerticalLayout";
import GenreBox from "pages/lobby/Left/GenreBox/GenreBox";
import {RoomManager} from "system/Database/RoomManager";
import ChatContext from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";

const MAX_NAME_LENGTH = 16;
export default function LobbySettings() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const chatCtx = useContext(ChatContext);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const numSongs = ctx.room.header.settings.songsPlay;

    async function onFinishEditName(event: any) {
        let newName: string = event.target.value;
        if (newName.length <= 1) return;
        if (myEntry.player.isReady) return;
        if (newName.length > MAX_NAME_LENGTH) {
            newName = newName.substring(0, MAX_NAME_LENGTH);
        }
        const myNameRef = ReferenceManager.getPlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_name);
        myNameRef.set(newName);
        // setFishName(newName); //TODO
    }

    function onFinishEditGuessTime(event: any) {
        if (!amHost) return;
        let guessTime = InputManager.cleanseTime(event, 5, 20);
        if (guessTime === null) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_guessTime, guessTime);
        chatCtx.announce(`답안제출시간: ${guessTime}`);

    }

    function onFinishEditSongNumbers(event: any) {
        if (!amHost) return;
        let songNumber = InputManager.cleanseSongs(event);
        ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumber);
        chatCtx.announce(`플레이 곡 수: ${songNumber}`);
    }

    function onClickCopy(e: any) {
        const myUrl = window.location.href;
        navigator.clipboard.writeText(myUrl);
    }

//TODO on push Filter, build library, if host, check count song validity and update
    //On update count song, check validity and modify min.
    //Dont push if library size 0
    const enabledCss = myEntry.player.isReady ? classes.isDisabled : "";
    return (
        <div className={`${classes.container} ${gc.round_border} ${gc.borderColor}`}>
            <div className={`${classes.mySettingsContainer} ${gc.borderBottom}`}>
                <p className={classes.nameHeader}>이름</p>
                <textarea
                    className={`${classes.fieldType} ${classes.nameTextArea} ${enabledCss}`}
                    onBlur={onFinishEditName}
                    defaultValue={myEntry.player.name}
                ></textarea>
                <button className={`${classes.fieldType}`}
                        onClick={onClickCopy}>링크 복사
                </button>
                <a href={"https://chat.haruhi.boats/"} target={"_blank"}>중계기</a>
                <br/>
                <p>모바일 유저는 데스크탑보기모드 꼭 켜주라!</p>
            </div>
            {
                amHost && <div className={`${classes.settingsContainer} `}>
                    <p>설정넣기</p>
                    <HorizontalLayout>
                        <p>재생시간:</p>
                        <textarea
                            className={`${classes.fieldTypeSmall}`}
                            onBlur={onFinishEditGuessTime}
                            defaultValue={ctx.room.header.settings.guessTime}
                        ></textarea>
                    </HorizontalLayout>
                    <HorizontalLayout className={gc.borderBottom}>
                        <p>음악재생 곡 수</p>
                        <textarea
                            className={`${classes.fieldTypeSmall}`}
                            onBlur={onFinishEditSongNumbers}
                            defaultValue={numSongs}
                        ></textarea>
                    </HorizontalLayout>
                    <GenreBox/>
                </div>
            }
        </div>
    );
}
