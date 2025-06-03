import React from "react";

const Navigation = ({ onRouteChange, isSignedIn }) => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
        padding: "10px",
      }}
    >
      {isSignedIn ? (
        <p
          onClick={() => onRouteChange('signout')}
          className="f3 link dim black underline pa3 pointer"
        >
          Sign out
        </p>
      ) : (
        <>
          <p
            onClick={() => onRouteChange("signin")}
            className="f3 link dim black underline pa3 pointer"
          >
            Sign in
          </p>
          <p
            onClick={() => onRouteChange("register")}
            className="f3 link dim black underline pa3 pointer"
          >
            Register
          </p>
        </>
      )}
    </nav>
  );
};

export default Navigation;
