import React from 'react';
import ReactDOM from 'react-dom';
import '../App.css';
import Message from './Message.js';

class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.ipfs = this.props.ipfs;
        this.topicLobby = "lobby.dev"; 
        this.incomingMsg = "";
        this.dateIncomingMsg = "";
        this.dateOncomingMsg = "";
        this.state = {
            msgHash: "none",
            msg: "",
            chats: [{
                username: "Israel Laguan",
                content: <p>Hello World!</p>,
                img: "http://i.imgur.com/Tj5DGiO.jpg",
            }, {
                username: "Alice Chen",
                content: <p>Definitely! Sounds great!</p>,
                img: "http://i.imgur.com/Tj5DGiO.jpg",
            }],
        };
        this.submitMessage = this.submitMessage.bind(this);
        this.publishMsg = function () {
            let msg = new Buffer(JSON.stringify({
                date: this.dateOncomingMsg,
                myMsg: this.state.msg,
                msgHash: this.state.msgHash,
                usernameHash: this.props.usernameHash,
            }));
            this.ipfs.pubsub.publish(this.topicLobby, msg);
        }.bind(this);

        this.readMsg = function (msg) {
            if (msg.from !== this.props.myPeerId){
                try {msg.data = JSON.parse(msg.data.toString());} 
                catch (e) {return;}
               
                if (msg.data.date !== this.dateIncomingMsg && msg.data.date !== "" ){
                    this.dateIncomingMsg= msg.data.date;
                    this.handleRead(msg.data.usernameHash, msg.data.msgHash);
                    return console.log(msg, msg.data.date, this.dateIncomingMsg);
                }
            console.log("...")  

                
            }
        }.bind(this);

        this.handleRead = function (from, hash){
            this.ipfs.files.cat(hash, (err, data) => {
                if (err) {throw err}
                let info = data.toString();
                console.log("read",info);
                this.setState({
                    chats: this.state.chats.concat([{
                        username: from,
                        content: <p>{info}</p>,
                        img: "https://robohash.org/"+from+".png?set=set4",
                    }])
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
                    this.setState({msgHash: file.hash, msg: data.toString()});  
                    this.dateOncomingMsg = new Date();
                })
              }
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