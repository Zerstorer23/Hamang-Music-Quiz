import "firebase/compat/database";
import {getRandomSeed} from "system/Constants/GameConstants";
import {GameConfigs} from "system/configs/GameConfigs";
import {Game, GameStatus, MusicEntry, MusicStatus, Player, Room, RoomHeader} from "system/types/GameTypes";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicManager} from "pages/ingame/Left/MusicPanel/MusicModule/MusicManager";
import {DS} from "system/configs/DS";

export class RoomManager {
    public static getDefaultIncluded(): boolean[] {
        return [true, false, false, false, false, false, false];
    }

    public static getDefaultHeader(): RoomHeader {
        return {
            hostId: "",
            seed: getRandomSeed(),
            games: GameConfigs.defaultGames,
            settings: {
                included: this.getDefaultIncluded(),
                guessTime: !DS.StrictRules ? 5 : GameConfigs.defaultGuessTime,
                songsPlay: !DS.StrictRules ? 5 : GameConfigs.defaultSongNumber,
            },
        };
    }

    static getDefaultMusic(): MusicEntry {
        return {
            counter: -1,
            vid: "",
            status: MusicStatus.WaitingMusic,
        };
    }

    static getDefaultGame(): Game {
        return {
            music: this.getDefaultMusic(),
            status: GameStatus.Lobby,
        };
    }


    public static getDefaultRoom(): Room {
        return {
            playerMap: new Map<string, Player>(),
            playerList: [],
            game: RoomManager.getDefaultGame(),
            header: RoomManager.getDefaultHeader(),
        };
    }


    /**
     *
     * Called by Player Panel to initialise the game start state
     * @param room
     */


    public static setStartingRoom(room: Room) {
        //Set  , is uniform. send at once
        const newHeader = room.header;
        newHeader.seed = getRandomSeed();
        newHeader.settings.songsPlay = Math.min(newHeader.settings.songsPlay, MusicManager.MusicList.length);
        ReferenceManager.updateReference(DbFields.HEADER, newHeader);
        //Set Players. is one by one uniform
        room.playerList.forEach((playerId, index) => {
            const player = room.playerMap.get(playerId)!;
            player.isSpectating = false;
            player.isReady = false;
            ReferenceManager.updatePlayerReference(playerId, player);
        });
        //Set Room, is one by one
        const newGame = RoomManager.getStartingGame();
        ReferenceManager.updateReference(DbFields.GAME, newGame);
    }

    private static getStartingGame(): Game {

        return {
            music: MusicManager.pollNext(0)!,
            status: GameStatus.InGame
        };
    }
}
