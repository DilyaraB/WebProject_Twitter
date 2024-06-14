const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
class Users {
  
  constructor(db) {
    this.db = db;
    // suite plus tard avec la BD 
  }
  

  create(login,password,lastName,firstName){
    /* Création d'un utilisateur courant*/
    return new Promise(async (resolve, reject) => {
      console.log("Creating user")
      const users =this.db.collection('users'); //acceder à la collection 
      //on crypte le mot de passe pour sécurité
      const cryptedPass = await bcrypt.hash(password,13);
      //ajouter un document user avec les parametres
      const user = users.insertOne({login:login,password:cryptedPass,lastName:lastName,
                                    firstName:firstName,followers:[],following:[],
                                    blocked:[],blockedBy:[],age:"",bio:"",interests:"",
                                    reported:"",sexe:""});
      //let userid = currentuser({_id:})
      user.then(function(result){
        console.log("login =",login)
      })
      
      if(false) {
        //erreur
        reject();
      } else {
        resolve(login.toString());
      }
    });
  }

  delete(login,password){
    /* Création d'un utilisateur courant*/
    return new Promise(async (resolve, reject) => {
      console.log("Deleting user")
      const users =this.db.collection('users'); //acceder à la collection 
      //on crypte le mot de passe pour sécurité
      const user = await users.findOne({login:login});
      if (!user){
        reject();
      }
      else {
        const compare = await bcrypt.compare(password, user.password);
        if (compare){
          const del = users.deleteOne({login:login});
          if (del){
            resolve(true);
          }
          else reject();
        }
        else reject();
      }
    });
  }

  //Renvoie l'utilisatuer correspondant à user_id
  async get(user_id) {
    return new Promise(async (resolve, reject) => {
      const users = this.db.collection('users'); //acceder a la collection users
      const user = await users.findOne({login:user_id},{projection: { _id:0, password: 0 }}); //trouver l'utilisateur ayant cet user_id/login
      console.log("users get function");

      if(user) {
        console.log(user);
        resolve(user);
      } else {
        reject();
      }
    });
  }

  //Verifie si un utilisateur avec ce login existe. Renvoe true s'il existe, false sinon.
  async exists(login) {
    const users = this.db.collection('users'); //acceder a la collection users
    const user = await users.findOne({login}); 
    return user!=null;
  }

// Verifie que cet utilisateur (avec ce login) a password pour mdp 
  async checkpassword(login,password){
      return new Promise(async (resolve, reject) => {
        const users = this.db.collection('users'); //collection users
        const user = await users.findOne({login:login}); //renvoie l'utilisateur ayant ce login
        if (!user){
          resolve(false);
        }
        else {
          const compare = await bcrypt.compare(password, user.password);
          if (compare)
            resolve(true);
          else resolve(false);
        }
      });
    
  }
//Verifie que followed est dans la liste following de follower.
  async isFollowing(follower,followed){
    //retourne true si follower follows followed :)
    const users = this.db.collection('users');
    const check = await users.findOne({login:follower, following: {$in: [followed]}});
    console.log("check=",check)
    return check;
  }

  async followers(user_id){
    return new Promise(async(resolve,reject) =>{
      const users = this.db.collection('users');
      const user = await users.findOne({login:user_id});
      const followers = user.followers
      
      if (!followers){
        reject(null);
      }
      else {
        resolve(followers)
      }
    })

  }

  async updateSettings(user_id, responses){
    const users = this.db.collection('users');
    //console.log("users updateSettings");
    const options = { upsert: true };
    const updateFields = {};

    for (const [key, value] of Object.entries(responses)) {
      console.log(responses)
      if (value) {
        updateFields[key] = value;
      }
    }

    const update = await users.updateOne({ login: user_id }, { $set: updateFields }, options);
    if (update.updateCount){
      return true;
    }
    return false;
  }
    
  


  async follow_unfollowUser(currentUser,tofollow){
    /*currentUser et tofollow sont des login/user_id */
    /*Si tofollow n'est pas dans la liste followers de currentUser, alors on ajoute tofollow dans la liste
    following de currentUser et on ajoute currentUser dans la liste followers de tofollow.
    Sinon, on enleve les utilisateurs des listes qu'ils se trouvent.*/
    const users = this.db.collection('users');
    console.log("curr = ",currentUser," fol = ",tofollow);

    //on vérifie qu'aucun utilisateur n'est bloqué
    const blocker = await users.findOne({login:currentUser}); //ajouter tofollow dans following
    const blockedList = [...blocker.blocked, ...blocker.blockedBy];
    if (! (blockedList.includes(tofollow)) ){
      const isfollowing = await this.isFollowing(currentUser,tofollow); //true si currentUser follows tofollow
      if (!isfollowing){
        //alors l'utilisateur n'est pas dans la liste following -> on le follow
        const updating = await users.updateOne({login:currentUser}, {$addToSet: {following:tofollow}}); //ajouter tofollow dans following
        await users.updateOne({login:tofollow}, {$addToSet: {followers:currentUser}}); //ajouter currentUser dans followers de tofollow
        console.log('update = ',updating);
        return "User followed";
      }
      else {
        //il est dans la liste followers, unfollow
        await users.updateOne({login:currentUser}, {$pull: {following:tofollow}}); //enlever tofollow dans following
        await users.updateOne({login:tofollow}, {$pull: {followers:currentUser}}); //enlever currentUser dans followers de tofollow
        return "User unfollowed";

      }
    }else {return "User blocked"};

  }

  async block_user(currentUser,toBlock){
    //par l'hypothèse, on sait que toBlock n'est pas encore bloqué
    const users = this.db.collection('users');
    
    //alors on le bloque
    const blocker = await users.updateOne({login:currentUser}, {$addToSet: {blocked:toBlock}}); //ajouter tofollow dans following
    const blocked = await users.updateOne({login:toBlock}, {$addToSet: {blockedBy:currentUser}}); //ajouter currentUser dans followers de tofollow

    //on gere les listes friends aussi 
    const a = await users.updateOne({login:currentUser}, {$pull: {following:toBlock}}); 
    const a2 = await users.updateOne({login:currentUser}, {$pull: {followers:toBlock}}); 
    const b = await users.updateOne({login:toBlock}, {$pull: {followers:currentUser}}); 
    const b2 = await users.updateOne({login:toBlock}, {$pull: {following:currentUser}}); 

    return blocker && blocked && a && a2 && b && b2;
  }

  async unblock_user(currentUser, toBlock){
    const users = this.db.collection('users');

    const blocker = await users.updateOne({login:currentUser}, {$pull: {blocked:toBlock}}); //ajouter tofollow dans following
    const blocked = await users.updateOne({login:toBlock}, {$pull: {blockedBy:currentUser}}); //ajouter currentUser dans followers de tofollow
    return blocker && blocked
      
  }

}

exports.default = Users;
