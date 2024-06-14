const jwt = require('jsonwebtoken');
const {ObjectId} = require('mongodb');
//Tres  similaire à TD
class Messages {
  
  constructor(db) {
    this.db = db;
    // suite plus tard avec la BD 
  }
  
  
  create(login,messagetext){
    /* Création d'un message par l'utilisateur courant*/
    console.log("Creating message");
    const date = new Date(); //date de création
    const messages =this.db.collection('messages'); //on accède à la collection messages
    const msg = {login:login,message:messagetext,createdAt:date,nbLike:0,likedBy:[]}; //on crée le document de message
    //on insere le message dans la collection  messages
    return messages.insertOne(msg)
    .then(result => {
      console.log("message created", msg);
      return msg;
    })
    .catch(error => {
      console.log('could not send the message',error);
      throw error;
    });
}

makeComment(msg_id,login,messagetext){
  /* Création d'un commentaire par l'utilisateur courant*/
  
  return new Promise(async (resolve, reject) => {
    const messages = this.db.collection('messages');
    const id = new ObjectId(msg_id);
    //user already liked the message or not 
    const message = await messages.findOne({_id:id}); //liste contenant les utilisateurs qui ont aimé le message


    const comment = {comment:messagetext,commentBy:login}; //on crée le document de message
      //on insere le message dans la collection  messages
    let resultat = null;
    if (message){
      resultat = await messages.updateOne({_id:id}, {$addToSet:{comments:comment}}); //incrementer like + ajouter l'utilisateur dans la liste likedBy

    }
    if(resultat.modifiedCount===1) {
      resolve(true);
    } else {
      resolve(false);
    }
    
  });
}
     

//Renvoie la liste antichronologique des messages envoyé par l'utilisateur ayant cet user_id
 async getMessagesBy(user_id) {
      const messages = this.db.collection('messages'); //acceder à la collection des messages
      const messagesFrom = [user_id]; //la liste des login qu'on va faire le query avec (ici c'est que user_id)
      //si login d'un message est dans messagesFrom, on le garde.
      const msgs = await messages.find({login:{$in : messagesFrom}}).sort({createdAt:-1}).toArray(); //array des messages envoyés par l'utilisateur ayant user_id
      return msgs;
    
  }

//Renvoie la liste antichronologique des messages envoyé (Birdy Global) 
//Sauf les messages des utilisateurs dans blocked et blockedBy
async getMessages(user_id) {
  const messages = this.db.collection('messages'); //acceder à la collection des messages
  const users = this.db.collection('users');
  const user = await users.findOne({login:user_id});
  const blockedList = [...user.blocked, ...user.blockedBy];
  const message = await messages.find({login : {$nin : blockedList}}).sort({createdAt:-1}).toArray(); // On utilise RegExp pout creer un regex object afin de faire un query plus efficacement

  return message;
}
//Renvoie la liste antichronologique messages contenant le string donnée (not implemented yet)
async getMessagesContaining(user_id,str) {
  const messages = this.db.collection('messages');//acceder à la collection des messages
  //la liste antichronologique des messages contenant le str
  console.log(str)
  const regex = new RegExp(str, 'mi'); // create a regular expression object with the 'str' variable
  
  //si blocked => on n'affiche pas les messages
  const users = this.db.collection('users');
  const user = await users.findOne({login:user_id});
  const blockedList = [...user.blocked, ...user.blockedBy];
  const message = await messages.find({login : {$nin : blockedList},
                                    $or: [
                                      { message: { $regex: regex } },
                                      { login: { $regex: regex } }
                                    ]
                                      }).sort({createdAt:-1}); // On utilise RegExp pout creer un regex object afin de faire un query plus efficacement

  if (message) {
    return message.toArray();
  }
  return [];
}

  delete(login,message){
    /* Création d'un utilisateur courant*/
    return new Promise(async (resolve, reject) => {
      console.log("Deleting messager")
      const messages =this.db.collection('messages'); //acceder à la collection 
      
      const msg = messages.deleteOne({login:login,_id : new ObjectId(message)});
      //let userid = currentuser({_id:})

      if(msg.deletedCount) {
        //erreur
        resolve(true);
      } 
      resolve(false);
    });
  }

  //renvoie la liste antichronologique des messages envoyés par l'utilisateur ayant login et ses amis (donc Timeline)
  async getMessagesForUser(login){
    const messages = this.db.collection('messages');//acceder à la collection des messages
    const users = this.db.collection('users');//acceder à la collection des users
    const following = await users.findOne({login:login},{following:1})//amis d'utilisateur courant
    const messagesFrom = [login, ...following.following]; //la liste des utilisateurs qui ont envoyé les messages (donc l'utilisateur et ses amis)
    const msgs = await messages.find({login:{$in : messagesFrom}}).sort({createdAt:-1}).toArray(); //liste des messages anti-chrono
    return msgs;
  }
  

  async like_unlike(currUser,msg_id){
    return new Promise(async (resolve, reject) => {
      const messages = this.db.collection('messages');
      const id = new ObjectId(msg_id);
      //user already liked the message or not 
      const messageLiked = await messages.findOne({_id:id,likedBy : {$in:[currUser]}}); //liste contenant les utilisateurs qui ont aimé le message
      let resultat = null;
      if (messageLiked){
        resultat = await messages.updateOne({_id:id}, {$inc: {nbLike: -1}, $pull: {likedBy: currUser}}); //incrementer like + ajouter l'utilisateur dans la liste likedBy

      }else {
        resultat = await messages.updateOne({_id:id}, {$inc: {nbLike:1},$addToSet:{likedBy:currUser}})
      }
      if(resultat.modifiedCount===1) {
        resolve(true);
      } else {
        resolve(false);
      }
      
    });
  }

  async getNbLikes(msg_id){
    return new Promise(async (resolve, reject) => {
      const messages = this.db.collection('messages');
      const id = new ObjectId(msg_id);

      //[...following, login] car l'utilisateur veut voir ses propres messages sur timeline aussi
      const msg = await messages.findOne({_id:id}); //liste contenant les utilisateurs qui ont aimé le message
      
      if(msg) {
        resolve(msg.like);
      } else {
        reject();
      }
      
    });
  }

  //On verifie qu'un utilisateur a envoyé ce message
  async exists(login,message) {
    const messages = this.db.collection('messages');
    const msg = await users.findOne({login,message});
    return msg!=null;
  }



}

exports.default = Messages;

