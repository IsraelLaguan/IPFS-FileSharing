import React from 'react';
import ReactDOM from 'react-dom';
import '../App.css';
import Message from './Message.js';

class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.ipfs = this.props.ipfs;
        this.topicLobby = "lobby.dev"; 
        this.hashIncomingMsg = "";
        this.msgStore = {};
        this.state = {
            msgHash: "none",
            msgDate: "none",
            msgCounter: 0,
            chats: [{
                username: "Israel Laguan",
                content: <p>Hello World!</p>,
                img: "https://robohash.org/"+this.props.usernameHash+".png?set=set4",
            }, {
                username: "Alice Chen",
                content: <p>Hello! Nice to see you!</p>,
                img: "http://i.imgur.com/Tj5DGiO.jpg",
            }],
        };
        this.submitMessage = this.submitMessage.bind(this);
        this.publishMsg = function () {
            let msg = new Buffer(JSON.stringify({
                counter: this.state.msgCounter,
                myMsg: this.state.msg,
                msgHash: this.state.msgHash,
                usernameHash: this.props.usernameHash,
            }));
            this.ipfs.pubsub.publish(this.topicLobby, msg);
        }.bind(this);

        this.readMsg = function (msg) {
            if (msg.from !== this.props.myPeerId && msg.data.counter > 0 ){
                try {msg.data = JSON.parse(msg.data.toString());} 
                catch (e) {return;}
                
                if (msg.data.myMsg !== "none"){
                    if (msg.from in this.msgStore){console.log(this.msgStore[msg.from])}
                    else {console.log("problem in readMsg")}
                    // if (msg.from in this.msgStore && msg.from){
                    //     this.setState({
                    //         chats: this.state.chats.concat([{
                    //             username: from,
                    //             content: <p>{info}</p>,
                    //             img: "https://robohash.org/"+from+".png?set=set4",
                    //         }])
                    //     });
                    // }
                    this.handleRead(
                        msg.data.usernameHash, msg.from, msg.data.msgHash, msg.data.counter
                    );
                    return;
                }
            }

        }.bind(this);

        this.handleRead = function (hashFrom, from, msgHash, counter){
            this.ipfs.files.cat(msgHash, (err, data) => {
                if (err) {throw err}
                let info = data.toString();
                console.log("read",info);
                this.ipfs.files.cat(hashFrom, (err, data) => {
                    if (err) {throw err}
                    let from = data.toString();
                    console.log("read",info);
                    let keyname = from;
                    Object.assign(this.msgStore, {
                        [keyname]:{
                            msg: info, 
                            counter: counter, 
                            msgHash: msgHash,
                            usernameHash: hashFrom,
                        }, 
                    });
                });
                
            });
        }.bind(this);
    }

    componentWillMount(){
        this.setState({
            msgHash: "QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX",
        })
    }

    componentDidMount() {
        this.scrollToBot();
        console.log("ipfs.pubsub.subscribe: " + this.topicLobby);
        this.ipfs.pubsub.subscribe(this.topicLobby, this.readMsg);
        setInterval(this.publishMsg, 500);
    }

    componentDidUpdate() {
        this.scrollToBot();
    }

    scrollToBot() {
        ReactDOM.findDOMNode(this.refs.chats).scrollTop = ReactDOM.findDOMNode(this.refs.chats).scrollHeight;
    }

    submitMessage(e) {
        e.preventDefault();
        let msg=  ReactDOM.findDOMNode(this.refs.msg).value;
        this.ipfs.files.add(Buffer.from(msg), (err, res) => {
            if (err || !res) {
              return console.error('ipfs add error', err, res)
            }
            
            res.forEach((file) => {
              if (file && file.hash) {
                this.ipfs.files.cat(file.hash, (err, data) => {
                    if (err) { return console.error('ipfs cat error', err) }
                    console.log('successfully stored name:', data.toString(), file.hash)
                    this.setState({msgHash: file.hash, msgDate: new Date().toString});                              ///////
                })
              }
              this.setState((prevState, props) => ({
                  msgCounter: prevState.msgCounter + 1,
              }));
            })
        });

        this.setState({
            chats: this.state.chats.concat([{
                username: "Kevin Hsu",
                content: <p>{ReactDOM.findDOMNode(this.refs.msg).value}</p>,
                img: "https://robohash.org/"+this.props.usernameHash+".png?set=set4",
            }])
        }, () => {
            ReactDOM.findDOMNode(this.refs.msg).value = "";
        });
    }

    render() {
        const username = "Kevin Hsu";
        const { chats } = this.state;

        return (
            <div className="chatroom">
                <h3>CryptoChat</h3>
                <ul className="chats" ref="chats">
                    {
                        chats.map((chat) => 
                            <Message chat={chat} user={username} key={Math.random()}/>
                        )
                    }
                </ul>
                <form className="input" onSubmit={(e) => this.submitMessage(e)}>
                    <input type="text" ref="msg" />
                    <input type="submit" value="Submit" />
                </form>
            </div>
        );
    }
}

export default Chatroom;

/* 

podria en handleRead guardar en un objeto, y con otra funcion llamada desde ping 
    comparar los mensajes y si no esta dibujarla
    
*/