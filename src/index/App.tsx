import React, {useEffect} from 'react';
import Lobby from "pages/lobby/Lobby";
import {Redirect, Route, Switch} from "react-router-dom";
import DataLoader from "pages/components/ui/DataLoader/DataLoader";
import LoadingPage from "pages/components/ui/LoadingPage/LoadingPage";
import {connect} from "pages/components/ui/ChatModule/ChatRelay";
import InGame from "pages/ingame/InGame";

export enum Navigation {
    Loading = "/loading",
    Lobby = "/",
    InGame = "/game",
    GameFinish = "/finished",
}

function App() {
    useEffect(() => {
        connect();
    }, []);

    return (
        <DataLoader>
            <Switch>
                <Route path={Navigation.Loading} exact>
                    <LoadingPage/>
                </Route>
                <Route path={Navigation.Lobby} exact>
                    <Lobby/>
                </Route>
                <Route path={Navigation.InGame} exact>
                    <InGame/>
                </Route>
                <Route path="*">
                    <Redirect to={Navigation.Loading}/>
                </Route>
            </Switch>
        </DataLoader>
    );
}

export default App;
