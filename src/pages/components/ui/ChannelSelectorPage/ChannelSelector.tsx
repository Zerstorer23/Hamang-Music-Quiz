import {useContext, useRef, useState} from "react";
import classes from "./ChannelSelector.module.css";
import gc from "index/global.module.css";
import {InputManager} from "system/GameStates/InputManager";
import {IProps} from "system/types/CommonTypes";
import {LocalContext, LocalField} from "system/context/localInfo/LocalContextProvider";
import {ReferenceManager} from "system/Database/ReferenceManager";


export default function ChannelSelector() {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [isValid, setValid] = useState(true);
    const localCtx = useContext(LocalContext);

    function onFinish(e: any) {
        const num = InputManager.isNumber(inputRef.current!, 765);
        if (num < 0 || num > 999) {
            setValid(false);
            return;
        }
        setValid(true);
        ReferenceManager.channelId = num;
        localCtx.setVal(LocalField.ChannelId, num);
    }

    return <div className={`${classes.container} ${gc.round_border} ${gc.panelBackground}`}>
        <p>0~999 사이의 채널을 골라주세요.</p><br/><p> (없는 채널이면 생성. 있는 채널이면 접속)</p>
        {!isValid && <p>잘못된 번호입니다...</p>}
        <textarea className={classes.inputField}
                  ref={inputRef}
                  onBlur={onFinish}
                  defaultValue={765}>

        </textarea>
        <button className={classes.joinButton}
                onClick={onFinish}
        >접속/생성
        </button>
    </div>;
}