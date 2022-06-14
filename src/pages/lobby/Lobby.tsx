import classes from "./Lobby.module.css";

import gc from "index/global.module.css";
import LobbySettings from "pages/lobby/Left/LobbySettings";
import ChatComponent from "pages/lobby/chat/ChatComponent";
import PlayersPanel from "pages/lobby/Center/PlayersPanel";
import Sanitizer from "pages/components/ui/DataLoader/Sanitizer";

export default function Lobby() {
    return (<Sanitizer>
            <div className={`${classes.container} ${gc.panelBackground}`}>
                <LobbySettings/>
                <PlayersPanel/>
                <ChatComponent/>
            </div>
        </Sanitizer>
    );
}
