import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Collapse,
  Nav,
  NavItem,
  NavbarBrand,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
} from "reactstrap";
import { ReactComponent as LogoWhite } from "../assets/images/logos/xtremelogowhite.svg";
import user1 from "../assets/images/users/user1.jpg";

const Header = (props) => {

  const { UserID, UserType } = props;

  // console.log(UserType);

  let navigate = useNavigate();


  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  const [get_project_list, setProjectlist] = React.useState([]);
  const [get_account_name, setAccountName] = React.useState([]);


  React.useEffect(() => {
    getProjectdata();
    getAccountName();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getProjectdata = async () => {

    let user_id = UserID;

    var res = await fetch("/getHeaderProjectList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id, UserType
      })
    });

    const data = await res.json();
    // console.log(data);

    if (res.status === 422 || !data) {
      console.log(data);

    } else {
      setProjectlist(data);
      // console.log("get project data");

    }
  }


  const getAccountName = async () => {

    let user_id = UserID;

    var res = await fetch(`/getLoginData/${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });


    const data = await res.json();

    if (res.status === 422 || !data) {
      console.log(data);

    } else {

      setAccountName(data.name);

    }
  }

  const knowMore = async (project_id) => {

    navigate('/starter',
      {
        state: {
          projectId: project_id
        }
      });
  }

  const Update_password = async (e) => {

    e.preventDefault();

    navigate('/Update-Password');
  }

  const Logout = async (e) => {

    e.preventDefault();

    navigate('/Logout');
  }



  return (
    <Navbar color="primary" dark expand="md">
      <div className="d-flex align-items-center">
        <NavbarBrand href="/" className="d-lg-none">
          <LogoWhite />
        </NavbarBrand>
        <Button
          color="primary"
          className="d-lg-none"
          onClick={() => showMobilemenu()}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="primary"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>

          <NavItem>
            <Link to="/project" className="nav-link">
              Projects
            </Link>
          </NavItem>
          <UncontrolledDropdown inNavbar nav>
            <DropdownToggle caret nav>
              Projects Menu
            </DropdownToggle>
            <DropdownMenu end>
              {
                get_project_list.map((element, id) => {
                  return (
                    <DropdownItem key={id} onClick={() => knowMore(element.project_id)} >{element.project_name}</DropdownItem>
                  )
                })
              }
              {/* <DropdownItem>Option 1</DropdownItem> */}
              {/* <DropdownItem>Option 2</DropdownItem> */}
              {/* <DropdownItem divider />
              <DropdownItem>Reset</DropdownItem> */}
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="primary">
            <img
              src={user1}
              alt="profile"
              className="rounded-circle"
              width="30"
            ></img>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem text><b>{get_account_name}</b></DropdownItem>
            {/* <DropdownItem header>Info</DropdownItem> */}
            <DropdownItem onClick={Update_password}>Settings</DropdownItem>
            <DropdownItem divider />
            <DropdownItem onClick={Logout}>Logout</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};

export default Header;
