import "firebase/compat/database";
import {getRandomSeed, randomInt} from "system/Constants/GameConstants";
import {GameConfigs} from "system/configs/GameConfigs";
import {Game, GameStatus, MusicEntry, MusicStatus, Player, Room, RoomHeader} from "system/types/GameTypes";
import {DbFields, ReferenceManager} from "system/Database/ReferenceManager";
import {MusicManager, MusicObject} from "pages/ingame/Left/MusicPanel/MusicModule/MusicDatabase/MusicManager";
import {DS} from "system/configs/DS";
import {PlayAt, PlaySpeed} from "pages/ingame/Left/MusicPanel/MusicModule/MusicModule";

export class RoomManager {


    public static getDefaultHeader(): RoomHeader {
        return {
            hostId: "",
            seed: getRandomSeed(),
            games: GameConfigs.defaultGames,
            settings: {
                guessTime: !DS.StrictRules ? 5 : GameConfigs.defaultGuessTime,
                songsPlay: !DS.StrictRules ? 5 : GameConfigs.defaultSongNumber,
                limitedCommunication: true,
                playAt: PlayAt.Random,
                speed: PlaySpeed.Normal,
                useArtists: false,
                blocker: false,
            },
        };
    }

    static geDefaultMusicObject(): MusicObject {
        return {
            team: "버그",
            answers: ["Calc"],
            videoId: "oidKy7khp8o",
            title: "Calc.[이게 보이면 버그있음]",
            artists: []
        };
    }

    static getDefaultMusic(): MusicEntry {
        return {
            counter: -1,
            seed: randomInt(0, 100),
            music: this.geDefaultMusicObject(),
            status: MusicStatus.WaitingMusic,
        };
    }

    static getDefaultGame(): Game {
        return {
            musicEntry: this.getDefaultMusic(),
            gameStatus: GameStatus.Lobby,
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
            musicEntry: this.getDefaultMusic(),
            gameStatus: GameStatus.InGame
        };
    }
}
