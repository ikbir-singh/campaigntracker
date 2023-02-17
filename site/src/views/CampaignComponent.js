import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Button, Card, CardText, CardTitle } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import { UncontrolledAlert } from "reactstrap";
import { confirm } from "react-confirm-box";
import ComponentCard from '../components/ComponentCard';


import Select from 'react-select';



const CampaignComponent = (props) => {

    const { UserID, UserType } = props;

    let navigate = useNavigate();

    if (!UserID) {
        navigate('/login');
    }

    const pathArray = window.location.pathname.split("/");
    const campaignType = pathArray[1] ? pathArray[1].split("-")[0] : null;

    if (!campaignType){
        navigate('/project');
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

    const [get_campaign_list, setCampaignlist] = React.useState([]);
    const [get_flash_data, setflashdata] = React.useState([]);

    let defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate())

    const [date] = React.useState(defaultDate)

    React.useEffect(() => {
        getCampaigndata();
    }, [campaignType]); // eslint-disable-line react-hooks/exhaustive-deps


    React.useEffect(() => {
        if (UserType === "-1") {
            getUserdata()
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const [inpval, setINP] = React.useState({
        campaignName: '',
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
                res = await fetch("/getCampaign", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        value, campaignType
                    })
                });
            }
            else {
                res = await fetch("/getCampaign", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id, value, campaignType
                    })
                });
            }
            const data = await res.json();

            if (res.status === 422 || !data) {
                console.log(data);

            } else {
                setCampaignlist(data);

            }
        }
        else {
            getCampaigndata();
        }
    }

    const getCampaigndata = async () => {
        let user_id = UserID.toString();

        var res = {};

        if (UserType === "-1") {
            res = await fetch("/getCampaign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    campaignType
                })
            });
        }
        else {
            res = await fetch("/getCampaign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id, campaignType
                })
            });
        }

        const data = await res.json();

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setCampaignlist(data);

            if (message.state) {

                if (message.state['flash'] === "select_campaign") {
                    let flash = { camapign_error: "Please select a Campaign first" };
                    setflashdata(flash);
                }
                window.history.replaceState({}, document.title)

            }


        }
    }


    const addCampaign = async (e) => {

        e.preventDefault();

        var { campaignName, startDate } = inpval;

        var selectedusers = selectedValue;

        let user_id = UserID.toString();

        if (user_id && campaignName && startDate) {

            const res = await fetch("/addCampaign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id, campaignName, campaignType, startDate, selectedusers
                })

            });

            var data = await res.json();


            if (res.status === 404 || !data) {
                if (data === null)
                    data = "Campaign information not added, please try again later."

                let flash = { error: data };
                toggleAdd();
                setflashdata(flash);
                getCampaigndata();

            } else {
                let flash = {};
                if (Array.isArray(selectedusers) && selectedusers.length) {
                    flash = { success: "Campaign information added successfully." };
                } else {
                    flash = { success: "Campaign information added successfully But no user is added." };
                }
                setflashdata(flash);
                toggleAdd();
                getCampaigndata();
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

    const editCamapign = async (campaign_id) => {
        const campaignid = campaign_id;

        const res = await fetch(`/getCampaign/${campaignid}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        const data = await res.json();
        // console.log(data.campaign_users)

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setSelectedValue(data.campaign_users)
            setINP({ ...inpval, id: data._id, campaignName: data.campaign_name, campaignStatus: data.campaign_status, startDate: data.campaign_starts_on });
            toggleUpdate();
        }

    }



    const updateCampaign = async (e) => {

        e.preventDefault();

        var { id, campaignName, campaignStatus, startDate } = inpval;

        var selectedusers = selectedValue;

        let campaign_updated_on = Date();

        if (id && campaignName && campaignStatus && startDate) {
            const res = await fetch(`/updateCampaign/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    campaignStatus, startDate, campaign_updated_on, selectedusers
                })

            });

            var data = await res.json();

            if (res.status === 422 || !data) {
                if (data === null)
                    data = "Camapign information not updated, please try again later."

                let flash = { error: data };
                window.scrollTo(0, 0);
                setflashdata(flash);
                toggleUpdate();
                getCampaigndata();

            } else {

                let flash = {};
                if (Array.isArray(selectedusers) && selectedusers.length) {
                    flash = { success: "Camapign information updated successfully." };
                } else {
                    flash = { success: "Camapign information updated successfully But no user is added." };
                }
                setflashdata(flash);
                window.scrollTo(0, 0);
                toggleUpdate();
                getCampaigndata();
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


    const deleteCampaign = async (object_id) => {

        window.scrollTo(0, 0);
        const result = await confirm("Are you sure to remove this Camapign from the list?");
        if (result) {

            var id = object_id;

            if (id) {
                const res = await fetch(`/deleteCampaign/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },

                });

                var data = await res.json();

                if (res.status === 422 || !data) {
                    if (data === null)
                        data = "Camapign not deleted, please try again later."

                    let flash = { error: data };
                    setflashdata(flash);
                    getCampaigndata();

                } else {
                    let flash = { success: "Camapign information deleted successfully." };
                    setflashdata(flash);
                    getCampaigndata();
                }

            }
            else {
                console.log("empty id");
            }
        }

    }


    const knowMore = async (campaign_id) => {

        navigate(`/${campaignType}-Content`,
            {
                state: {
                    campaignId: campaign_id
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
                                if (get_flash_data['camapign_error']) {
                                    return (
                                        <>
                                            <UncontrolledAlert color="danger">
                                                <span><strong> {get_flash_data['camapign_error']} </strong></span>
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
                    title= {campaignType+ ' Campaign'}
                    subtitle={
                        <p>
                            {campaignType === 'Youtube' ? 'Campaigns track Youtube Shorts or Video Information.' : campaignType === 'Instagram' ? 'Campaigns track Instagram Reel or Post Information.' : null}
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
                                                        New Campaigns
                                                    </Button>


                                                </div>
                                            </Col>
                                        </Row>
                                        <Modal isOpen={modalAdd} toggle={toggleAdd}>
                                            <ModalHeader toggle={toggleAdd}>Campaigns Details</ModalHeader>
                                            <ModalBody>
                                                {/* <h4></h4> */}
                                                <Form >
                                                    <FormGroup>
                                                        <Label for="campaignName">Campaign Name</Label>
                                                        <Input type="text" name="campaignName" id="campaignName" onChange={setdata} placeholder="Campaign Name" />
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
                                                <Button color="primary" onClick={addCampaign}>Add {campaignType} Campaigns</Button>
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
                    title="Existing Campaigns"
                    subtitle={
                        <>
                            <Row>
                                <Col>
                                    <FormGroup>
                                        <Input id="link" name="link" type="text" onChange={search} placeholder="Search Campaigns" />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </>

                    }
                >
                    <Row>

                        {
                            get_campaign_list.map((element, id) => {
                                return (
                                    <Col md="6" lg="6" key={id}>
                                        <Card body>
                                            <Col>
                                                <CardTitle tag="h5">{element.campaign_name}</CardTitle>
                                                <CardText>
                                                    <span style={{ float: "left", color: "#0d6efd" }}>Start Date - {element.campaign_starts_on}</span>
                                                </CardText>
                                            </Col>
                                            {
                                                (() => {
                                                    if (UserType === "-1") {
                                                        return (
                                                            <div>
                                                                <br />
                                                                <span><Button outline color="primary" onClick={() => editCamapign(element.campaign_id)}><i className="bi bi-pencil-fill"></i></Button> </span>
                                                                <span> <Button outline color="danger" onClick={() => deleteCampaign(element._id)}><i className="bi bi-trash-fill"></i></Button></span>
                                                                {(element.campaign_status === '1') ? <Button color="light-warning" style={{ float: "right" }} onClick={() => knowMore(element.campaign_id)}>Know more</Button> : <Button color="light-danger" style={{ float: "right" }}>Campaign Inactive</Button>}
                                                            </div>
                                                        )
                                                    }

                                                    else {
                                                        return (
                                                            <>
                                                                <br />
                                                                {(element.campaign_status === '1') ? <Button color="light-warning" className="knowmore" onClick={() => knowMore(element.campaign_id)}>Know more</Button> : <Button color="light-danger" className="knowmore">Campaign Inactive</Button>}
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
                        <ModalHeader toggle={toggleUpdate}>Update Campaign</ModalHeader>
                        <ModalBody>
                            {/* <h4></h4> */}
                            <Form >
                                <FormGroup>
                                    <Label for="campaignName">Name</Label>
                                    <Col >
                                        <b>{inpval.campaignName}</b>
                                    </Col>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="campaignStatus">Status</Label>
                                    <Input id="campaignStatus" name="campaignStatus" onChange={setdata} value={inpval.campaignStatus} type="select">
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
                            <Button color="primary" onClick={updateCampaign}>Update Campaign</Button>
                            <Button color="secondary" onClick={toggleUpdate}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                </ComponentCard>
            </Col>


        </Row>
    );
};

export default CampaignComponent;
