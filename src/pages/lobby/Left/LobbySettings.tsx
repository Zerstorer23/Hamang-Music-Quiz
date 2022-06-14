import {useContext} from "react";

import gc from "index/global.module.css";
import classes from "./LobbySettings.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {InputManager} from "system/GameStates/InputManager";
import {DS} from "system/configs/DS";

const MAX_NAME_LENGTH = 16;
export default function LobbySettings() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const amHost = TurnManager.amHost(ctx, localCtx);

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
        let guessTime = InputManager.cleanseNumber(event, 5, ctx.room.header.settings.guessTime);
        if (guessTime === null) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_guessTime, guessTime);

    }

    function onFinishEditSongNumbers(event: any) {
        if (!amHost) return;
        let songNumber = InputManager.cleanseNumber(event, 5, ctx.room.header.settings.songsPlay);
        if (songNumber === null) return;
        ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, songNumber);
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
            {amHost &&
                <div className={classes.settingsContainer}>
                    <p>설정넣기</p>
                    <HorizontalLayout>
                        <p>재생시간:</p>
                        <textarea
                            className={`${classes.fieldTypeSmall}`}
                            onBlur={onFinishEditGuessTime}
                            defaultValue={ctx.room.header.settings.songsPlay}
                        ></textarea>
                    </HorizontalLayout>
                    <HorizontalLayout>
                        <p>음악재생 곡 수</p>
                        <textarea
                            className={`${classes.fieldTypeSmall}`}
                            onBlur={onFinishEditSongNumbers}
                            defaultValue={ctx.room.header.settings.songsPlay}
                        ></textarea>
                    </HorizontalLayout>
                </div>
            }
        </div>
    );
}
