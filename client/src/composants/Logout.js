import { NavLink } from 'react-router-dom';
function Logout (props) {
    /*Si l'utilisateur est connecté, il deconnecte. */
    return <div>
        <NavLink to="/" name="Logout" className="logoutBtn" onClick={(props.logout)}><button className="logoutBtn">Déconnexion</button></NavLink>
    </div>
}

export default Logout;