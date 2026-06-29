import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <div id="main">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
