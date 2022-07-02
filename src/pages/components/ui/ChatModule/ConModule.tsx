import classes from "pages/components/ui/ChatModule/ChatModule.module.css";
import gc from "index/global.module.css";
import {DCConButtonType, DCconList} from "resources/DCconDB";
import React from "react";
import {IProps} from "system/types/CommonTypes";
import {ChatFormat, sendChat} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";

type Props = IProps & {
    height: string;
    show: boolean;
    myName: string;
}
export default function ConModule(p: Props) {

    function onClickCon(conType: DCConButtonType) {
        sendChat(ChatFormat.normal, p.myName, `#${conType.text}`);
    }

    return <div className={`${classes.dcConPanel} ${(p.show) ? "" : gc.hidden}`} style={{height: p.height}}>
        {
            DCconList.map((value, index) => {
                return <button
                    key={index}
                    className={classes.dcconButton}
                    onClick={() => {
                        onClickCon(value);
                    }}
                >
                    {`${value.text}`}
                </button>;
            })
        }
    </div>;
}