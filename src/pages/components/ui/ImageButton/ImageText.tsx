import classes from "./ImageButton.module.css";
// import getImage, {Images} from "resources/Resources";
import gc from "index/global.module.css";
import {IProps} from "system/types/CommonTypes";

/*type Props = IProps & {
    image: Images;

}*/
export default function ImageText(props: IProps) {
    return <div className={`${classes.iconPanel} ${props.className}`}>
        {/*<img alt="" src={} className={`${classes.icon} ${gc.absoluteCenter}`}/>*/}
        <p className={`${classes.iconText}  ${gc.absoluteCenter} ${gc.darkFont}`}>
            {props.children}
        </p>
    </div>;
}