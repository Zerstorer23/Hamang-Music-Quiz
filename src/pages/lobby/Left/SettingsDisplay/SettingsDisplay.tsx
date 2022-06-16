import {useContext} from "react";
import RoomContext from "system/context/roomInfo/room-context";
import {IProps} from "system/types/CommonTypes";

export default function SettingsDisplay(props: IProps) {
    const ctx = useContext(RoomContext);
    const settings = ctx.room.header.settings;
    return <div className={`${props.className}`}>
        <p>{(settings.limitedCommunication) ? "채팅제한중" : ""}</p>
        <p>{`재생시간: ${settings.guessTime}초`}</p>
        <p>{`재생 곡 수: ${settings.songsPlay}개`}</p>
    </div>;
}