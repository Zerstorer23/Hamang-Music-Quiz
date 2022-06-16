import HorizontalLayout from "pages/components/ui/HorizontalLayout";
import {Fragment, useContext, useEffect, useState} from "react";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import classes from "pages/lobby/Left/MusicSelector/MusicSelector.module.css";
import RoomContext from "system/context/roomInfo/room-context";
import {LocalContext} from "system/context/localInfo/LocalContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {sendAnnounce} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import CSVLoader from "pages/lobby/Left/MusicSelector/CSVLoader";
import {GameConfigs} from "system/configs/GameConfigs";
import Dropdown from "pages/components/ui/Dropdown";
import gc from "index/global.module.css";
import {PresetName, presetPairs, presetToName} from "pages/ingame/Left/MusicPanel/MusicModule/Presets";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import useIncrementalState from "system/hooks/useIncrementalState";


function tryPreset(dropdownPreset: PresetName, setLoadedPreset: any) {
    const isLoaded = MusicManager.selectLibrary(dropdownPreset);
    if (isLoaded) {
        setLoadedPreset(dropdownPreset);
        return;
    }
    MusicManager.loadPreset(dropdownPreset).then((success) => {
        if (!success) return;
        MusicManager.selectLibrary(dropdownPreset);
        setLoadedPreset(dropdownPreset);
    });
}

function notifyLoaded(setChecked: any, loadedPreset: PresetName) {
    const numSongs = MusicManager.MusicList.length;
    setChecked(MusicManager.CurrentLibrary.headers);
    sendAnnounce(`${presetToName(loadedPreset)} 목록이 설정됨. 수록곡 ${numSongs}개`);
    const min = Math.min(numSongs, GameConfigs.defaultSongNumber);
    ReferenceManager.updateReference(DbFields.HEADER_settings_songsPlay, min);
}

function onPushSetting(amHost: boolean, checked: Map<string, boolean>) {
    if (!amHost) return;
    const numberFound = MusicManager.pushHeader(checked);
    if (numberFound <= 0) {
        sendAnnounce("최소 한 장르는 선택해 주세요.");
        return;
    }
    let announce = MusicManager.CurrentLibrary.printHeaders();
    sendAnnounce(`곡 설정: ${announce} (${numberFound}곡)`);
}

function onChangeFilter(amHost: boolean, setChecked: (value: (((prevState: Map<string, boolean>) => Map<string, boolean>) | Map<string, boolean>)) => void, team: string) {
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

type PresetCounter = {
    counter: number;
    preset: PresetName
};
export default function MusicSelector() {
    const ctx = useContext(RoomContext);
    const localCtx = useContext(LocalContext);
    const [dropdownPreset, setDropDownPreset] = useIncrementalState<PresetName>(GameConfigs.defaultPreset);

    const [loadedPreset, setLoadedPreset] = useIncrementalState<PresetName>(GameConfigs.defaultPreset);
    const amHost = TurnManager.amHost(ctx, localCtx);
    const [checked, setChecked] = useState(new Map<string, boolean>());


    //Load preset selected by dropdown.
    useEffect(() => {
        tryPreset(dropdownPreset.value, setLoadedPreset);
    }, [dropdownPreset.counter]);
    //Updae UI if preset IS loaded.
    useEffect(() => {
        notifyLoaded(setChecked, loadedPreset.value);
    }, [loadedPreset.counter]);


    function onClickReload() {
        MusicManager.loadPreset(dropdownPreset.value).then((success: boolean) => {
            if (!success) return;
            notifyLoaded(setChecked, loadedPreset.value);
        });
    }

    const checkElems: JSX.Element[] = [];
    checked.forEach((use, name) => {
        const elem = <Fragment key={name}>
            <input type="checkbox" id={name}
                   onChange={() => {
                       onChangeFilter(amHost, setChecked, name);
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
                <Dropdown className={`${classes.dropdownPanel} ${classes.centerText}`} value={dropdownPreset.value}
                          options={presetPairs} onChange={(e: any) => {
                    setDropDownPreset(e.target.value as PresetName);
                }}/>
                <button className={classes.reloadButton} onClick={onClickReload}>다시로드</button>
            </HorizontalLayout>
            <HorizontalLayout>
                <p className={`${classes.halfWidth} ${classes.centerText}`}>혹은 직접업로드</p>
                <CSVLoader className={`${classes.halfWidth}`} onUseCustom={() => {
                    setDropDownPreset(PresetName.User);
                }}/>
            </HorizontalLayout>
        </div>
        <HorizontalLayout className={classes.header}>
            <p className={`${classes.halfWidth} ${classes.centerText}`}>{`┌──필터──>`}</p>
            <button className={classes.halfWidth} onClick={() => {
                onPushSetting(amHost, checked);
            }}>적용
            </button>
        </HorizontalLayout>
        <div>
            {checkElems}
        </div>

    </Fragment>;
}