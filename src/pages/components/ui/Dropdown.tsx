import {IProps, ItemPair} from "system/types/CommonTypes";
import classes from "./Dropdown.module.css";
import gc from "index/global.module.css";

type Props = IProps & {
    value: string;
    options: ItemPair[];
    onChange: any;
};
export default function Dropdown(props: Props) {
    return (<select className={`${classes.container} ${gc.darkFont} ${props.className}`}
                    value={props.value}
                    onChange={props.onChange}>
            {props.options.map((option, index) => (
                <option key={index} className={gc.darkFont} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
