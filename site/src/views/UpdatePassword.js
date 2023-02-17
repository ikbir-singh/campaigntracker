import React from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';
import { UncontrolledAlert } from "reactstrap";
import ComponentCard from '../components/ComponentCard';


const UpdatePassword = (props) => {

    const { UserID } = props;

    let navigate = useNavigate();

    if (!UserID) {
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

    const [get_flash_data, setflashdata] = React.useState([]);


    const [inpval, setINP] = React.useState({
        OldPassword: '',
        NewPassword: '',
        ConfirmPassword: '',
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
        if (name === "ConfirmPassword") {
            if (inpval.NewPassword) {
                createElementSpan(name);
                if (value === inpval.NewPassword) {
                    document.getElementById(`${name}_required_feild`).innerHTML = "";
                }
                else {
                    document.getElementById(`${name}_required_feild`).innerHTML = "Password Not Match";
                }
            }
            else {
                createElementSpan("NewPassword")
                setINP({...inpval,  ConfirmPassword: '' });
            }

        }
    }


    const updatePassword = async (e) => {

        e.preventDefault();

        let id = UserID;

        var { OldPassword, NewPassword, ConfirmPassword } = inpval;

        if (id && OldPassword && NewPassword && ConfirmPassword) {
            if (NewPassword === ConfirmPassword) {
                const res = await fetch(`/updatePassword/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        OldPassword, NewPassword, ConfirmPassword
                    })

                });

                var data = await res.json();

                if (res.status === 422 || !data) {
                    if (data === null)
                        data = "Password not updated, please try again later."

                    let flash = { error: data };
                    setflashdata(flash);

                } else {
                    let flash = { success: "Password updated successfully." };
                    setflashdata(flash);
                }
            }
            else {
                let data = "New Password and Confirm should be same."
                let flash = { error: data };
                setflashdata(flash);
            }


        }

        else {
            for (let property in inpval) {
                if (!inpval[property]) {
                    console.log(property)
                    createElementSpan(property);
                }
            }
        }


    }


    const cancel = async (e) => {

        e.preventDefault();

        setINP({ OldPassword: '', NewPassword: '', ConfirmPassword: '' });
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
                            })()
                        }
                    </Col>
                </Row>

                {/* --------------------------------------------------------------------------------*/}
                {/* Card-1*/}
                {/* --------------------------------------------------------------------------------*/}

                <ComponentCard
                    title="Update Password"
                    subtitle={
                        <>
                            
                            <FormGroup>
                                <Label for="OldPassword">Old Password</Label>
                                <Input type="password" name="OldPassword" id="OldPassword" onChange={setdata} value={inpval.OldPassword} placeholder="Old Password" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="NewPassword">New Password</Label>
                                <Input type="password" name="NewPassword" id="NewPassword" onChange={setdata} value={inpval.NewPassword} placeholder="New Password" />
                            </FormGroup>
                            <FormGroup>
                                <Label for="ConfirmPassword">Confirm Password</Label>
                                <Input type="password" name="ConfirmPassword" id="ConfirmPassword" onChange={setdata} value={inpval.ConfirmPassword} placeholder="Confirm Password" />
                            </FormGroup>

                            <Button color="primary" onClick={updatePassword}>Update Password</Button>&nbsp; &nbsp;

                            <Button color="secondary" onClick={cancel}>Cancel</Button>

                        </>
                    }
                >

                </ComponentCard>
            </Col>


        </Row>
    );
};

export default UpdatePassword;
