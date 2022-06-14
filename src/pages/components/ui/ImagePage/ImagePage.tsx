import {IProps} from "system/types/CommonTypes";
import classes from "./ImagePage.module.css";
import getImage, {Images} from "resources/Resources";
import gc from "index/global.module.css";


type Props = IProps & {
    imgSrc: Images
}

export default function ImagePage(props: Props) {
    return <div className={`${classes.container} ${gc.panelBackground}`}>
        <img className={classes.image} src={`${getImage(props.imgSrc)}`} alt={"ld"}/>
        <p className={classes.text}>{props.children}</p>
    </div>;
}