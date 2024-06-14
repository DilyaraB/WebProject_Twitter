const express = require("express");
const jwt = require('jsonwebtoken');
const Users = require("./entities/users.js");
const Messages = require("./entities/messages.js");
// Assez identique au TD
function init(db) {
    const router = express.Router();
    // On utilise JSON
    router.use(express.json());
    // simple logger for this router's requests
    // all requests to this router will first hit this middleware
    router.use((req, res, next) => {
        console.log('API: method %s, path %s', req.method, req.path);
        console.log('Body', req.body);
        next();
    });
    const users = new Users.default(db); // entity users 

    //router pour login.
    router.post("/user/login", async (req, res) => {
        try {
            const { login, password } = req.body;
            // Erreur sur la requête HTTP 
            if (!login || !password) {
                res.status(400).json({
                    status: 400,
                    "message": "Requête invalide : login et password nécessaires"
                });
                return;
            }
            if(! await users.exists(login)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            //on utilise la fonction checkpassword dans users.js pour verifier que le mdp entré correspond à cet utilisateur
            let userid = await users.checkpassword(login, password);
            if (userid) {
                // Avec middleware express-session
                req.session.regenerate(function (err) {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: "Erreur interne"
                        });
                    }
                    else {
                        // C'est bon, nouvelle session créée
                        //req.session.userid = login;
                        const token = jwt.sign({login:login},'key')
                        //res.json({token:token})
                        res.status(200).json({
                            token:token,
                            login:login,
                            status: 200,
                            message: "Login et mot de passe accepté"
                        });
                    }
                });
                return;
            }
            // Faux login : destruction de la session et erreur
            req.session.destroy((err) => { });
            res.status(403).json({
                status: 403,
                message: "login et/ou le mot de passe invalide(s)"
            });
            return;
        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    //router pour acceder a un utilisateur.
    router
        .route("/user/:user_id")
        .get( async (req, res) => {
        //const {user} = req.body;
        try {
            //on utilisa la fonction get dans users.js qui renvoie l'utilisateur ayant user_id s'il existe
            const user = await users.get(req.params.user_id);
            console.log("api get function");
            if (!user)
                res.sendStatus(404);
            else
                res.send(user);
        }
        catch (e) {
            res.status(500).send(e);
        }
    });
    //suppression d'un utilisateur ayant ce user_id
     //suppression d'un utilisateur ayant ce user_id
     //
     router.delete(`/user/delete`, async (req, res)=> {
        const {user,passwordEntry} = req.body;
        if (!user || !passwordEntry) {
            res.status(400).send("Missing fields");
        }
        users.delete(user,passwordEntry)
            .then(()=>{res.status(200).json({status:200,message : 'User supprimé'}); return;})
            .catch((err) => res.status(500).send("User not found"))
        
    });
    //router pour SignUp 
    router.post("/user/signup", async (req, res) => {
        try{
            const { login, password, lastName, firstName } = req.body;
            if (!login || !password || !lastName || !firstName) {
                console.log(login,password,lastName,firstName);
                res.status(400).json({
                    status: 409,
                    message:"Il existe des champs vides."
                });
                return;
            } 
            if( await users.exists(login)) {
                res.status(409).json({
                    status: 409,
                    message: "Conflit : il existe un utilisateur avec cet identifiant. Essayez un autre."
                });
            }else {
                // Avec middleware express-session
                req.session.regenerate(function (err) {
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            message: "Erreur interne"
                        });
                    }
                    else {
                        const token = jwt.sign({login:login},'key');//on cree token de user_id
                        //res.json({token:token})
                        users.create(login, password, lastName, firstName)
                            .then((userid) => 
                            res.status(201).json({
                                token:token,
                                login:login,
                                status: 201,
                                message: "Utilisateur créé"
                            }))
                            .catch((err) => res.status(500).send(err));
                        
                        //console.log("id",userid) 
                    }
                });
                return;
            }
            // Faux login : destruction de la session et erreur
            req.session.destroy((err) => { });
            res.status(403).json({
                status: 403,
                message: "login et/ou le mot de passe invalide(s)"
            });
            return;
        }catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    //router pour changer les parametres de user
    router.post("/user/updateSettings/:user_id", async(req, res)=>{
        const {user_id,responses} = req.body;
        //console.log("api post updateSettings");
        if(! await users.exists(user_id)) {
            res.status(401).json({
                status: 401,
                message: "Utilisateur inconnu"
            });
            return;
        }
        const update = users.updateSettings(user_id, responses)
            .then( (user_id)=> res.status(201).send("updated successfully"))
            .catch((err)=>res.status(500).send(err));
    });

    //router pour gerer follow et unfollow 
    router.put("/user/followunfollow/:usertofollow", async (req, res) => {

        const { currentUser, tofollow } = req.body;
        if (!currentUser || !tofollow) {
            console.log(currentUser,tofollow);
            res.status(400).send("Missing fields");
        } 

        if(! await users.exists(tofollow)) {
            res.status(401).json({
                status: 401,
                message: "Utilisateur inconnu"
            });
            return;
        }
        try{
        //cette fonction modifie les listes selon le cas 
        let flw = await users.follow_unfollowUser(currentUser, tofollow);
        if (flw=="User followed") {
            res.status(201).json({
                status:201,
                message:"Follow done"
            });
            return;
        }
        if (flw=="User unfollowed"){
            res.status(201).json({
                status:201,
                message:"Unfollow done"
            });
            return;
        }
        if(flw=="User blocked")
        res.status(400).json({
            status:400,
            message:"Problem during follow unfollow, either you are blocked by the user or you blocked the user."
        });
        }catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
        
    }); 

    router.put("/user/block/:login", async (req, res) => {

        const { currentUser, toBlock } = req.body;
        if (!currentUser || !toBlock) {
            console.log(currentUser,toBlock);
            res.status(400).send("Missing fields");
        } 
        
        if(! await users.exists(toBlock)) {
            res.status(401).json({
                status: 401,
                message: "Utilisateur inconnu"
            });
            return;
        }

        try {const resultat = users.block_user(currentUser, toBlock) ;
        
            if (resultat){
                res.status(201).json({
                    status:201,
                    message:"Block done (Nothing happened if already blocked."
                });
                return;
            }
            
        }catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
        
    }); 

    router.put("/user/unblock/:login", async (req, res) => {

        const { currentUser, toBlock } = req.body;
        if (!currentUser || !toBlock) {
            console.log(currentUser,toBlock);
            res.status(400).send("Missing fields");
        } 
        if(! await users.exists(toBlock)) {
            res.status(401).json({
                status: 401,
                message: "Utilisateur inconnu"
            });
            return;
        }

        try {const resultat = users.unblock_user(currentUser, toBlock) ;
        
            if (resultat){
                res.status(201).json({
                    status:201,
                    message:"Unblock done (Nothing happened if not blocked."
                });
                return;
            }
            
        }catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
        
    }); 

    //PARTIE MESSAGE

    const messages = new Messages.default(db); //entité messages

    //routeur pour gerer la demande d'envoie d'un message
    router.post("/message/sendMessage", async (req, res) => {
        try {
            const { login, message } = req.body;
            // Erreur sur la requête HTTP
            if (!login || !message) {
                res.status(400).json({
                    status: 400,
                    "message": "Requête invalide : login et entrée de message nécessaires"
                });
                return;
            }
            if(! await users.exists(login)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            
            else {
                //creation du message si l'utilisateur existe et tous les informations nécessaires sont fournies
                messages.create(login, message)
                    .then((msg) => res.status(201).send(msg))
                    .catch((err) => res.status(500).send(err));  
                //console.log("id",userid) 
            }

        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    router.put("/message/makeComment", async (req, res) => {
        try {
            const { msg_id,login, message } = req.body;
            // Erreur sur la requête HTTP
            if (!login || !message) {
                res.status(400).json({
                    status: 400,
                    "message": "Requête invalide : user et entrée du commentaire nécessaires"
                });
                return;
            }
            if(! await users.exists(login)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            
            else {
                //creation du message si l'utilisateur existe et tous les informations nécessaires sont fournies
                messages.makeComment(msg_id,login, message)
                    .then((msg) => res.status(201).send("Comment made successfully"))
                    .catch((err) => res.status(500).send(err));  
                //console.log("id",userid) 
            }

        }
        catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });

    //like/unlike
    router.put("/message/like_unlike",async (req, res) =>{
        try {
            const {currUser,msg_id} = req.body;
            if (!currUser || !msg_id) {
                res.status(400).json({
                    status: 400,
                    "message": "Requête invalide : userid et message_id nécessaires"
                });
                return;
            }
            const result = messages.like_unlike(currUser,msg_id);
            if (result) {
                res.status(201).json({
                    status: 201,
                    message: "Message liked if not liked already, unliked if liked before."
                });
                return;
            }else {
                res.status(404).json({
                    status:404,
                    message:"Message not found"
                });
                return;
            }
        }catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });



    router.delete("/message/delete/:user_id/:message", async(req, res)=> {
        try {
            const deleteRes= messages.delete(req.params.user_id,req.params.message)
            if(deleteRes){
                res.status(200).json({message : 'Message supprimé'});
                return;
            }else{
                res.status(400).send("Impossible de supprimer ce message. Soit vous n'êtes pas l'expediteur soit il n'existe pas.");
                return;
            }                 
        }catch (e) {
            // Toute autre erreur
            res.status(500).json({
                status: 500,
                message: "erreur interne",
                details: (e || "Erreur inconnue").toString()
            });
        }
    });



    // router pour acceder aux messages envoyés par user_id
    router
        .route("/message/:user_id")
        .get(async (req, res) => {
        try {
            if(! await users.exists(req.params.user_id)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            const msgs = await messages.getMessagesBy(req.params.user_id);
            if (!msgs)
                res.sendStatus(404);
            else
                res.send(msgs);
        }
        catch (e) {
            res.status(500).send(e);
        }
    });
    // router pour acceder aux messages à afficher sur TimeLine d'utilisateur courant (donc ses propres messages et les messages de ses amis)
    router
        .route("/message/timeline/:login")
        .get(async (req, res) => {
        try {
            if(! await users.exists(req.params.login)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            //retourne le mur de messages de followers + utilisateur courant
            const msgs = await messages.getMessagesForUser(req.params.login);
            if (!msgs)
                res.sendStatus(404);
            else
                res.send(msgs);
        }
        catch (e) {
            res.status(500).send(e);
        }
    });


    // router pour acceder aux messages contenant un string donnée
    router
        .route("/message/containing/:login/:messagesContaining")
        .get(async (req, res) => {
        try {
            if(! await users.exists(req.params.login)) {
                res.status(401).json({
                    status: 401,
                    message: "Utilisateur inconnu"
                });
                return;
            }
            const msgs = await messages.getMessagesContaining(req.params.login,req.params.messagesContaining);
            if (!msgs)
                res.sendStatus(404);
            else
                res.send(msgs);
        }
        catch (e) {
            res.status(500).send(e);
        }
    });


    router
        .route("/message/allmessages/:login")
        .get(async (req, res) => {
            try {
                if(! await users.exists(req.params.login)) {
                    res.status(401).json({
                        status: 401,
                        message: "Utilisateur inconnu"
                    });
                    return;
                }
                //retourne le mur de messages de followers + utilisateur courant
                const msgs = await messages.getMessages(req.params.login);
                console.log("msgs",msgs);
                if (!msgs)
                    res.sendStatus(404);
                else
                    res.send(msgs);
            }
            catch (e) {
                res.status(500).send(e);
            }
        });


    
    
    return router;
}
exports.default = init;
