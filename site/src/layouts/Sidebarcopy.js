import { Button, Nav, NavItem } from "reactstrap";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";


function insertAt(array, index, ...elementsArray) {
  array.splice(index, 0, ...elementsArray);
}

const navigation = [
  {
    title: "Dashboard",
    href: "/project",
    icon: "bi bi-speedometer2",
  },
  {
    title: "Manage Content",
    href: "/starter",
    icon: "bi bi-clipboard-data",
  },
  {
    title: "Engagement Rate",
    href: "/Engagement-Rate",
    icon: "bi bi-graph-up",
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

  const { UserType } = props;

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
  let location = useLocation();

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
              <Link
                to={navi.href}
                className={
                  location.pathname === navi.href
                    ? "text-primary nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
