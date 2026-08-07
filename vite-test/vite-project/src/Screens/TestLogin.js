import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import Loader from "../Components/Loader";

export default function SignUp() {
  const [isFlip, setIsFlip] = useState(false);
  const handleToggle = () => {
    setIsFlip(!isFlip);
  };

  // Loading state for simulation
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div>
          {isFlip ? (
            <SignupForm handleToggle={handleToggle} />
          ) : (
            <LoginForm handleToggle={handleToggle} />
          )}
        </div>
      )}
    </>
  );
}
