import {IProps} from "system/types/CommonTypes";
import {Player, PlayerEntry} from "system/types/GameTypes";
import classes from "./PlayerGridItem.module.css";

type Props = IProps & {
    player: PlayerEntry
    isMe: boolean
    index: number
}

export default function PlayerGridItem(props: Props) {
    const id = props.player.id;
    const player = props.player.player;
    const cssIndex = props.index + 1;
    const cellCss = classes[`cell${cssIndex}`];


    return <div className={`${classes.cell} ${cellCss}`}>
        <p>
            {`${cssIndex}. ${player.name} (${player.wins}점)`}
        </p>
        <p>대충 이런 정답을 말했다 이겁니다.
        </p>
    </div>;
}