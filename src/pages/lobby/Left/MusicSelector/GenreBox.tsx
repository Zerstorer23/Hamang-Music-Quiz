import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {Fragment, useContext, useEffect, useState} from "react";
import {
    MusicManager,
} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import classes from "./GenreBox.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import CSVLoader from "pages/lobby/Left/MusicSelector/CSVLoader";

export default function GenreBox() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const [useCustom, setUseCustom] = useState(false);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const [checked, setChecked] = useState(MusicManager.CurrentLibrary.headers);

    function onChange(team: string) {
        if (!amHost) return;
        setChecked((prevState) => {
            const newMap = new Map<string, boolean>();
            prevState.forEach((value, key) => {
                newMap.set(key, value);
            });
            newMap.set(team, !newMap.get(team));
            return newMap;
        });
    }

    useEffect(() => {
        MusicManager.selectLibrary(useCustom);
        setChecked(MusicManager.CurrentLibrary.headers);
        const setName = useCustom ? "커스텀" : "프리셋";
        sendAnnounce(`${setName} 목록이 설정됨. 수록곡 ${MusicManager.MusicList.length}개`);
    }, [useCustom]);


    function onPushSetting(e: any) {
        if (!amHost) return;
        const numberFound = MusicManager.pushHeader(checked);
        if (numberFound <= 0) {
            sendAnnounce("최소 한 장르는 선택해 주세요.");
            return;
        }
        let announce = MusicManager.CurrentLibrary.printHeaders();
        sendAnnounce(`곡 설정: ${announce} (${numberFound}곡)`);
    }

    const checkElems: JSX.Element[] = [];
    checked.forEach((use, name) => {
        const elem = <Fragment key={name}>
            <input type="checkbox" id={name}
                   onChange={() => {
                       onChange(name);
                   }}
                   checked={checked.get(name)}/>
            <label htmlFor={name}> {name}</label>
            <br/>
        </Fragment>;
        checkElems.push(elem);
    });

    return <Fragment>
        <p className={classes.centerText}>┌─────곡 데이터 선택──────┐</p>
        <p className={classes.centerText}>잘 모르겠으면 프리셋!</p>
        <HorizontalLayout className={classes.header}>
            <button className={classes.halfWidth} onClick={() => {
                setUseCustom(false);
            }}>프리셋
            </button>
            <CSVLoader onUseCustom={setUseCustom}/>
        </HorizontalLayout>
        <HorizontalLayout className={classes.header}>
            <p className={`${classes.halfWidth} ${classes.centerText}`}>{`필터──>`}</p>
            <button className={classes.halfWidth} onClick={onPushSetting}>적용</button>
        </HorizontalLayout>
        <div className={classes.genreContainer}>
            {checkElems}
        </div>
    </Fragment>;
}