/* eslint-disable react-hooks/exhaustive-deps */
import {useContext, useEffect, useRef} from "react";

import gc from "index/global.module.css";
import classes from "./LobbySettings.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";
import MusicSelector from "pages/lobby/Left/MusicSelector/MusicSelector";
import GamePlaySettings from "pages/lobby/Left/MusicSelector/GamePlaySettings";
import SettingsDisplay from "pages/lobby/Left/SettingsDisplay/SettingsDisplay";
import SettingsChangeNotifier from "pages/lobby/Left/MusicSelector/SettingsChangeNotifier";
import {PlayerManager} from "system/Database/PlayerManager";

const MAX_NAME_LENGTH = 16;
export default function LobbySettings() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const nameRef = useRef<HTMLTextAreaElement>(null);

    async function onFinishEditName(event: any) {
        let newName: string = event.target.value;
        if (newName.length <= 1) return;
        if (myEntry.player.isReady) return;
        if (limitedComm) return;
        if (newName.length > MAX_NAME_LENGTH) {
            newName = newName.substring(0, MAX_NAME_LENGTH);
        }
        if (myEntry.player.name === newName) return;
        ReferenceManager.updatePlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_name, newName);
    }

    const limitedComm = ctx.room.header.settings.limitedCommunication;
    useEffect(() => {
        if (!limitedComm) return;
        if (
            myEntry.player.name.includes("ㅇㅇ (")
            && myEntry.player.name.includes(")")
            && myEntry.player.name.includes(".")
        ) return;
        const newName = PlayerManager.getDefaultName();
        ReferenceManager.updatePlayerFieldReference(myEntry.id, PlayerDbFields.PLAYER_name, newName);
        if (nameRef !== null) {
            nameRef.current!.value = newName;
        }
    }, [limitedComm]);

    function onClickCopy() {
        const myUrl = window.location.href;
        navigator.clipboard.writeText(`주소: ${myUrl} \n방번호: ${ReferenceManager.channelId}`);
    }

    //On update count song, check validity and modify min.
    //Dont push if library size 0
    const enabledCss = (myEntry.player.isReady || limitedComm) ? classes.isDisabled : "";
    return (
        <div className={`${classes.container} ${gc.round_border} ${gc.borderColor}`}>
            <div className={`${classes.commonSettingsContainer} ${gc.borderBottom}`}>
                <p className={classes.nameHeader}>이름</p>
                <textarea
                    ref={nameRef}
                    className={`${classes.fieldType} ${classes.nameTextArea} ${enabledCss}`}
                    onBlur={onFinishEditName}
                    defaultValue={myEntry.player.name}
                ></textarea>
                <button className={`${classes.fieldTypeSmall}`}
                        onClick={onClickCopy}>{`방 번호: ${ReferenceManager.channelId} 복사`}
                </button>
                <br/>
                <a rel="noopener noreferrer"
                   href={"https://docs.google.com/spreadsheets/d/1QluDRTVw7qz5rE46MpLYEFj_WntZUNa3THLvBeuvVJY/edit?usp=sharing"}
                   target={"_blank"}>수동파일설정</a>
                /
                <a rel="noopener noreferrer"
                   href={"https://docs.google.com/spreadsheets/d/1E89UuJwiR3yRKNjifMK4nArg0iO7Ish09BHkMexXqo8/edit?usp=sharing"}
                   target={"_blank"}>765시트</a>
                <br/>
                <p>모바일 유저는 데스크탑보기모드 꼭 켜주라!</p>
                <p>정답은 주로 한글 번역/발음/영문 발음/특수문자 무시</p>
                <p>/help = 방장용 명령어 도움말</p>
            </div>
            {
                amHost && <div className={`${classes.hostSettingsContainer} `}>
                    <GamePlaySettings/>
                    <MusicSelector/>
                </div>
            }
            {
                !amHost && <SettingsDisplay className={classes.hostSettingsContainer}/>
            }
            <SettingsChangeNotifier/>
        </div>
    );
}
