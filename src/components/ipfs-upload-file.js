import React from 'react';
import ipfsAPI from 'ipfs-api';
var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

export default class UploadIPFS extends React.Component {
  constructor () {
    super()
    this.state = {
      added_file_hash: null
    }
    

    // bind methods
    this.captureFile = this.captureFile.bind(this)
    this.saveToIpfs = this.saveToIpfs.bind(this)
    this.arrayBufferToString = this.arrayBufferToString.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  captureFile (event) {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.onloadend = () => this.saveToIpfs(reader)
    reader.readAsArrayBuffer(file)
  }

  saveToIpfs (reader) {
    let ipfsId
    const buffer = Buffer.from(reader.result)
    ipfs.add(buffer, (err, response) => {
        if (err || !response) {return console.error('ipfs add error', err, response)}
        console.log(response)
        ipfsId = response[0].hash
        console.log(ipfsId)
        this.setState({added_file_hash: ipfsId})
    });
  }

  arrayBufferToString (arrayBuffer) {
    return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer))
  }

  handleSubmit (event) {
    event.preventDefault()
  }

  render () {
    return (
      <div>
        <form id='captureMedia' onSubmit={this.handleSubmit}>
          <input type='file' onChange={this.captureFile} />
        </form>
        <div>
          <a target='_blank'
            href={'https://ipfs.io/ipfs/' + this.state.added_file_hash}>
            {this.state.added_file_hash}
          </a>
        </div>
      </div>
    )
  }
}