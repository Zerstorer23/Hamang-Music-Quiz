import React, {useState} from "react";
import {IProps} from "system/types/CommonTypes";
import {PresetName} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/Presets";

/*
Local context holds local data that does not go into database
*/

export type ContextFieldType<T> = {
    val: T | null;
    set: (nv: T) => void;
};
export type LocalContextType = {
    map: Map<LocalField, ContextFieldType<any>>;
    getVal: (field: LocalField) => any;
    setVal: (field: LocalField, val: any) => void;
};

export enum LocalField {
    Id,
    Timer,
    InputFocus,
    Muted,
    ChannelId,
    SelectedPreset,
}

export type CursorFocusInfo = {
    time: number;
    state: InputCursor;
}
export type TimerOptionType = {
    duration: number;
    onExpire: any;
};
export const LocalContext = React.createContext<LocalContextType>({
    map: new Map<LocalField, any>(),
    getVal: (field: LocalField) => {
    },
    setVal: (field: LocalField, val: any) => {
    },
});

export enum CursorState {
    Idle = "Idle",
    Selecting = "Selecting",
}

export enum InputCursor {
    Idle,
    Chat,
    AnswerInput,
}

export default function LocalProvider(props: IProps) {
    const [myId, setMyId] = useState<string | null>(null);
    const [inputFocused, setInputFocused] = useState<CursorFocusInfo>({
        time: 0,
        state: InputCursor.Idle
    });
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [channelId, setChannelId] = useState<number>(-1);
    const [timerOption, setTimerOption] = useState<TimerOptionType>({
        duration: 20,
        onExpire: () => {
        },
    });
    const [selectedPreset, setSelectedPreset] = useState(PresetName);

    const map = new Map();
    map.set(LocalField.Id, {
        val: myId,
        set: setMyId,
    });

    map.set(LocalField.Timer, {
        val: timerOption,
        set: setTimerOption,
    });
    map.set(LocalField.InputFocus, {
        val: inputFocused,
        set: setInputFocused,
    });
    map.set(LocalField.Muted, {
        val: isMuted,
        set: setIsMuted,
    });
    map.set(LocalField.ChannelId, {
        val: channelId,
        set: setChannelId,
    });
    map.set(LocalField.SelectedPreset, {
        val: selectedPreset,
        set: setSelectedPreset,
    });


    const context: LocalContextType = {
        map,
        getVal: (field: LocalField) => {
            return map.get(field).val!;
        },
        setVal: (field: LocalField, val: any) => {
            map.get(field).set(val);
        },
    };

    return (
        <LocalContext.Provider value={context}>
            {props.children}
        </LocalContext.Provider>
    );
}
