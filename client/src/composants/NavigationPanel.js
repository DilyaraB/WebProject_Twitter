import Login from './Login';
import Logout from './Logout';

function NavigationPanel (props) {
    /*Fait l'echange entre login et logout comme le TD */
    return <div className='navigPanel'> 
        <nav id='navigation_pan'>
        {props.isConnected ? <><img src={props.logo} className="birdy-logo" alt="logo" />
        <h1 className='birdy'>Birdy</h1>
         <Logout logout={props.logout} getUser = {props.getUser} /> </>: <Login logo= {props.logo} onClick = {props.onClick} login={props.login} getUser = {props.getUser}/>}
    </nav>
    </div>
}

export default NavigationPanel;