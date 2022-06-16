import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {Fragment, useContext, useEffect, useState} from "react";
import {
    MusicManager, PresetName, presetToName,
} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import classes from "./GenreBox.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import CSVLoader from "pages/lobby/Left/MusicSelector/CSVLoader";
import {GameConfigs} from "system/configs/GameConfigs";
import Dropdown from "pages/components/ui/Dropdown";
import gc from "index/global.module.css";
import {ItemPair} from "system/types/CommonTypes";

const presetPairs: ItemPair[] = MusicManager.presetsList.map((value) => {
    return {
        label: presetToName(value),
        value,
    };
});
export default function GenreBox() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const [presetName, setPresetName] = useState(GameConfigs.defaultPreset);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const [checked, setChecked] = useState(new Map<string, boolean>);


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
        MusicManager.selectLibrary(presetName);
        setChecked(MusicManager.CurrentLibrary.headers);
        const setName = presetToName(presetName);
        sendAnnounce(`${setName} 목록이 설정됨. 수록곡 ${MusicManager.MusicList.length}개`);
    }, [presetName]);


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

    function onSelectPreset(e: any) {
        const name = e.target.value as PresetName;
        setPresetName(name);
    }

    function onClickReload() {
        MusicManager.loadPreset(presetName);
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
        <div className={`${classes.presetSelector} ${gc.borderBottom}`}>
            <p className={`${classes.centerText}`}>프리셋에서 선택</p>
            <HorizontalLayout>
                <Dropdown className={`${classes.dropdownPanel} ${classes.centerText}`} value={presetName}
                          options={presetPairs} onChange={onSelectPreset}/>
                <button className={classes.reloadButton} onClick={onClickReload}>다시로드</button>
            </HorizontalLayout>
            <HorizontalLayout>
                <p className={`${classes.halfWidth} ${classes.centerText}`}>혹은 직접업로드</p>
                <CSVLoader className={`${classes.halfWidth}`} onUseCustom={setPresetName}/>
            </HorizontalLayout>
        </div>
        <HorizontalLayout className={classes.header}>
            <p className={`${classes.halfWidth} ${classes.centerText}`}>{`┌──필터──>`}</p>
            <button className={classes.halfWidth} onClick={onPushSetting}>적용</button>
        </HorizontalLayout>
        <div>
            {checkElems}
        </div>

    </Fragment>;
}