
import React from "react";
import {
  Button, Nav, NavItem
} from "reactstrap";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";


function insertAt(array, index, ...elementsArray) {
  array.splice(index, 0, ...elementsArray);
}

const navigation = [
  {
    title: "Instagram",
    icon: "bi bi-instagram",
    iconClosed: <i className="bi bi-caret-down-fill"></i>,
    iconOpened: <i className="bi bi-caret-up-fill"></i>,
    isOpen: false,
    subNav: [
      {
        title: "Insta Camapigns",
        href: "/project",
        // icon: "bi bi-megaphone",

      },
      {
        title: "Manage Content",
        href: "/starter",
        // icon: "bi bi-clipboard-data",

      },
      // {
      //   title: "Engagement Rate",
      //   href: "/Engagement-Rate",
      //   // icon: "bi bi-graph-up",

      // },
    ],
  },
  {
    title: "Youtube",
    icon: "bi bi-youtube",
    iconClosed: <i className="bi bi-caret-down-fill"></i>,
    iconOpened: <i className="bi bi-caret-up-fill"></i>,
    isOpen: false,
    subNav: [
      {
        title: "Youtube Camapigns",
        href: "/Youtube-Campaign",
        // icon: "bi bi-megaphone",

      },
      {
        title: "Manage Content",
        href: "/Youtube-Content",
        // icon: "bi bi-clipboard-data",

      },
      // {
      //   title: "Engagement Rate",
      //   href: "/Engagement-Rate",
      //   // icon: "bi bi-graph-up",

      // },
    ],

  },
  {
    title: "Settings",
    href: "/Update-Password",
    icon: "bi bi-gear",

  },
  {
    title: "Logout",
    href: "/Logout",
    icon: "bi bi-box-arrow-right",

  },

];

var navigation_lenght = navigation.length;

const Sidebar = (props) => {

  let location = useLocation();
  
  const { UserType } = props;

  const [subnav, setSubnav] = React.useState(false);

  React.useEffect(() => {
    for (let property in navigation) {
      if (navigation[property].subNav){
        var result = (navigation[property].subNav).find(item => item.href === location.pathname);
        if (result !== undefined) {
          showSubnav(navigation[property].title, true);
        }
      }
      else if (navigation[property].href === location.pathname){
        showSubnav(navigation[property].title, true);
      }
    }
  }, [location.pathname]);  // eslint-disable-line react-hooks/exhaustive-deps


  const showSubnav = (title, islinked) => {
    //Find index of specific object using findIndex method.    
    var objIndex = navigation.findIndex((obj => obj.title === title));
    
    if (islinked){
      for (let property in navigation) {
        if (objIndex === parseInt(property)){
          navigation[property].isOpen = true
        }
        else {
          navigation[property].isOpen = false
        }
      }
    }
    else {
      navigation[objIndex].isOpen = !navigation[objIndex].isOpen
    }
    
    setSubnav(!subnav)
  };

  
  if (UserType === "-1") {
    if (navigation_lenght === navigation.length) {
      insertAt(navigation, 2,
        {
          title: "Users",
          href: "/users",
          icon: "bi bi-people",
        },
      );
    }

  }

  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };
  

  
  return (
    <div className="p-3">
      <div className="d-flex align-items-center">
        <Logo />
        <Button
          close
          size="sm"
          className="ms-auto d-lg-none"
          onClick={() => showMobilemenu()}
        ></Button>
      </div>
      <div className="pt-4 mt-2">
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              {navi.href ?
                <Link
                  to={navi.href}
                  className={
                    location.pathname === navi.href
                      ? "text-primary nav-link py-3"
                      : "nav-link text-secondary py-3"
                  }
                  onClick={navi.subNav && (() => showSubnav(navi.title))}
                >
                  <i className={navi.icon}></i>
                  <span className="ms-3 d-inline-block">{navi.title}</span>
                  <span style={{ float: "right" }}>
                    {navi.subNav && navi.isOpen
                      ? navi.iconOpened
                      : navi.subNav
                        ? navi.iconClosed
                        : null}
                  </span>
                </Link> :
                <span
                  className={
                    navi.isOpen
                      ? "text-primary nav-link py-3"
                      : "nav-link text-secondary py-3"
                  }
                  // onClick={navi.subNav && showSubnav}
                  onClick={navi.subNav && (() => showSubnav(navi.title))}
                >
                  <i className={navi.icon}></i>
                  <span className="ms-3 d-inline-block">{navi.title}</span>
                  <span style={{ float: "right" }}>
                    {navi.subNav && navi.isOpen
                      ? navi.iconOpened
                      : navi.subNav
                        ? navi.iconClosed
                        : null}
                  </span>
                </span>}
              {navi.subNav && navi.isOpen &&
                navi.subNav.map((item, subIndex) => (
                  <span to={item.href} key={subIndex}>
                    <Link
                      to={item.href}
                      className={
                        location.pathname === item.href
                          ? "text-primary nav-link py-3"
                          : "nav-link text-secondary py-3"
                      }
                      style={{ margin: "0px 20px" }}
                    >
                      <i className={item.icon}></i>
                      <span className="ms-3 d-inline-block">{item.title}</span>
                    </Link>
                  </span>

                ))}
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
