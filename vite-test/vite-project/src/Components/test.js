import React, { Component, useState } from "react";
import "./App.css";
import "./style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faGlobe,
  faIndianRupeeSign,
  faStar,
  faCalendarDays,
  faList,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
export default function App() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleCancel = () => {};

  const [inputType, setInputType] = useState("text");
  const [timeInput, setTimeInput] = useState("text");

  const focusDate = () => {
    setInputType("date");
  };

  const imageUrl = "https://i.ibb.co/W6rCLY8/logo.png";
  return (
    <div class="container">
      <div class="c-head">
        <div>
          <p>Magnabox Private Limited</p>
        </div>
        <div class="logo-img">
          <img src={imageUrl} alt="" class="logo" />
        </div>
      </div>
      <div class="f-head">
        <p>Add New Lead Form</p>
        <div class="cancel">
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
      <div class="form">
        <form>
          <div class="input-group">
            <label htmlFor="name">
              Lead Name{" "}
              <sup>
                <FontAwesomeIcon
                  class="star"
                  icon={faStar}
                  className="icon"
                  color="red"
                />
              </sup>
            </label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faUser} className="icon" />
              <input
                type="text"
                placeholder="Enter Lead Name"
                className="input-field"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">
              Email ID{" "}
              <sup>
                <FontAwesomeIcon
                  class="star"
                  icon={faStar}
                  className="icon"
                  color="red"
                />
              </sup>
            </label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faEnvelope} className="icon" />
              <input
                type="text"
                placeholder="Example@anyemail.com"
                className="input-field"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">
              Phone Number{" "}
              <sup>
                <FontAwesomeIcon
                  class="star"
                  icon={faStar}
                  className="icon"
                  color="red"
                />
              </sup>
            </label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faPhone} className="icon" />
              <input
                type="text"
                placeholder="+91 98765 54321"
                className="input-field"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">
              Address{" "}
              <sup>
                <FontAwesomeIcon
                  class="star"
                  icon={faStar}
                  className="icon"
                  color="red"
                />
              </sup>
            </label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faGlobe} className="icon" />
              <input
                type="text"
                placeholder="Gurugram, India"
                className="input-field"
              />
            </div>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d874.8810426675982!2d77.1047008037567!3d28.703877171405164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03ffd33678c9%3A0xbcd4cf61c1219dfb!2sYuvashakti%20Cricket%20Academy!5e0!3m2!1sen!2sin!4v1700978464346!5m2!1sen!2sin"
            width="100%"
            height="450"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <div class="input-group">
            <label htmlFor="name">Sale Value</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faIndianRupeeSign} className="icon" />
              <input
                type="text"
                placeholder="50,00,000"
                className="input-field"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">Date</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faCalendarDays} className="icon" />
              <input
                placeholder="29 August 2023"
                class="textbox-n"
                type={inputType}
                onFocus={() => setInputType("date")}
                onBlur={() => setInputType("text")}
                id="date"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">Time</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faClock} className="icon" />
              <input
                placeholder="20:21"
                class="textbox-n"
                type={timeInput}
                onFocus={() => setTimeInput("time")}
                onBlur={() => setTimeInput("text")}
                id="date"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">Options</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faList} className="icon" />
              <input
                type="text"
                placeholder="Select Options"
                className="input-field"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">Products</label>
            <div className="input-with-icon">
              <FontAwesomeIcon icon={faList} className="icon" />
              <input
                type="text"
                placeholder="Select Products"
                className="input-field"
              />
            </div>
          </div>
          <div class="input-group">
            <label htmlFor="name">Note</label>
            <textarea
              name=""
              id=""
              placeholder="Enter Note"
              cols="30"
              rows="10"
            ></textarea>
          </div>
          <div class="submit-btn">
            <button class="submit">Add Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}







.container{
    margin: 3em;
    padding: 1em;
    background: #EBF0F4;
}

.c-head, .f-head{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}
.c-head p{
    font-size: 1.8rem;
    font-weight: bold;
}

.f-head p{
    font-size: 1.5rem;
    font-weight: bold;
    align-items: center;
}

.cancel-btn{
    color: red;
    font-weight: bold;
    background: transparent;
    outline: none;
    border: 1px solid black ;
    border-radius: 5px;
    padding: 0.6em;
    align-items: center;
    cursor: pointer;
    transition: background 0.3s;
}

.cancel-btn:hover{
    background: red;
    color: #fff;
}
.cancel{
    display: flex;
    align-items: center;
}

.form{
    margin: 3em 1em 1em 1em;
}
.logo-img{
    display: flex;
    align-items: center;
}
.logo{
    width: 15em;
}

form{
    display: flex;
    gap: 20px;
    flex-direction: column;
}

.input-group{
    display: flex;
    flex-direction: column;
    gap: 10px
}

input::placeholder{
    font-weight: bold;
}


.input-with-icon {
    position: relative;
    display: inline-block;
  }
  
  .input-with-icon .icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #3FAEFD; 
  }
  
  .input-with-icon input {
    padding-left: 40px; 
    width: 100%; 
    height: 40px;
    border: none;
    border-radius: 4px;
    box-sizing: border-box; 
  }

  textarea{
    width: 100%;
    border: none;
    border-radius: 4px;
    box-sizing: border-box; 
  }
  textarea::placeholder{
    font-weight:bold;
    font-size: 16px;
  }
  label{
    font-size: 16px;
    font-weight: bold;
  }

  .submit{
    width: 100%;
    margin-top: 2em;
    height: 3em;
    background: #3A4B86;
    color: #fff;
    font-weight: bold;
    border: none;
    border-radius: 7px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .submit:hover{
    background: #fff;
    color: #3A4B86;
  }

  .star{
    width: 9px;
  }

  @media screen and (max-width: 768px) {
    .c-head p{
        font-size: 1.5rem;
    }
    .f-head p{
        font-size: 1.2rem;
    }
  }
  
  /* Media query for even smaller window sizes */
  @media screen and (max-width: 480px) {
    .c-head p{
        font-size: 1.3rem
    }
    .f-head p{
        font-size: 1rem
        
    }
    .logo{
        width: 70%;
    }
    
  }