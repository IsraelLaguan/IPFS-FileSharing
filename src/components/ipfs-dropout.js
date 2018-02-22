import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import Buffer from 'buffer';
import webtorrent from 'webtorrent';
import ipfsAPI from 'ipfs-api';
export default class DropOut extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      web: [],
      client: new webtorrent(),
    }
    this.node = this.props.ipfs;
  }

  onDrop(files) {
    this.setState({
      files
    });
  }

  handleClick = () => {
    for (let i = 0; i < this.state.files.length; i ++) {
      console.log(this.state.files[i]);
      this.state.client.seed(this.state.files[i], (torrent) => {
        console.log('torrent', torrent);
        torrent.files[0].getBuffer((err, buffer) => {
          this.node.files.add(buffer, (err, files) => {
            let web = ['https://ipfs.io/ipfs/' + files[0].hash];
            this.setState({web});
          })
        })
      })
    }
  }

  copyToClipboard = () => {
    var textField = document.createElement('textarea')
    textField.innerText = this.state.web
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
  }

  render() {
    return (
      <div className="container">
      <section>
      <h1> SnapCloud </h1>

      <div className="dropzone">
      <Dropzone onDrop={this.onDrop.bind(this)}>
      <p>Try dropping your file here.</p>
      </Dropzone>
      </div>
      <aside>
      <br /><br/>
      <h4>Dropped HTML file</h4>
      <ul>
      {
        this.state.files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
      }
      </ul>
      </aside>
      <button onClick={this.handleClick}>
      Upload file!!
      </button>
      <br />
      <a href={this.state.web[0]}>{this.state.web.map((el) => el)}</a>
      </section>
      <br />
      <button onClick={this.copyToClipboard}>Click to copy to clipboard</button>
      <br />
      </div>
    );
  }
}