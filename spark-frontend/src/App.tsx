import React from "react";
import styled from "@emotion/styled";
import {Column} from "@components/Flex";
import {Route, Routes} from "react-router-dom";
import {observer} from "mobx-react"
import {useStores} from "@stores";
import TradeScreen from "@screens/TradeScreen";
import Header from "@components/Header";

const Root = styled(Column)`
  width: 100%;
  min-width: 1080px;
  align-items: center;
  background: #050505;
  height: 100vh;
  overflow-y: scroll;
`;

const App: React.FC = observer(() => {
    const {accountStore} = useStores()
    // if (!accountStore.rootStore.initialized) return null
    return (
        <Root>
            <Header/>
            <Routes>
                <Route path="*" element={<TradeScreen/>}/>
                {/*<Route path={ROUTES.FAUCET} element={<Faucet />} />*/}
            </Routes>
        </Root>
    );
});

export default App;

// import React from 'react';
// import logo from './logo.svg';
// import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;
