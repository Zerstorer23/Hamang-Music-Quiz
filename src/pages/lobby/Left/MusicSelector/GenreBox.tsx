import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {Fragment, useContext, useEffect, useState} from "react";
import {
    MusicManager,
    MusicTeam,
    TeamList,
    TeamNameToIndex
} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import classes from "./GenreBox.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import ChatContext, {ChatFormat} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import CSVLoader from "pages/lobby/Left/MusicSelector/CSVLoader";

export default function GenreBox() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const chatCtx = useContext(ChatContext);
    const [useCustom, setUseCustom] = useState(false);//TODO lift custom state
    const amHost = TurnManager.amHost(ctx, localCtx);
    const [checked, setChecked] = useState(ctx.room.header.settings.included);

    function onChange(team: MusicTeam) {
        if (!amHost) return;
        setChecked((prevState) => {
            const newState = [...prevState];
            newState[TeamNameToIndex(team)] = !prevState[TeamNameToIndex(team)];
            return newState;
        });
    }

    useEffect(() => {
        //TODO
        console.log("Use custom? " + useCustom);
    }, [useCustom]);

    function onPushSetting(e: any) {
        if (!amHost) return;
        let numberFound = MusicManager.buildRandomList(checked, useCustom);
        if (numberFound <= 0) {
            chatCtx.announce("최소 한 장르는 선택해 주세요.");
            return;
        }
        ReferenceManager.updateReference(DbFields.HEADER_settings_included, checked);
        let announce = "";
        checked.forEach((value, index, array) => {
            if (value) {
                announce += TeamList[index].toString() + ",";
            }
        });
        chatCtx.announce(`곡 설정: ${announce} (${numberFound}곡)`);
    }


    return <Fragment>
        <p className={classes.centerText}>┌─────곡 데이터 선택──────┐</p>
        <p className={classes.centerText}>잘 모르겠으면 프리셋!</p>
        <HorizontalLayout className={classes.header}>
            <button className={classes.halfWidth} onClick={() => {
                setUseCustom(false);
            }}>프리셋
            </button>
            <CSVLoader/>
            {/*      <button className={classes.halfButton} onClick={() => {
                setUseCustom(true);
            }}>커스텀
            </button>*/}
        </HorizontalLayout>
        <HorizontalLayout className={classes.header}>
            <p className={`${classes.halfWidth} ${classes.centerText}`}>{`필터──>`}</p>
            <button className={classes.halfWidth} onClick={onPushSetting}>적용</button>
        </HorizontalLayout>
        <div className={classes.genreContainer}>
            {
                TeamList.map((value, index, array) => {
                    return <Fragment key={value}>
                        <input type="checkbox" id={value} onChange={() => {
                            onChange(value);
                        }}
                               checked={checked[TeamNameToIndex(value)]}/>
                        <label htmlFor={value}> {value.toString()}</label>
                        <br/>
                    </Fragment>;
                })
            }
        </div>
    </Fragment>;
}