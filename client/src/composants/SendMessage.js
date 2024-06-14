import { useRef,useState } from "react";
import axios from "../api/axios"

function SendMessage(props) {
  /* Renvoie le formulaire pour envoyer un message. 
  */

  const sender = props.login; //l'utilisateur connecté envoie ce message, on le garde comme un prop
  const [message, setMessage] = useState("");
  const textRef = useRef(null); //pour acceder a textare afin de le reinitialiser
  const msgSent = props.messageSent;

  const getMessage = (event) => {
    setMessage(event.target.value);
  };

  //Utilise la routeur et l'entité messages pour créer un message. (fonction create dans messages.js du côté serveur)
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        console.log("sender = ",sender)
        console.log("message =",message)
        await axios.post("/message/sendMessage", {login:sender,message:message})
        .then(res=>{
          console.log("message sent by:",res.data.login);
          console.log("message text:",res.data.message);
          console.log("message sent");
          console.log("messageSent aaaa",msgSent);
          props.setMessageSent(true);
          //reinitialise le formulaire
          textRef.current.value = "";
          setMessage('');
          event.target.reset();
          
        });
      
    }catch(err){
      console.log("could not send message");
    }
  }
  //formulaire 
  return (
    <div className="sendMessage">
      <form id="message_entry" method="POST" action="">
        <label htmlFor="message">Entrez votre message</label>
        <br></br>
        <textarea className='entry' id="textarea" type="text" onChange={getMessage} maxLength={200} rows ={5} ref={textRef} />
        <br></br>
        <button type="submit" onClick={(handleSubmit)}>Envoyer</button>
        <button type="reset">Réinitialiser</button>
      </form>
    </div>
  );
}
export default SendMessage;
