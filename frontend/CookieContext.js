import React, { createContext, useContext, useState } from "react";

const CookieContext = createContext();

export const CookieProvider = ({ children }) => {
  const [cookies, setCookies] = useState({});

  return (
    <CookieContext.Provider value={{ cookies, setCookies }}>
      {children}
    </CookieContext.Provider>
  );
};

export const useCookies = () => useContext(CookieContext);