import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, Card, CardText, CardTitle } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { UncontrolledAlert } from "reactstrap";
import { confirm } from "react-confirm-box";
import ComponentCard from '../components/ComponentCard';



const UsersInfo = (props) => {

    const { UserType } = props;

    let navigate = useNavigate();

    if (UserType !== "-1") {
        navigate('/login');
    }

    function createElementSpan(obj) {
        var div_obj = document.getElementById(obj);
        var check_tag = document.getElementById(`${obj}_required_feild`);

        if (check_tag) {
            return
        }

        // Add span
        var span_obj = document.createElement("span");

        // Set attribute for span element, such as id
        span_obj.setAttribute("id", `${obj}_required_feild`);
        span_obj.setAttribute("style", "color:red");

        // Set text for span element
        span_obj.innerHTML = "This value is required.";

        insertAfter(div_obj, span_obj);
    }

    function insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }


    // Modal open state
    const [modalAdd, setModalAdd] = React.useState(false);
    const [modalUpdate, setModalUpdate] = React.useState(false);

    // Toggle for Modal
    const toggleAdd = () => setModalAdd(!modalAdd);
    const toggleUpdate = () => setModalUpdate(!modalUpdate);

    const [get_user_list, setUserlist] = React.useState([]);
    const [get_flash_data, setflashdata] = React.useState([]);


    React.useEffect(() => {
        getUserdata();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const [inpval, setINP] = React.useState({
        name: '',
        email: '',
        password: '',
    })

    const setdata = (e) => {
        const { name, value } = e.target;
        setINP((preval) => {
            return {
                ...preval,
                [name]: value
            }
        })
        if (value) {
            if (document.getElementById(`${name}_required_feild`))
                document.getElementById(`${name}_required_feild`).innerHTML = "";
        }
    }

    const search = async (e) => {
        let value = e.target.value;
        if (value) {

            var res = await fetch("/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value
                })
            });
            const data = await res.json();

            if (res.status === 422 || !data) {
                console.log(data);

            } else {
                setUserlist(data);

            }
        }
        else {
            getUserdata();
        }
    }

    const getUserdata = async () => {

        var res = {};

        res = await fetch("/getUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await res.json();

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setUserlist(data);

        }
    }


    const addUser = async (e) => {

        e.preventDefault();

        var { name, email, password } = inpval;

        if (name && email && password) {
            let encryptPass = password;
            const res = await fetch("/addUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name, email, encryptPass
                })

            });


            var data = await res.json();

            if (res.status === 404 || !data) {
                if (data === null)
                    data = "User information not added, please try again later."

                let flash = { error: data };
                toggleAdd();
                setflashdata(flash);
                getUserdata();

            } else {
                let flash = { success: "User information added successfully." };
                setflashdata(flash);
                toggleAdd();
                getUserdata();
            }

        }

        else {
            for (let property in inpval) {
                if (!inpval[property]) {
                    createElementSpan(property);
                }
            }
        }


    }

    const editUser = async (user_id) => {
        const userid = user_id;

        const res = await fetch(`/getUser/${userid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await res.json();

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setINP({ ...inpval, id: data._id, name: data.name, email: data.email, status: data.user_status });
            toggleUpdate();
        }

    }



    const updateProject = async (e) => {

        e.preventDefault();

        var { id, name, email, status, password } = inpval;

        if (id && name && email && status) {
            const res = await fetch(`/updateUser/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name, email, status, password
                })

            });

            var data = await res.json();

            if (res.status === 422 || !data) {
                if (data === null)
                    data = "User information not updated, please try again later."

                let flash = { error: data };
                window.scrollTo(0, 0);
                setflashdata(flash);
                toggleUpdate();
                getUserdata();

            } else {
                let flash = { success: "User information updated successfully." };
                window.scrollTo(0, 0);
                setflashdata(flash);
                toggleUpdate();
                getUserdata();
            }

        }

        else {
            for (let property in inpval) {
                if (!inpval[property]) {
                    createElementSpan(property);
                }
            }
        }
    }


    const deleteUser = async (object_id) => {

        window.scrollTo(0, 0);
        const result = await confirm("Are you sure to remove this user from the list?");
        if (result) {

            var id = object_id;

            if (id) {
                const res = await fetch(`/deleteUser/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },

                });

                var data = await res.json();

                if (res.status === 422 || !data) {
                    if (data === null)
                        data = "User not deleted, please try again later."

                    let flash = { error: data };
                    setflashdata(flash);
                    getUserdata();

                } else {
                    let flash = { success: "User Profile deleted successfully." };
                    setflashdata(flash);
                    getUserdata();
                }

            }
            else {
                console.log("empty id");
            }
        }

    }

    return (
        <Row>
            <Col>

                {/* flash message */}
                <Row>
                    <Col>
                        {
                            (() => {
                                if (get_flash_data['success']) {
                                    return (
                                        <>
                                            <UncontrolledAlert color="success">
                                                <span><strong> Success! </strong>{get_flash_data['success']}</span>
                                            </UncontrolledAlert>
                                        </>
                                    )
                                }
                                if (get_flash_data['error']) {
                                    return (
                                        <>
                                            <UncontrolledAlert color="danger">
                                                <span><strong> Error! </strong>{get_flash_data['error']}</span>
                                            </UncontrolledAlert>
                                        </>
                                    )
                                }
                                if (get_flash_data['user_add']) {
                                    return (
                                        <>
                                            <UncontrolledAlert color="success">
                                                <span><strong> {get_flash_data['user_add']} </strong></span>
                                            </UncontrolledAlert>
                                        </>
                                    )
                                }
                            })()
                        }
                    </Col>
                </Row>

                {/* --------------------------------------------------------------------------------*/}
                {/* Card-1*/}
                {/* --------------------------------------------------------------------------------*/}

                {/* <ComponentCard
                    title="Users"

                subtitle={
                    <p>
                        Some Information
                    </p>
                }
                >


                    <Row>
                        <Col lg="8">
                            <div className="mt-3">
                                <Button
                                    color="primary"
                                    target="_blank"
                                    onClick={toggleAdd}
                                >
                                    New Project
                                </Button>


                            </div>
                        </Col>
                    </Row>
                    <Modal isOpen={modalAdd} toggle={toggleAdd}>
                        <ModalHeader toggle={toggleAdd}>Project Details</ModalHeader>
                        <ModalBody>
                            <Form >
                                <FormGroup>
                                    <Label for="projectName">Name</Label>
                                    <Input type="text" name="projectName" id="projectName" onChange={setdata} placeholder="Project Name" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="startDate">From</Label>
                                    <Input type="date" name="startDate" min={date.toLocaleDateString('en-CA')} id="startDate" onChange={setdata} placeholder="date placeholder" />
                                </FormGroup>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={addProject}>Add Project</Button>
                            <Button color="secondary" onClick={toggleAdd}>Cancel</Button>
                        </ModalFooter>
                    </Modal>


                </ComponentCard> */}

                <ComponentCard
                    title={
                        <>
                            <p>
                                Existing Users
                            </p>
                            <Button
                                style={{ float: "right", margin: "-40px 0px" }}
                                color="primary"
                                onClick={toggleAdd}
                            >
                                New User
                            </Button>
                        </>

                    }
                    subtitle={
                        <>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Input type="text" onChange={search} placeholder="Search User" />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </>

                    }
                >
                    <Row>

                        {
                            get_user_list.map((element, id) => {
                                return (
                                    <Col md="6" lg="6" key={id} >
                                        {(element.user_status === "1") ? <Card body >
                                            <CardTitle tag="h5">{element.name}</CardTitle>
                                            <p><i className="bi bi-envelope"></i> {element.username}</p>
                                            <CardText>
                                            </CardText>
                                            <div>
                                                <span><Button outline color="primary" onClick={() => editUser(element.user_id)}><i className="bi bi-pencil-fill"></i></Button> </span>
                                                <span> <Button outline color="danger" onClick={() => deleteUser(element._id)}><i className="bi bi-trash-fill"></i></Button></span>
                                                {/* {(element.user_status === '1') ? <Button color="light-warning" style={{ float: "right" }} onClick={() => knowMore(element.user_id)}>Know more</Button> : <Button color="light-danger" style={{ float: "right" }}>User Inactive</Button>} */}
                                            </div>
                                        </Card> : <Card body color="light-warning">
                                            <CardTitle tag="h5">{element.name}</CardTitle>
                                            <p><i className="bi bi-envelope"></i> {element.username}</p>
                                            <CardText>
                                            </CardText>
                                            <div>
                                                <span><Button outline color="primary" onClick={() => editUser(element.user_id)}><i className="bi bi-pencil-fill"></i></Button> </span>
                                                <span> <Button outline color="danger" onClick={() => deleteUser(element._id)}><i className="bi bi-trash-fill"></i></Button></span>
                                                {/* {(element.user_status === '1') ? <Button color="light-warning" style={{ float: "right" }} onClick={() => knowMore(element.user_id)}>Know more</Button> : <Button color="light-danger" style={{ float: "right" }}>User Inactive</Button>} */}
                                            </div>
                                        </Card>}
                                    </Col>
                                )
                            })
                        }

                    </Row>

                    <Modal isOpen={modalAdd} toggle={toggleAdd}>
                        <ModalHeader toggle={toggleAdd}>User Details</ModalHeader>
                        <ModalBody>
                            <Form >
                                <FormGroup>
                                    <Label for="name">Name</Label>
                                    <Input type="text" name="name" id="name" onChange={setdata} placeholder="Enter Name" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="email">Email</Label>
                                    <Input type="email" name="email" id="email" onChange={setdata} placeholder="Enter Email" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="password">Password</Label>
                                    <Input type="password" name="password" id="password" onChange={setdata} placeholder="Enter Password" />
                                </FormGroup>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={addUser}>Add User Info</Button>
                            <Button color="secondary" onClick={toggleAdd}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                    <Modal isOpen={modalUpdate} toggle={toggleUpdate}>
                        <ModalHeader toggle={toggleUpdate}>Update User Info</ModalHeader>
                        <ModalBody>
                            <Form >
                                <FormGroup>
                                    <Label for="name">Name</Label>
                                    <Input type="text" name="name" id="name" onChange={setdata} value={inpval.name} placeholder="Enter Name" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="email">Email</Label>
                                    <Input type="email" name="email" id="email" onChange={setdata} value={inpval.email} placeholder="Enter Email" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="password">Password</Label>
                                    <Input type="password" name="password" id="password" onChange={setdata} value={inpval.password} placeholder="Enter Password" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="status">Status</Label>
                                    <Input id="status" name="status" onChange={setdata} value={inpval.status} type="select">
                                        <option value="0" >Inactive</option>
                                        <option value="1" >Active</option>
                                    </Input>
                                </FormGroup>

                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={updateProject}>Update User Info</Button>
                            <Button color="secondary" onClick={toggleUpdate}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </ComponentCard>
            </Col>


        </Row>
    );
};

export default UsersInfo;
