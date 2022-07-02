import classes from "./ImageButton.module.css";
import gc from "global.module.css";
import {IProps} from "system/types/CommonTypes";

type Props = IProps & {
    image: string;

}
export default function ImageText(props: Props) {
    return <div className={`${classes.iconPanel} ${props.className}`}>
        <img alt="" src={`${require(props.image)}`} className={`${classes.icon} ${gc.absoluteCenter}`}/>
        <p className={`${classes.iconText}  ${gc.absoluteCenter} ${gc.darkFont}`}>
            {props.children}
        </p>
    </div>;
}