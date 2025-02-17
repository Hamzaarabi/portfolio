import React from 'react'
import { FaCalendar } from 'react-icons/fa6'
import './MyEducation.css'

const MyEducation = () => {
  return (
      <>
        <section className="container-md education" id="education">
          <h1 className="heading"> <span> my </span> education : </h1>
          <div className="box-container">
              <div className="box">
                  <div className="content">
                      <span className='span'><FaCalendar /> 2020 - 2021 </span>
                      <h3>LYCEE AL AMAL </h3>
                      <p>High School Diploma, Life and Earth Sciences</p>
                  </div>
              </div>
              <div className="box">
                  <div className="content">
                      <span className='span'><FaCalendar /> 2021 - 2023 </span>
                      <h3>ISTA NTIC SETTAT</h3>
                      <p>Diploma in Digital Development (Web full stack option)</p>
                  </div>
              </div>


              <div className="box">
                  <div className="content">
                      <span className='span'><FaCalendar /> 2024 - 2025 </span>
                      <h3>ENSA KENITRA</h3>
                      <p>Licence in Génie informatique and digitalisation</p>
                  </div>
              </div>

          </div>
        </section>
      </>
  )
}

export default MyEducation