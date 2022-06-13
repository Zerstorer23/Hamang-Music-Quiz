import {IProps} from "system/types/CommonTypes";
import {Fragment, useContext, useEffect, useState} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {useHistory} from "react-router-dom";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {Navigation} from "index/App";
import {GameStatus} from "system/types/GameTypes";

export default function Sanitizer(props: IProps) {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const history = useHistory();
    const gameStatus = ctx.room.game.status;
    const myId = localCtx.getVal(LocalField.Id);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const myEntry = TurnManager.getMyInfo(ctx, localCtx);

    function checkSanity(): boolean {
        if (!amHost) return false;
        ReferenceManager.updateReference(DbFields.GAME, ctx.room.game);
        ReferenceManager.updateReference(DbFields.HEADER_hostId, myEntry.id);
        return true;
    }

    useEffect(() => {
        checkSanity();
    }, [ctx.room.playerMap.size, amHost]);

    const [valid, setValid] = useState(false);
    useEffect(() => {
        if (myId === null) {
            setValid(false);
            history.replace(Navigation.Loading);
            return;
        }
        if (!ctx.room.playerMap.has(myId)) {
            setValid(false);
            localCtx.setVal(LocalField.Id, null);
            history.replace(Navigation.Loading);
            return;
        }
        setValid(true);
        switch (gameStatus){
            case GameStatus.InGame:
                history.replace(Navigation.InGame);
                break;
            case GameStatus.Over:
                history.replace(Navigation.GameFinish);
                break;
        }
    }, [gameStatus, myId]);
    return <Fragment>
        {(valid) &&
            props.children
        }
    </Fragment>;
}