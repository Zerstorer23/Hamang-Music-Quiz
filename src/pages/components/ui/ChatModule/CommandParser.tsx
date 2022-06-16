import {RoomContextType} from "system/context/roomInfo/RoomContextProvider";
import {
    ChatContextType,
    ChatEntry,
    ChatFormat,
    sendChat
} from "pages/components/ui/ChatModule/chatInfo/ChatContextProvider";
import {TurnManager} from "system/GameStates/TurnManager";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {GameConfigs} from "system/configs/GameConfigs";
import {LocalContextType} from "system/context/localInfo/LocalContextProvider";

export class CommandParser {
    public static handleCommands(
        ctx: RoomContextType,
        localCtx: LocalContextType,
        chatCtx: ChatContextType,
        command: string
    ) {
        const args = command.split(" ");
        const amHost = TurnManager.amHost(ctx, localCtx);
        switch (args[0]) {
            case "coi":
            case "coin":
            case "coins":
                if (!amHost) return;
                if (ctx.room.header.games > 2) return;
                ReferenceManager.updateReference(
                    DbFields.HEADER_games,
                    ctx.room.header.games + GameConfigs.addGames
                );
                chatCtx.loadChat({
                    format: ChatFormat.announcement,
                    name: "",
                    msg: ("_coins_inserted"),
                });
                break;
            case "redirect":
                if (!amHost) return;
                sendChat(ChatFormat.hidden, "", "redirect");
                break;
            case "reload":
                if (!amHost) return;
                sendChat(ChatFormat.hidden, "", "reload");
                break;
        }
    }


}