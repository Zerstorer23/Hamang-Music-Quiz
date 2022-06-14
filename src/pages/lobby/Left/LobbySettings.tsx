import {Fragment, useContext, useRef} from "react";

import gc from "index/global.module.css";
import classes from "./LobbySettings.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {PlayerDbFields, ReferenceManager} from "system/Database/ReferenceManager";

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

    function onClickCopy(e: any) {
        const myUrl = window.location.href;
        navigator.clipboard.writeText(myUrl);
    }

    return (
        <div className={`${classes.container} ${gc.round_border} ${gc.borderColor}`}>
            <div className={`${classes.settingsContainer} ${gc.borderBottom}`}>
                <p className={classes.nameHeader}>이름</p>
                <textarea
                    className={`${classes.fieldType} ${classes.nameTextArea} ${myEntry.player.isReady && classes.isDisabled}`}
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
                <div className={classes.creditsContainer}>
                    <p>설정넣기</p>
                </div>
            }
        </div>
    );
}
