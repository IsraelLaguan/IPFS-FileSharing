import React from 'react';
import IPFS from 'ipfs';
import Repo from 'ipfs-repo';
import Chatroom from './Chatroom.js';
import UploadIPFS from './ipfs-upload-file';
import LoadingImg from './loading.gif';
import DropOut from './ipfs-dropout';

export default class Connection extends React.Component {
    constructor(props) {
    super(props);
    this.state = {
        peer: "none",
        usernameHash: "none",
        online: false,
    };
    this.ipfs = new IPFS({
        EXPERIMENTAL: {
            pubsub: true
        },
        repo: new Repo('/localUser/ipfs-repo'),                                                                                //TODO: create and modify repo
        online: true,
        config: {
            Addresses: {
            API: "/ip4/127.0.0.1/tcp/5001",
            Announce: [],
            Gateway: "/ip4/127.0.0.1/tcp/8080",
            NoAnnounce: [],
            Swarm: [
                "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star",
            ]
            },
            Bootstrap: [
            "/ip4/192.168.0.27/tcp/4001/ipfs/QmWvsZ1ZxLMa5aB6MMtG8nJvFZ6HsiLgx5RpP9DX7qpjPo"
            ],
        }
    })
    };

    componentWillMount() {
        this.ipfs.on('ready', () => {
            console.log("IPFS.on: ready");
            this.ipfs.id((err, peer) => {
                if (err) {
                    console.log("IPFS.id error: ", err);
                    return;
                };
                this.setState({
                    peer: peer,
                    usernameHash: "QmVWMufjtpwMz9zmdNhQrBSX8gssedcU9U24b7F1KdfRgg",
                    online: true
                });                                                                                //change props of father
            })
        });
    }
  
    render() {
      return (
        <div>
            Peer id: {this.state.peer.id}
            {(this.state.online)?<Chatroom ipfs={this.ipfs} usernameHash={this.state.usernameHash} myPeerId={this.state.peer.id}/>:<img src={LoadingImg} alt=""/>}
            {/* <UploadIPFS/> */}
            {/* <DropOut ipfs={this.ipfs}/> */}
        </div>
      );
    }
  }
  