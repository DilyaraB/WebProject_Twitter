import React from 'react';
import { MdOutlineMessage } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { AiOutlineSearch} from "react-icons/ai";
import { FiSettings} from "react-icons/fi";
import { NavLink } from 'react-router-dom';

function SideBar({user,children}){
    /*Change la page affiché dans MainPage */



    const items=[ 
        {
            path: "/generalPage",
            name:"Page Générale",
            icon : <MdOutlineMessage/>
        },
        {
            path: "/messagePage",
            name:"Page Personelle",
            icon : <MdOutlineMessage/>
        },
        {
            path: `/profilePage/${user}`,
            name:"Page de Profil",
            icon : < CgProfile/>
        },
        {
            path: "/searchPage",
            name:"Page de Recherche",
            icon : < AiOutlineSearch/>
        },
        
        {
            path :`/settingsPage`,
            name: "Paramètres",
            icon : <FiSettings/>
        }
    ]
 

//<div className='bars'> <FaBars/></div>
    return <div className='colonne'>
            <div className='sidebar'>
                {
                    items.map((item, index)=> <NavLink to={item.path} className="pages" key={index} >
                        <div className='pageIcon'>{item.icon}</div>
                        <div className='pageName'>{item.name}</div>
                    </NavLink>
                    )
                }
            </div>
            <div className='main'>
                <main>{children} </main>
            </div>
        
        </div>

}

export default SideBar;