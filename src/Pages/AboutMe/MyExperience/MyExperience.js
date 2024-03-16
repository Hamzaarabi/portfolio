import React from 'react'
// import Button from '../../../components/Button/Button'
import './MyExperience.css'
// react-icon
import {FaCalendar} from 'react-icons/fa6'

const MyExperience = () => {
  return (
    
    <div>
     

     <br /> <br /> <br />
      <h1 className="heading"> <span> my </span> experience : </h1>
     
      <section className="container-md experience" id="experience">
      
        <div className="box-container">
            <div className="box">
                <div className="content">
                    <span className='span'><FaCalendar /> 2023-2024 </span>
                    <h3>WEB FULL STACK DEVELOPER</h3>
                    <p>3 month (2023 - 2024) at Marketing Support Services (Call Center) in Settat :
 <br />
                    <span className='mx-4'>- Website creation . </span> <br />
                    <span className='mx-4'>- Website modification . </span> <br />
                    <span className='mx-4'>- SEO (Search Engine Optimization). </span> <br />
                    <span className='mx-4'>- Data management. </span> <br />
                    <span className='mx-4'>- SEO (Search Engine Optimization). </span> <br />
                    <span className='mx-4'>- And other tasks within the company. </span> <br />
                    <span className='mx-4'>- Web scraping . </span>
                    
                    
                    
                
                    </p>
                </div>
            </div>
        </div>
      </section>



        <section className="container-md experience" id="experience">
        
        <div className="box-container">
            <div className="box">
                <div className="content">
                    <span className='span'><FaCalendar /> 2023 </span>
                    <h3>INTERNSHIP</h3>
                    <p>1 month (March 2023) at  Court of First Instance in Settat: <br />
                    <span className='mx-4'>- Gained new skills in communication, problem-solving, and teamwork.</span> <br />
                    <span className='mx-4'>    Valuable opportunity for growth.</span>  <br />
                    <span className='mx-4'>     Grateful for the experience. </span></p>
                </div>
            </div>
        </div>
      </section>
    </div>
  )
}

export default MyExperience