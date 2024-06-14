import React from 'react';
import axios from "../api/axios"
import {useState, useEffect} from "react";
import { NavLink } from 'react-router-dom';

function SettingsPage(props){

    const user=props.user;
    const [age, setAge]=useState("");
    const [sexe, setSexe]= useState("");
    const [bio, setBio]=useState("");
    const [interests, setInterests]=useState([]);
    const [reported, setReported]=useState([]);
    const [passwordEntry,setPasswordEntry]=useState('');

    useEffect(() => {
       //onsole.log("updated"); 
    },[age,sexe,bio,interests, reported]);

    //liste des choix de centres d'interet
    const optionsInterests=[ 
        {value : "sport", label : "sport"},
        {value :"food", label : "food"}, 
        {value : "news", label :"news"}, 
        {value :"travel",label : "travel"},
        {value :"reading", label: "reading"}, 
        {value :"art", label: "art"}, 
        {value :"music", label :"music"}
    ];

    const optionsSexe = ["F", "M", "X"];

    const handleOptionSelect = (event) => {
        const selectedOption = event.target.value;
        if (!interests.includes(selectedOption)) {
            setInterests([...interests, selectedOption]);
        } else {
            setInterests(interests.filter((interest) => interest !== selectedOption));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const form = event.target.form;
        form.reset();
        setAge("");
        setBio("");
        setReported("");
        setInterests([]);

        const responses ={};
        if (age){
            responses.age =age;
        }
        if(bio){
            responses.bio=bio;
        }
        if(reported){
            responses.reported=reported;
        }

        if(sexe){
            responses.sexe=sexe;
        }

        try {
            responses.interests = interests;
            console.log("interests : ",interests);
            let send = await axios.post(`/user/updateSettings/${user}`, {responses :responses, user_id : user})
            console.log("settings updated");
            console.log(send);
        } catch(err) {
            console.log(err);
            console.log('could not submit changes');
        }
    } 

    const handleDelete = async (event) => {
        event.preventDefault();
        try {
        
          await axios.delete("/user/delete/",{user,passwordEntry})
          .then(res => {
            console.log("useDeletedSuccessfully")
            props.setListUpdated(true);
          })
        }catch(err){
            console.log("user ",user," pw", passwordEntry)
          console.log("user could not be deleted");
        }
      }

      const getPasswordEntry = (event) => {
        setPasswordEntry(event.target.value);
      }
    return  (
        <div className="settings">
            <form className="settings-form" method='POST' onSubmit={handleSubmit}>
                <label> Age :  
                    <input type="number" value={age} onChange={(event) => setAge(event.target.value)}/>
                </label>

                <label> Sexe : 
                    <select value={sexe} onChange={(event) => setSexe(event.target.value)}>
                    {optionsSexe.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                </label>

                <label> Bio : 
                    <input type="text" value={bio} onChange={(event) => setBio(event.target.value)} />
                </label>
                <br></br>
                <label htmlFor="interests"> Interests :  </label>
                    {optionsInterests.map((option) => (
                    <div key={option.value}>
                        <input 
                        type="checkbox" 
                        id={option.value} 
                        value={option.value} 
                        checked={interests.includes(option.value)} 
                        onChange={(event) => handleOptionSelect(event, option.value)} 
                        />
                        <label htmlFor={option.value}>{option.label}</label>
                    </div>
                    ))}
                
                <label> Mots à signaler : 
                    <input type="text" value={reported} onChange={(event) => setReported(event.target.value)} />
                </label>
                <div className='settingsButton'>
                <button type='submit' onClick={(handleSubmit)}>Submit</button>
                <button type='reset'>Reset</button>
                </div>
                
            </form>
            
            <form>
                <label>Entrez votre mot de passe pour supprimer votre compte.</label>
                <input type="password" onChange={getPasswordEntry}></input>
                <NavLink to="/" name="Logout" onClick={(props.logout)}><button type='submit' onClick={(handleDelete)}>Supprimer le compte</button></NavLink>
                <button type='reset'>Reset</button>
            </form>
        </div>
    )
}

export default SettingsPage;