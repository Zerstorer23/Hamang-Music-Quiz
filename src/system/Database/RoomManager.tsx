import "firebase/compat/database";
import {getRandomSeed} from "system/Constants/GameConstants";
import {GameConfigs} from "system/configs/GameConfigs";
import {Game, GameStatus, MusicEntry, MusicStatus, Player, PlayerMap, Room, RoomHeader} from "system/types/GameTypes";

export class RoomManager {

    public static getDefaultHeader(): RoomHeader {
        return {
            hostId: "",
            seed: getRandomSeed(),
            games: GameConfigs.defaultGames,
            settings: {included:
                    [] // TODO
            },
        };
    }

    static getDefaultMusic(): MusicEntry {
        return {
            c: 0,
            vid: "",
            status: MusicStatus.Playing,
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
        /*    const newHeader = room.header;
            newHeader.seed = getRandomSeed();
            newHeader.topIndex = room.playerList.length * 2;
            ReferenceManager.updateReference(DbFields.HEADER, newHeader);
            //Set Players. is one by one uniform
            room.playerList.forEach((playerId, index) => {
                const player = room.playerMap.get(playerId)!;
                player.coins = (DS.abundantCoins) ? 7 : GameConfigs.startingCoins;
                player.icard = index * 2;
                player.isSpectating = false;
                player.isReady = false;
                player.lastClaimed = CardRole.None;
                ReferenceManager.updatePlayerReference(playerId, player);
            });
            //Set Room, is one by one
            const action = GameManager.createGameAction(room.playerList[newHeader.seed % room.playerList.length]);
            const deck: CardRole[] = DeckManager.generateStartingDeck(room);
            const state: TurnState = {
                turn: TurnManager.getFirstTurn(newHeader.seed, room.playerList.length),
                board: BoardState.ChoosingBaseAction
            };
            ReferenceManager.updateReference(DbFields.GAME_action, action);
            ReferenceManager.updateReference(DbFields.GAME_deck, deck);
            ReferenceManager.updateReference(DbFields.GAME_state, state);*/
    }
}
