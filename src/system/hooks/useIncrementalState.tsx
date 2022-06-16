import {useState} from "react";

type StateCounter<T> = {
    counter: number;
    value: T
};
export default function useIncrementalState<T>(value: T): [StateCounter<T>, (value: T) => void] {

    const [stateValue, setStateValue] = useState<StateCounter<T>>({
        counter: 0,
        value
    });

    function pushState(value: T) {
        setStateValue((prev: StateCounter<T>) => ({counter: prev.counter + 1, value}));
    }

    return [stateValue, pushState];
}