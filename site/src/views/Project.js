import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Button, Card, CardText, CardTitle } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { UncontrolledAlert } from "reactstrap";
import { confirm } from "react-confirm-box";
import ComponentCard from '../components/ComponentCard';


import Select from 'react-select';


const Project = (props) => {

    const { UserID, UserType } = props;

    let navigate = useNavigate();

    if (!UserID) {
        navigate('/login');
    }


    let message = useLocation();

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

    const [get_project_list, setProjectlist] = React.useState([]);
    const [get_flash_data, setflashdata] = React.useState([]);

    let defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate())

    const [date] = React.useState(defaultDate)

    React.useEffect(() => {
        getProjectdata();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    React.useEffect(() => {
        if (UserType === "-1") {
            getUserdata()
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const [inpval, setINP] = React.useState({
        projectName: '',
        startDate: '',
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

    // set value for default selection
    const [selectedValue, setSelectedValue] = React.useState([]);

    // handle onChange event of the dropdown
    const handleChange = (e) => {
        setSelectedValue(Array.isArray(e) ? e.map(x => x.value) : []);
    }

    const getUserdata = async () => {

        var res = {};

        res = await fetch("/getActiveUser", {
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

    var userdata = get_user_list.map(function (num) {
        return { value: num.user_id, label: num.name };
    });

    const search = async (e) => {
        let value = e.target.value;
        if (value) {
            let user_id = UserID.toString();

            var res = {};

            if (UserType === "-1") {
                res = await fetch("/getProject", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        value
                    })
                });
            }
            else {
                res = await fetch("/getProject", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id, value
                    })
                });
            }
            const data = await res.json();

            if (res.status === 422 || !data) {
                console.log(data);

            } else {
                setProjectlist(data);

            }
        }
        else {
            getProjectdata();
        }
    }

    const getProjectdata = async () => {
        let user_id = UserID.toString();

        var res = {};

        if (UserType === "-1") {
            res = await fetch("/getProject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            });
        }
        else {
            res = await fetch("/getProject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id
                })
            });
        }


        const data = await res.json();

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setProjectlist(data);

            if (message.state) {

                if (message.state['flash'] === "select_project") {
                    let flash = { project_error: "Please select a Project first" };
                    setflashdata(flash);
                }
                window.history.replaceState({}, document.title)

            }


        }
    }


    const addProject = async (e) => {

        e.preventDefault();

        var { projectName, startDate } = inpval;

        var selectedusers = selectedValue;

        let user_id = UserID.toString();

        if (user_id && projectName && startDate) {

            const res = await fetch("/addProject", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id, projectName, startDate, selectedusers
                })

            });

            var data = await res.json();


            if (res.status === 404 || !data) {
                if (data === null)
                    data = "Project information not added, please try again later."

                let flash = { error: data };
                toggleAdd();
                setflashdata(flash);
                getProjectdata();

            } else {
                let flash = {};
                if (Array.isArray(selectedusers) && selectedusers.length) {
                    flash = { success: "Project information added successfully." };
                } else {
                    flash = { success: "Project information added successfully But no user is added." };
                }
                setflashdata(flash);
                toggleAdd();
                getProjectdata();
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

    const editProject = async (project_id) => {
        const projectid = project_id;

        const res = await fetch(`/getProject/${projectid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await res.json();
        // console.log(data.project_users)

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setSelectedValue(data.project_users)
            setINP({ ...inpval, id: data._id, projectName: data.project_name, projectStatus: data.project_status, startDate: data.project_starts_on });
            toggleUpdate();
        }

    }



    const updateProject = async (e) => {

        e.preventDefault();

        var { id, projectName, projectStatus, startDate } = inpval;

        var selectedusers = selectedValue;

        let project_updated_on = Date();

        if (id && projectName && projectStatus && startDate) {
            const res = await fetch(`/updateProject/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectStatus, startDate, project_updated_on, selectedusers
                })

            });

            var data = await res.json();

            if (res.status === 422 || !data) {
                if (data === null)
                    data = "Project information not updated, please try again later."

                let flash = { error: data };
                window.scrollTo(0, 0);
                setflashdata(flash);
                toggleUpdate();
                getProjectdata();

            } else {

                let flash = {};
                if (Array.isArray(selectedusers) && selectedusers.length) {
                    flash = { success: "Project information updated successfully." };
                } else {
                    flash = { success: "Project information updated successfully But no user is added." };
                }
                setflashdata(flash);
                window.scrollTo(0, 0);
                toggleUpdate();
                getProjectdata();
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


    const deleteProject = async (object_id) => {

        window.scrollTo(0, 0);
        const result = await confirm("Are you sure to remove this project from the list?");
        if (result) {

            var id = object_id;

            if (id) {
                const res = await fetch(`/deleteProject/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },

                });

                var data = await res.json();

                if (res.status === 422 || !data) {
                    if (data === null)
                        data = "Project not deleted, please try again later."

                    let flash = { error: data };
                    setflashdata(flash);
                    getProjectdata();

                } else {
                    let flash = { success: "Project information deleted successfully." };
                    setflashdata(flash);
                    getProjectdata();
                }

            }
            else {
                console.log("empty id");
            }
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
                                if (get_flash_data['project_error']) {
                                    return (
                                        <>
                                            <UncontrolledAlert color="danger">
                                                <span><strong> {get_flash_data['project_error']} </strong></span>
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

                <ComponentCard
                    title="Projects"
                    subtitle={
                        <p>
                            This Campaigns track Instagram Reel or Post Information. 
                        </p>
                    }
                >

                    {
                        (() => {
                            if (UserType === "-1") {
                                return (
                                    <>
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
                                                {/* <h4></h4> */}
                                                <Form >
                                                    <FormGroup>
                                                        <Label for="projectName">Name</Label>
                                                        <Input type="text" name="projectName" id="projectName" onChange={setdata} placeholder="Project Name" />
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Label for="startDate">From</Label>
                                                        <Input type="date" name="startDate" min={date.toLocaleDateString('en-CA')} id="startDate" onChange={setdata} placeholder="date placeholder" />
                                                    </FormGroup>
                                                    {/* <FormGroup>
                                                        <Label for="endDate">To</Label>
                                                        <Input type="date" name="endDate" min={date.toLocaleDateString('en-CA')} id="endDate" onChange={setdata} placeholder="date placeholder" />
                                                    </FormGroup> */}
                                                    <FormGroup>
                                                        <Label for="selectUser">Select Users</Label>

                                                        <Select
                                                            className="dropdown"
                                                            placeholder="Search Users"
                                                            value={userdata.filter(obj => selectedValue.includes(obj.value))} // set selected values
                                                            options={userdata} // set list of the data
                                                            onChange={handleChange} // assign onChange function
                                                            isMulti
                                                            isClearable
                                                        />

                                                    </FormGroup>
                                                </Form>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button color="primary" onClick={addProject}>Add Project</Button>
                                                <Button color="secondary" onClick={toggleAdd}>Cancel</Button>
                                            </ModalFooter>
                                        </Modal>
                                    </>
                                )
                            }
                        })()
                    }

                </ComponentCard>

                <ComponentCard
                    title="Existing Projects"
                    subtitle={
                        <>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Input id="link" name="link" type="text" onChange={search} placeholder="Search Project" />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </>

                    }
                >
                    <Row>

                        {
                            get_project_list.map((element, id) => {
                                return (
                                    <Col md="6" lg="6" key={id}>
                                        <Card body>
                                            <Col>
                                                <CardTitle tag="h5">{element.project_name}</CardTitle>
                                                <CardText>
                                                    <span style={{ float: "left", color: "#0d6efd" }}>Start Date - {element.project_starts_on}</span>
                                                </CardText>
                                            </Col>
                                            {
                                                (() => {
                                                    if (UserType === "-1") {
                                                        return (
                                                            <div>
                                                                <br />
                                                                <span><Button outline color="primary" onClick={() => editProject(element.project_id)}><i className="bi bi-pencil-fill"></i></Button> </span>
                                                                <span> <Button outline color="danger" onClick={() => deleteProject(element._id)}><i className="bi bi-trash-fill"></i></Button></span>
                                                                {(element.project_status === '1') ? <Button color="light-warning" style={{ float: "right" }} onClick={() => knowMore(element.project_id)}>Know more</Button> : <Button color="light-danger" style={{ float: "right" }}>Project Inactive</Button>}
                                                            </div>
                                                        )
                                                    }

                                                    else {
                                                        return (
                                                            <>
                                                                <br />
                                                                {(element.project_status === '1') ? <Button color="light-warning" className="knowmore" onClick={() => knowMore(element.project_id)}>Know more</Button> : <Button color="light-danger" className="knowmore">Project Inactive</Button>}
                                                            </>
                                                        )

                                                    }
                                                })()
                                            }
                                        </Card>
                                    </Col>
                                )
                            })
                        }

                    </Row>

                    <Modal isOpen={modalUpdate} toggle={toggleUpdate}>
                        <ModalHeader toggle={toggleUpdate}>Update Project</ModalHeader>
                        <ModalBody>
                            {/* <h4></h4> */}
                            <Form >
                                <FormGroup>
                                    <Label for="projectName">Name</Label>
                                    <Col >
                                        <b>{inpval.projectName}</b>
                                    </Col>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="projectStatus">Status</Label>
                                    <Input id="projectStatus" name="projectStatus" onChange={setdata} value={inpval.projectStatus} type="select">
                                        <option value="0" >Inactive</option>
                                        <option value="1" >Active</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="startDate">From</Label>
                                    <Input type="date" name="startDate" id="startDate" onChange={setdata} value={inpval.startDate} placeholder="date placeholder" />
                                </FormGroup>
                                {/* <FormGroup>
                                    <Label for="endDate">To</Label>
                                    <Input type="date" name="endDate" id="endDate" onChange={setdata} value={inpval.endDate} placeholder="date placeholder" />
                                </FormGroup> */}
                                <FormGroup>
                                    <Label for="selectUser">Select Users</Label>

                                    <Select
                                        className="dropdown"
                                        placeholder="Search Users"
                                        value={userdata.filter(obj => selectedValue.includes(obj.value))} // set selected values
                                        options={userdata} // set list of the data
                                        onChange={handleChange} // assign onChange function
                                        isMulti
                                        isClearable
                                    />

                                </FormGroup>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={updateProject}>Update Project</Button>
                            <Button color="secondary" onClick={toggleUpdate}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </ComponentCard>
            </Col>


        </Row>
    );
};

export default Project;
