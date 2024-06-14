import {useState, useEffect} from "react";
import NavigationPanel from '../composants/NavigationPanel';
import SignUp from '../composants/SignUp';
import MessagePage from './MessagePage';
import SearchPage from './SearchPage';
import SettingsPage from './SettingsPage';
import SideBar from '../composants/SideBar';
import ProfilePage from './ProfilePage';
import GeneralPage from './GeneralPage';
import './MainPage.css';
import { Routes, Route, Navigate } from "react-router-dom";
import logo from '../birdy_version_2_but_she_is_really_pixelated_dont_tell_this_to_her_she_gets_sad.png';

function MainPage (props){
    /* Equivalent a App.js. Il affiche tous les pages et eventuellement tous les composants.
    */
    const [isConnected,setIsConnected] = useState(false); //state pour savoir si quelqu'un est connecté
    const [page, setPage] = useState("signin_page"); // state pour changer la page affiché
    const [newClient, setNewClient] = useState(false); //pour changer la page entre login et signup
    //Cette variable est passé comme props pour chaque composant car il définie l'utilisateur connecté
    const [user, setUser] = useState(''); //user_id/login d'utilisateur courant
    //pour que l'utilisateur reste connecté après qu'il recharge la page, on utilise useEffect qui 
    //verifie que user_id est gardé comme item dans localStorage
    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem('token'); //il est inutile, on le supprimera après
        const currUser = localStorage.getItem('user'); //garde user_id
        if (token && currUser) {
            setIsConnected(true);
            setNewClient(false);
            setUser(currUser);
            console.log("current user",user);
            setPage('message_page'); 
        }
        else {
            console.log('notoken')
        }
      }, [user,newClient,page]); //reload après chaque changement sur user, newClient et page

    /* getConnected est un var qui modifie les states afin de connecter l'utilisateur, il va nous 
    aider à transferer ces methodes to children en tant que "props"*/
    const getConnected = (token,usr) => {
        setIsConnected(true);
        setNewClient(false);
        setUser(usr);
        getUser(token,usr);
        setPage('message_page');
    }
    //reinitialise localStorage et MainPage après la déconnexion
    const setLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsConnected(false);
        setPage('signin_page');
    }
    
    /*Pour l'echange entre signup page et login page */
    const handleNewClient = (event) => {
        setNewClient(true);
    }
    const handleClient = (event) => {
        setNewClient(false);
    }
    //Gere localStorage
    const getUser = (token,login) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user',login);
        setUser(login);
        console.log("user=",{user});
    }
    return(
         <div >
            { isConnected === true ? 
            (<div className="MainPage2">
            <div className="ligne1">
            <div> 
                <NavigationPanel logo={logo} onClick =  {(event) => handleNewClient()} login={getConnected} logout={setLogout}  isConnected={isConnected} getUser = {getUser} />
            </div >
            </div>

            <div className="ligne2">
                        <div className="sidebar">
                                <SideBar user={user}>
                                <Routes>   
                                    <Route path="/" element={<Navigate to={`/generalPage`}/>}/>  
                                    <Route path="/login" element={<Navigate to={`/generalPage`}/>}/> 
                                    <Route path="/signup"element={<Navigate to={`/generalPage`}/>}/>
                                    <Route path="/messagePage"element={<MessagePage user={user} setPage={setPage}/>}/>
                                    <Route path="/profilePage/:user" element={<ProfilePage  user={user}/>}/>
                                    <Route path="/searchPage" element={<SearchPage user={user} />}/>
                                    <Route path="/logout" element={<Navigate to="/" />} />
                                    <Route path="/settingsPage" element={<SettingsPage user={user}/>}/>
                                    <Route path="/generalPage"element={<GeneralPage user={user} setPage={setPage}/>}/>
                                </Routes>
                                </SideBar>       
                            
                        </div>

            </div>
            
            </div>):
        <div className="MainPage"> 
            <Routes>
            {newClient === true ? <>
                <Route path="/" element={<Navigate to="/signup"/>}/>
                <Route path="/login" element={<Navigate to="/signup"/>}/>
                <Route path="/signup"element={<SignUp onClick = {(event) => handleClient()} signUp={getConnected} getUser={getUser}/>}/>
             
            </>
            :
            <>
            <Route path="/" element={<Navigate to="/login"/>}/>
            <Route path="/signup" element={<Navigate to="/login"/>}/>
            <Route path="/login"element={<NavigationPanel onClick =  {(event) => handleNewClient()} login={getConnected} logout={setLogout}  getUser = {getUser} isConnected={isConnected} />}/>
            </>
            
            } 
            </Routes>
        </div>
        }
        </div>
    )
    ;
}

export default MainPage;