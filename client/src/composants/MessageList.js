import {useState, useEffect} from 'react';
import axios from "../api/axios";
import Message from './Message';

function MessageList (props){
    /* Renvoie le mur de message.
    Selon l'utilisateur connecté,  il affiche les messages envoyés par l'utilisateur et ses amis.*/ 
    const [messages, setMessages] = useState([]);
    const user = props.user;
    const messageSentAction = props.messageSent;
    const [listUpdated, setListUpdated] = useState(false); //si un des messages a fait un changement
    const [followSituation,setFollowSituation] = useState("unfollow");

    //only after refreshing the page
    useEffect(() => {
        
        getMessages();
        setListUpdated(false); //reinitialiser 
      },[user,messageSentAction,listUpdated,followSituation]);


    const getMessages = async() => {
        //les messages concernant l'utilisateur courant (donc les message de ses amis et de lui-même)
        console.log('getting messages')
        let msgs = await axios.get(`/message/timeline/${user}`);//,{user} 
        console.log('messages',msgs.data);
        setMessages(msgs.data);
    }
    //messages contient une liste antichronologique des messages. pour chaque message, on crée un composant Message.
    return(
        <div className = 'murMessage'>

            {messages.map(msg =>(
                <Message className ='message' key = {msg._id} msg_id={msg._id} 
                msg={msg.message} log={msg.login} date = {msg.createdAt}
                nbLike={msg.nbLike} likedBy={msg.likedBy} comments={msg.comments}
                currUser = {props.user} following= {"unfollow"} setListUpdated={setListUpdated} 
                setFollowSituation={setFollowSituation}/>

                )
            )}
            
        </div>
    );
   
}

export default MessageList;