import {useState, useEffect} from "react";
import axios from "../api/axios"
import { NavLink } from 'react-router-dom';

function Message (props) {
    /* Le composant message serve a afficher et liker les messages, follow/unfollow l'utilisateur 
    qui a envoyé ce message. Et eventuellement le lien vers le profile du sender (Pas encore implementé).
    Il renvoie le message, le sender, la date, le bouton pour follow et le bouton pour liker.
    */
    const msg_id = props.msg_id;
    const message = props.msg;
    const login = props.log;
    const date = new Date(props.date).toLocaleString();
    const likedBy = props.likedBy;
    const currUser = props.currUser;
    const follow = props.following;
    const comments = props.comments;
    const [showComments,setShowComments] = useState(true);
    const [currentComment,setCurrentComment] = useState("");
    //follow/unfollow n'est pas compléte. Normalement, le bouton affichera follow ou unfollow selon le cas
    //(pour cela on doit avoir la liste des followers du sender et on n'a pas encore implementé ce service.)

    useEffect(() => {
      console.log("nb Like ",props.like);
    },[props.like,follow,currUser,likedBy]);
    
    const handleLike = async (event) => {
        //likes message
        event.preventDefault();
        try {
          //on utilise le routeur pour regarder si on deja follow cet utilisateur, si oui, on unfollow, sinon, on follow
          //donc on modifie les listes following/follower de ces utilisateurs
            await axios.put("/message/like_unlike", {currUser,msg_id});
            
            console.log("like/unlike successfull");
            console.log("msg_id ",msg_id," liked by ",currUser);
            props.setListUpdated(true);
            
              
            
        }catch(err){
          console.log("problem during like/unlike ");
        }
    }

    const handleFollow = async (event) => {
        event.preventDefault();
        try {
          //on utilise le routeur pour regarder si on deja follow cet utilisateur, si oui, on unfollow, sinon, on follow
          //donc on modifie les listes following/follower de ces utilisateurs
            await axios.put("/user/followunfollow/login", {currentUser:currUser,tofollow:login})
            .then(res=>{
              //props.setListUpdated(true);
              console.log("follow unfollow achieved");
              props.setListUpdated(true);
            });
            
        }catch(err){
          console.log("problem during follow unfollow ");
        }
    }

    const handleDelete = async (event) => {
      event.preventDefault();
      try {
        await axios.delete(`/message/delete/${currUser}/${msg_id}`)
        .then(res => {
          console.log("messageDeletedSuccessfully")
          props.setListUpdated(true);
        })
      }catch(err){
        console.log(err);
        console.log("message could not be deleted");
      }
    }


  const handleComment = async(event) => {
    try {
      await axios.put("/message/makeComment",{msg_id:msg_id,login:currUser,message:currentComment})
      .then(res => {
        console.log("comment made successfully")
        props.setListUpdated(true);
      })
    }catch(err){
      console.log("error whilst commenting");
    }
  }
  const getCurrentComment = (event) => {
    setCurrentComment(event.target.value);
  }

 //quand on clique sur @user_id, on ouvre la Profile Page de cet utilisateur
    return (
      <>
        <div className='message' id='message'>
        <NavLink to={ `/profilePage/${login}`} className="profiLink">@{login}</NavLink> 
        { login!== currUser ? (<button className='followButton' onClick={(handleFollow)}>{follow}</button>): <button className='deleteButton' onClick={(handleDelete)}>Supprimer Message</button>}
        <div className='text'>{message}</div>
        <p className='date'>{date}</p>
        <button className='like' onClick={(handleLike)}>{likedBy.includes(currUser) ? "Unlike" : "Like"}:{props.nbLike}</button>
        <button className='showComments' onClick={(event)=> {setShowComments(!showComments)}}>Commentaires</button>
        <form className='makeComment'>
          <label className="commenter">Commenter : </label>
          <input type='text' onChange={getCurrentComment}></input>
          <button type='submit' onClick={(handleComment)}>Envoyer votre commentaire</button>
        </form>
        <div className = 'murComments'>{showComments ? <div >

          {comments ? comments.map(({comment,commentBy}, index) => 
            
            <div className="comments" key={commentBy+index}>
            <NavLink to={ `/profilePage/${commentBy}` } className="profiLinkComment" > Commentaire de @{commentBy} : </NavLink>
            <div className='text_comment'>{comment}</div>
            </div>
          ):<></>}

        </div> : <></> }
        </div>
    </div>
    </>
    
    )
}
export default Message;