import { useRef,useState,useEffect } from "react";
import axios from "../api/axios"
import { NavLink, Route, Routes } from 'react-router-dom';
import Message from '../composants/Message';
import {ImProfile} from "react-icons/im";

function SearchPage(props) {
  /* Maintenant il est un page mais après on peut le garder toujours dans MainPage
  Renvoie un formulaire pour les entrées de recherche, désormais, on peut seulement chercher 
  user_id des utilisateurs. On implementera le reste. (Fonctions existent dans le côté serveur)
  On peut accéder a la profile de l'utilisateur cherché en cliquant sur son user_id.
  */
  const sender =props.user;
  const [search, setSearch] = useState('');
  const textRef = useRef(null); //pour acceder a textare afin de le reinitialiser
  const [searchType, setSearchType] = useState("user"); //pas encore implementé mais il est pour assurer le type de recherche
  const [resUser, setResUser] = useState(""); //contient la liste des utilisateurs (si le login est dans le text)
  const [resMessage, setResMessage] = useState([]); //contient la liste des messages 
  const [resUserMes, setUserMes] = useState([]); //contient les messages envoyés par l'utilisatuer 
  const [errorMsg, setErrorMsg] = useState("");
  const [followSituation, setFollowSituation] = useState("");
  const [listUpdated, setListUpdated] = useState(false);
  const [followers, setFollowers]=useState([]);
  const [following, setFollowing]= useState([]);
  const [userFound, setUserFound] = useState(false);

  
  //recharhe la page apres changement sur la cariable resUser
  useEffect(() => {
    console.log('current user =',sender);
    getProfile();
    //getMessages();

    getMessagesContaining();
    setListUpdated(false); //reinitialiser
    

  },[resUser,listUpdated,followSituation,sender]);

  //variable d'entrée
  const getSearch = (event) => {
    setSearch(event.target.value);
  };



  //Si on a cherché un utilisateur qui n'est pas l'utilisateur courant, on affiche le bouton follow.
  //on utilise le routeur pour regarder si on deja follow cet utilisateur, si oui, on unfollow, sinon, on follow
  //donc on modifie les listes following/follower de ces utilisateurs
  //Follow unfollow n'est pas complète et peut causer des erreurs.
  const handleFollow = async (event) => {
        event.preventDefault();
    try {
        const send = await axios.put(`/user/followunfollow/${search}`, {currentUser:sender,tofollow:resUser});
        if (send.data){
          //res.data=true if followed and false if unfollowed
          setFollowSituation("unfollow");
        }else{
  
          setFollowSituation("follow");
        }
        
    }catch(err){
      console.log("problem during follow unfollow ");
    }
  }

    //Renvoie les informations sur l'utilisateur ayant cet userid en utilisant un router et la fonciton get dans users.js (côté serveur)
    const getProfile = async () =>{
        try{
            let profile = await axios.get(`/user/${sender}`)
            .then(res =>{
                console.log("user received");
                //res.data est user
                console.log(res.data)
                console.log("sender :", sender );
                console.log("user :", resUser);
                setFollowers(res.data.followers);
                console.log("followers :", followers);
                setFollowing(res.data.following);
                console.log("following :", following);
                
            });
            
        }catch(err){
            console.log("user could not be received ");
        }finally{
            if (following.includes(search)){
                setFollowSituation("unfollow");
                //console.log("unfollowed");
            }
            else {
                setFollowSituation("follow");
                //console.log("followed");
            }
        
        }
    }

  /*const getMessages = async() =>{

      try{
          let msgs = await axios.get(`/message/${resUser}`)
          .then(res =>{
              console.log("user messages received");
              setUserMes(res.data)
          });
      }catch(err){
          console.log("user messages could not be received ");
      }
  }*/

  const getMessagesContaining = async () => {
    try{
      let send = await axios.get(`/message/containing/${sender}/${search}`)
      .then (res => {
        setResMessage(res.data);
        {res.data.length === 0 && !resUser && search !== '' ? setErrorMsg("Message or user does not exist") :
        setErrorMsg("");
        console.log('searched :',res.data);
        //reinitialise le formulaire
        //textRef.current.value = "";
        //setSearch('');
      }
        
        //event.target.reset();
    });
    }catch(err) {
      console.log("problem with finding message");

      { search !== '' ? setErrorMsg("Message or user does not exist") : setErrorMsg("")} ;
    }
  }


  const handleReset = (event) =>{
    setSearch('');
    setResUser('');
    setErrorMsg('')
    setResMessage([]);
  }

  //Après submit, on utilise le routeur et la fonction get dans users.js afin de trouver l'utilisateur ayant ce user_id
  const handleSubmit = async (event) => {
    event.preventDefault();
      //si la recherche contient un ou des userid, on renvoie ces utilisateurs
      //si la recherche contient un message envoyé, on renvoie ce message
      console.log('user :',search);
      //getMessagesContaining();
      try{
        let send = await axios.get(`/user/${search}`)
        .then(res=>{
          setResUser(res.data.login);
          console.log('searched user :',res.data.login);
          console.log('resUser : ', resUser);
          getProfile();
          setUserFound(true);
          getMessagesContaining();
          setErrorMsg("");
          //reinitialise le formulaire
          textRef.current.value = "";
          //setSearch('');
          //event.currentTarget.reset();
        });
    }catch(err) {
        console.log(err)
        console.log("problem with finding user");
        setUserFound(false);
        setResUser("");
        //setUserMes([]);
        getMessagesContaining();
        
    }
  }

//Quand on clique sur user_id, on ouvre la Profile Page de cet utilisateur.
  return (
    <>
    <div className="searchBar">
      <form id="search_entry" method="GET" action="">
        <label htmlFor="search">Entrez l'utilisateur ou mot : </label>
        <br></br>
        <input className='entry' id="textarea" type="text" onChange={getSearch} maxLength={200} rows ={3} ref={textRef} />
        <br></br>
        <button type="submit" onClick={(handleSubmit)}>Cherche</button>
        <button type="reset" onClick={(handleReset)}>Reset</button>
      </form>
    </div>
    <div className="searchPage">
      { errorMsg === "" ? <> 
        { resUser ? <>
                    <div className="profile">
                    <div className='photoProfile'><ImProfile/></div>
                    <NavLink to={ `/profilePage/${resUser}`} className="profiLink"> @{resUser}</NavLink> 
                    {(resUser!=sender) ? <button className='followButton' onClick={(handleFollow)}>{following.includes(resUser) ? "unfollow" : "follow"}</button> : <></> }</div>
                    </>:<></>
        }
    <div className = 'Messages'>
            {resMessage.map(msg =>(
                <Message className ='message' key = {msg._id} msg_id={msg._id} 
                msg={msg.message} log={msg.login} date = {msg.createdAt}
                nbLike={msg.nbLike} likedBy={msg.likedBy} setPage={props.setPage} 
                currUser = {sender} following= {following.includes(msg.login) ? "unfollow" : "follow"} setListUpdated={setListUpdated} setFollowSituation={setFollowSituation}/>
                )
            )}
    </div>
    </> : <div className="errtext">{errorMsg}</div>
    }
    </div>
    </>
  );
}
export default SearchPage;
