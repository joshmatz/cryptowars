import Head from "next/head";
import { Children } from "react/cjs/react.production.min";
import Footer from "./Footer";

const AppTemplate = ({ children }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default AppTemplate;
