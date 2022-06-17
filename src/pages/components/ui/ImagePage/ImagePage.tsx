import {IProps} from "system/types/CommonTypes";
import classes from "./ImagePage.module.css";
import gc from "index/global.module.css";
import ELLIE from "resources/images/ellieloading.png";


/*type Props = IProps & {
    imgSrc: Images
}*/

export default function ImagePage(props: IProps) {
    return <div className={`${classes.container} ${gc.panelBackground}`}>
        <img className={classes.image} src={ELLIE} alt={"ld"}/>
        <p className={classes.text}>{props.children}</p>
    </div>;
}