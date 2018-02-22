import React, { Component } from 'react';
import './App.css';
import Connection from './components/ipfs-connection';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Connection/>
      </div>
    );
  }
}

export default App;
