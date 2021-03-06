import firebase from "firebase/compat/app";

export type IProps = {
    className?: string;
    children?: JSX.Element[] | JSX.Element | any;
};

export type ItemPair = {
    label: string;
    value: string;
};
export type FlexPair = {
    element: JSX.Element;
    flex: number;
};
export type Snapshot = firebase.database.DataSnapshot;

export enum LoadStatus {
    selectChannel = "Selecting Channel",
    init = "Initialising",
    isLoading = "Loading room",
    loaded = "Room loaded",
    listening = "Listening changes",
    joined = "Joined room",
    outerSpace = "A outer space",
}

export type voidReturn = () => void;
export type DbRef = firebase.database.Reference;
export type LinearParam = IProps & { elements: FlexPair[] };


export type TimerReturnType = {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    resume: () => void;
    restart: (newTimestamp: Date, autoStart?: boolean | undefined) => void;
};

export const LISTEN_VALUE = "value";
export const LISTEN_CHILD_ADDED = "child_added";
export const LISTEN_CHILD_REMOVED = "child_removed";
export const LISTEN_CHILD_CHANGED = "child_changed";
export const LISTEN_CHILD_MOVED = "child_moved";
