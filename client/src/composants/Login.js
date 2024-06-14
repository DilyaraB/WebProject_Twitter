import {useState} from "react";
import axios from "../api/axios";
import logo from '../birdy_version_2_but_she_is_really_pixelated_dont_tell_this_to_her_she_gets_sad.png';


function Login (props) {
    /*Composant pour login : On verifie que l'utilisateur existe et le mdp est bon. On fait la connection. 
        Il retourne la formulaire de login
    */
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState("");
    
    //Change selon entrée dans input login
    const getLogin = (event) => {
        setLogin(event.target.value);
    }
    //Change selon entrée dans input de mdp
    const getPassword = (event) => {
        setPassword(event.target.value);
    }
    //En utilisant les informations fournis, verifie que l'utilisateur existe et le mdp est bon,
    //il utilise la fonction getConnected qui est dans MainPage pour connecter cet utilisateur 
    //et on garde son login/user_id comme token
    const handleLogin = async (event) => {
        event.preventDefault(); //
        try {
             await axios.post("/user/login", {login, password})
             .then(res => {
                console.log(res);
                console.log("resdata",res.data);
                console.log("token = ",res.data.token);
                console.log("login = ",res.data.login);
                //props.getUser(res.data.token,res.data.login);
                props.login(res.data.token,res.data.login);
                setMsg(res.data.message);
            });
             
            //navigate("/");
        }catch(err){
            /*if(err.response.status==403)
                setErrorMsg("Problème au cours de la connexion. Réessayez");
            if(err.response.status==500)
                setErrorMsg("Erreur inconnue. Vérifiez votre connexion.");
            if(err.response.status==401)
                setErrorMsg("Utilisateur inconnu");*/
                setMsg(err.response.data.message)
        }

};
//Retourne formulaire de login
    return (
    <div className = "authentification">
        <h2 className="birdy">Bienvenu/e à Birdy</h2>
        <img src={logo} className="birdy-logo" alt="logo" />
        <form className="login-form" method='POST' action=''>
            <button onClick={(props.onClick)}>Vous n'avez pas de compte Birdy ? Cliquez ici pour créer votre compte !</button>
            <label htmlFor='login'>Identifiant</label>
            <input id='login' type='text' onChange={getLogin}/>
            <label htmlFor='mdp'>Mot de passe</label>
            <input id='mdp' type='password' onChange={getPassword}/>
            <button onClick={(handleLogin)}type='submit'>Soumettre</button>
            <button type='reset'>Réinitialiser</button>
        </form>
        <div>{msg}</div>
    </div>
    
    )
}

export default Login;