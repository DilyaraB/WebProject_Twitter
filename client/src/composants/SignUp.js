import {useState} from "react";
import axios from "../api/axios";
import logo from '../birdy_version_2_but_she_is_really_pixelated_dont_tell_this_to_her_she_gets_sad.png';


function SignUp (props) {
    /*Renvoie la formulaire de SignUp.
    Creation d'un nouvel utilisateur s'il n'existe pas d'utilisateur ayant le meme user_id/login */
    const [login, setLogin] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [validPass,setValidPass] = useState(false);

    const [password, setPassword] = useState('');
    const [pass2, setPass2] = useState('');
    const [msg, setMsg] = useState('');

    
    
    //Self explanatory mais selon le changement sur la formulaire, on modifie les states.
    const getLogin = (event) => {
        setLogin(event.target.value);
    }
    const getFirstName = (event) => {
        setFirstName(event.target.value);
    }

    const getLastName = (event) => {
        setLastName(event.target.value);
    }

    const getPassword = (event) => {
        setPassword(event.target.value);
    }

    const getPass2 = (event) => {
        setPass2(event.target.value);
    };

    //verifie que les deux entrees de mdp sont identiques
    const passVerifier = () => {
        if (password===pass2){ 
            setValidPass(true);
            return true;
        }
        return false;
    };
    //En utilisant un routeur, on crée un nouvel utilisateur. (Fonction create dans users.js du côté serveur)
    const handleSignup = async (event) => {
        const valid = passVerifier(); //si les mdp sont identiques
        if (valid) { 
            event.preventDefault();
            try {
                 await axios.post("/user/signup", {login, password, firstName, lastName} )//
                 .then(res => {
                    props.signUp(res.data.token,res.data.login);
                    console.log(res);
                    console.log(res.data)
                    setMsg(res.data.message);
                    //props.getUser(res.data.token,res.data.login)
                    //Comme login, pour que l'utilisateur reste connecté, on garde son user_id comme token
                });
                 
            }catch(err){
                setMsg(err.response.data.message);
            }
        }
        else{
            event.preventDefault(); 
            setMsg("Mots de passe différents. Entrez le même mot de passe pour deux champs.")
        }
    };



    //<h2>SIGNUP</h2> <br></br>
    return (
    <div className = "authentification">
        <h2 className="birdy">Bienvenu/e à Birdy</h2>
        <img src={logo} className="birdy-logo" alt="logo" />
        <form className="signup-form" method='POST' action=''>
            <button className="button" onClick={(props.onClick)}>Vous avez déjà un compte Birdy ? Cliquer ici pour connecter !</button>
            <label htmlFor="firstname">Prénom</label>
            <input id='firstname' onChange={getFirstName}/>
            <label htmlFor='lastname'>Nom</label>
            <input id='lastname' onChange={getLastName}/>
            <label htmlFor="signin_login">Identifiant</label>
            <input id='signin_login' onChange={getLogin}/>
            <label htmlFor="signin_pass1">Entrez votre mot de passe</label>
            <input type="password" id='signin_pass1' onChange={getPassword}/>
            <label htmlFor='signin_pass1'>Re-entrez votre mot de passe</label>
            <input type="password" id='signin_pass2' onChange={getPass2}/>
            <button onClick={(handleSignup)}>S'inscrire</button>
            <button type='reset'>Réinitialiser</button>
            <div>{msg}</div>
            
        </form>
    </div>
    )
}
//
export default SignUp;