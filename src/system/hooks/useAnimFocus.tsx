import usePrevious from "system/hooks/usePrevious";
import {useEffect, useState} from "react";
import animClasses from "index/animation.module.css";

export enum AnimType {
    FadeIn = animClasses.fadeIn,
    SlideRight = animClasses.slideRight,
    ZoomIn = animClasses.zoomIn,
    ZoomInSmall = animClasses.zoomInSmall,
}

export default function useAnimFocus<T>(value: T, animType: AnimType) {
    const ref = usePrevious<T>(value);
    const [anim, setAnim] = useState(animClasses.invisible);
    useEffect(() => {
        setAnim(animClasses.invisible);
        setTimeout(() => {
            setAnim(animType);
        }, 100);
    }, [ref, animType]);
    return anim;
}
