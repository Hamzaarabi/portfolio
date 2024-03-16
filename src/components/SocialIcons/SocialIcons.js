import React from 'react'
import './SocialIcons.css'
// react icons
import { FaGithub, FaLinkedin} from "react-icons/fa6";

const SocialIcons = () => {
  return (
    <div className='SocialIcons'>  
        <a href='https://github.com/Hamzaarabi' className="github">
          <span><FaGithub /></span>     
        </a>
        <a href='https://www.linkedin.com/in/hamza-arabi/' className="linkedin">
          <span><FaLinkedin /></span>           
        </a>
    </div>
  )
}

export default SocialIcons