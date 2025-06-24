import React from 'react'
import './Main.css'
import { assets } from '../../assets/assets'

const Main = () => {


     
  return (
   <div className="main">
    <div className="nav">
        <p>Spark</p>
        <img src={assets.ab} alt="" />
    </div>
    <div className="main-container">
        <div className="greet">
            <p><span>Hello,Siva.</span></p>
            <p>How can I help you today</p>
        </div>
        <div className="cards">
            <div className="card">
                <p>Suggest rich places to see on an upcoming road trip</p>
                <img src={assets.compass} alt="" />
            </div>
            <div className="card">
                <p>Brainstrom team bonding activities for our work</p>
                <img src={assets.light} alt="" />
            </div>
            <div className="card">
                <p>Summarize  your activities</p>
                <img src={assets.message} alt="" />
            </div>
            <div className="card">
                <p>
                    Improve the readability of the following code
                </p>
                <img src={assets.code} alt="" />
            </div>
        </div>
        <div className="main-bottom">
            <div className="search-box">
                <input type="text" placeholder='Enter a prompt here' />
                <div>
                    
            <img src={assets.picture} alt="" />
            <img src={assets.mic} alt="" />
            <img src={assets.send} alt="" />
            

           
            </div>
           
            </div>
            <p className="bottom-info">
            spark may display inaccurate about people,so double-check its responses .Your privacy and spark.
        </p>
        </div>
        
    </div>
   </div>
  )
}

export default Main