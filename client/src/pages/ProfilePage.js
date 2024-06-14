import React from 'react';
import axios from "../api/axios"
import {useState, useEffect} from "react";
import { useParams, NavLink } from 'react-router-dom';
import Message from '../composants/Message';
import {ImProfile} from "react-icons/im";

function ProfilePage(props){
    /* Affiche les informations sur l'utilisateur et les messages qu'il a envoyé.*/
    //On ajoutera le bouton follow/unfollow aussi.

    const {user}=useParams(); //change selon user_id passé au path 
    const currUser = props.user;
    const [firstName, setfirstName]=useState('');
    const [lastName, setlastName]=useState('');
    const [login, setLogin]=useState('');
    const [bio, setBio]=useState('');
    const [blocked, setBlocked] = useState([]);
    const [blockedBy, setBlockedBy] = useState([]);
    const [blockSituation, setBlockSituation] = useState("");
    const [messages, setMessages]=useState([]);
    const [followers, setFollowers]=useState([]);
    const [following, setFollowing]= useState([]);
    const [followSituation, setFollowSituation] = useState("");
    const [listUpdated, setListUpdated] = useState(false);
    const [getfollowers, setGetfollowers]=useState(false);
    const [getfollowing, setGetfollowing]=useState(false);



    //reload de page declenche cet effet
    useEffect(() => {
        //Renvoie les informations sur l'utilisateur ayant cet userid en utilisant un router et la fonciton get dans users.js (côté serveur)
    
        getProfile();
        getMessages();
        setListUpdated(false); //reinitialiser
        console.log(followSituation);
        
        console.log("curr user viewing this profile : ",currUser);
    }, [user,currUser,blockSituation,listUpdated,followSituation]);

    const getProfile = async () =>{
        console.log({user});
        try{
             await axios.get(`/user/${user}`)
            .then(res =>{
                console.log("user received");
                //res.data est user
                console.log(res.data)
                setfirstName(res.data.firstName);
                setlastName(res.data.lastName);
                setLogin(res.data.login);
                setFollowers(res.data.followers);
                setBio(res.data.bio);
                console.log("am i working:");
                console.log(followers)
                setFollowing(res.data.following);
                console.log("blocked by", res.data.blockedBy)
                setBlocked(res.data.blocked);
                setBlockedBy(res.data.blockedBy);
                
            });

            
        }catch(err){
            console.log("user could not be received ");
        }finally{
            if (followers.includes(currUser)){
                setFollowSituation("unfollow");
            }
            else {
                setFollowSituation("follow");
            }
        }
    }

    
    //Modifie la variable messages. Avec la fonction getMessagesBy dans messages.js (côté serveur)
    //on garde la liste des messages envoyés par l'utilisateur de ce profile
    const getMessages = async() =>{

        try{
            await axios.get(`/message/${user}`)
            .then(res =>{
                console.log("user messages received");
                setMessages(res.data)
            });
        }catch(err){
            console.log("user messages could not be received ");
        }
    }
    

    const handleFollow = async (event) => {
        event.preventDefault();
        try {
            //on utilise le routeur pour regarder si on deja follow cet utilisateur, si oui, on unfollow, sinon, on follow
            //donc on modifie les listes following/follower de ces utilisateurs
                await axios.post("/user/followunfollow/login", {currentUser:currUser,tofollow:login});
                
            }catch(err){
            console.log("problem during follow unfollow ");
            console.log(err)
            }finally {
                updateFollowSituation();
            }
        
    }

    const handleFollowingList = async (event,user) => {
        event.preventDefault();
        try {
            //on utilise le routeur pour regarder si on deja follow cet utilisateur, si oui, on unfollow, sinon, on follow
            //donc on modifie les listes following/follower de ces utilisateurs
            await axios.put("/user/followunfollow/login", {currentUser:currUser,tofollow:user});
                
            }catch(err){
            console.log("problem during follow unfollow ");
            console.log(err)
            }finally {
                updateFollowSituation();
            }
    }
    
        const handleBlock = async (event) => {
            event.preventDefault();
            try {
                if (blockedBy.includes(currUser)){
                    await axios.put("/user/unblock/login",{currentUser:currUser,toBlock:login});
                }
                else {
                    await axios.put("/user/block/login",{currentUser:currUser,toBlock:login});
                }
            }catch(err){
                console.log("problem during block unblock");
            }finally{
                updateBlockSituation();
                setListUpdated(true);
            }
        }

    const getFollowers =(event)=> {
        setGetfollowers(!getfollowers);

    }

    const getFollowing=(event)=>{
        setGetfollowing(! getfollowing);
    }

    const updateBlockSituation = () =>{
        if (blockedBy.includes(currUser)){
            setBlockSituation("unblock");
        }
        else {
            setBlockSituation("block");
        }
    }

    const updateFollowSituation = () => {
        if (followers.includes(currUser)){
            setFollowSituation("unblock");
        }
        else {
            setFollowSituation("block");
        }
    }




    return <div className='profilePage'>
    <div className='profile'>
    <div className='photoProfile'><ImProfile/></div>
    <div className='nomPrenom'>
        <h2 className='prenom'>{firstName} </h2>
        <h2 className='nom'> {lastName}</h2>
    </div>
    </div> 
    <div className='bio'>{bio}
    </div>
    <div className="buttons">
        { user!== currUser ? <> 
                            
                            {blocked.includes(currUser)  || blockedBy.includes(currUser)? <></> : <button className='followButton' onClick={(handleFollow)}>{followSituation === "follow" ? "Follow" : "Unfollow"}</button>}
                            <button className='blockButton' onClick={(handleBlock)}>{blockedBy.includes(currUser) ? "unblock" : "block"}</button>
                            </>
                            :<></>
        }
    </div>
    <div>
    {
        blockedBy.includes(currUser) ? <h2>Vous avez bloqué/e ce compte. Débloquer pour voir son profil.</h2> :
        blocked.includes(currUser) ? <h2> Vous êtes bloqué/e par ce compte. Impossible de voir son profil.</h2> :
        <>
        <div className='followersFollowing'>
             
            

            <div className='followersList'>
            <button onClick={getFollowers}>Followers</button>
            {getfollowers === true? followers.map((user, index) => <NavLink to={ `/profilePage/${user}`} key={index} className="profiLink"> @{user}</NavLink>): <></>}
            </div>

            <div className='followingList'>
            <button onClick={getFollowing}>Following</button>
            {getfollowing === true? following.map((user, index) => 
            <div>
            <NavLink to={ `/profilePage/${user}`} key={index} className="profiLink"> @{user}</NavLink>
            <button className='followButton' onClick={(e) => (handleFollowingList(e,user))}>Unfollow</button>
            </div>)
            : <></>}
            
            </div>
            
        </div>
        
        
        <div className = 'Messages'>
            {messages.map(msg =>(
                <Message className ='message' key = {msg._id} msg_id={msg._id} msg={msg.message} log={msg.login} 
                                                date = {msg.createdAt} nbLike={msg.nbLike} likedBy={msg.likedBy} comments={msg.comments}
                                                currUser = {props.user} following={followSituation} 
                                                setListUpdated={setListUpdated} setFollowSituation={setFollowSituation}/>
                )
            )}
        </div>
    
        </>
    }
    </div>
    </div>
}


export default ProfilePage;