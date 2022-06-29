import {Fragment, useEffect} from "react";
import {DS} from "system/configs/DS";

export default function ConsoleGuard() {
    //https://stackoverflow.com/questions/28575722/how-can-i-block-f12-keyboard-key-in-jquery-for-all-my-pages-and-elements
    useEffect(() => {
        if (DS.allowConsole) return;
        document.addEventListener("contextmenu", onRightClick, false);
        document.addEventListener("keydown", onF12, false);
        return () => {
            if (DS.allowConsole) return;
            document.removeEventListener("contextmenu", onRightClick, false);
            document.removeEventListener("keydown", onF12, false);
        };
    }, []);
    return <Fragment/>;
}

function onRightClick(e: any) {
    e.preventDefault();
}

function onF12(e: any) {
    // "F12" key
    if (e.keyCode === 123) {
        disabledEvent(e);
    }
}

function disabledEvent(e: any) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else if (window.event) {
        window.event.cancelBubble = true;
    }
    e.preventDefault();
    return false;
}