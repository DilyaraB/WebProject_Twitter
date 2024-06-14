import MessageList from '../composants/MessageList';
import SendMessage from '../composants/SendMessage';
import {useState, useEffect} from 'react';

function MessagePage(props) {
    /*Affiche la formulaire de message et les messages pour l'utilisateur courant */
    const user=props.user; //change selon user_id passé au path
    const [messageSent, setMessageSent] = useState(false); //boolean change entre true et false par SendMessage

    useEffect( () => {
        console.log("messagepage of user ",user)
        if (messageSent){
            setMessageSent(false)
        }
        console.log(messageSent)
    },[user,messageSent]);
    return<div className='Messages'>
            <SendMessage className='sendMessage' login={user} setMessageSent={setMessageSent} messageSent={messageSent}/>
        <h1 className="timeline">Messages de vous et de vos amis</h1>
        <MessageList className='murMessage' user={user} setPage={props.setPage} messageSent={messageSent}/>
        </div>
}

export default MessagePage;