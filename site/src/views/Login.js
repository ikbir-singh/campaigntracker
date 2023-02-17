import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import ComponentCard from '../components/ComponentCard';

import { Container, Button, Card, CardBody, Row, Col, Label, Input, FormGroup, UncontrolledAlert } from "reactstrap";



const Login = () => {

    let navigate = useNavigate();

    const [get_flash_data, setflashdata] = React.useState([]);

    const [inpval, setINP] = React.useState({
        username: "",
        password: "",
    })

    useEffect(() => {

        fetch('/gettoken', {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then(async (res) => {
            if (res.status === 201) {
                // console.log("error");
                navigate('/project');
            }
        }).catch((err) => {
            // setstatus(0);
            console.log(err);
            navigate('/login');

        })

    })

    const setdata = async (e) => {
        const { name, value } = e.target;
        setINP((preval) => {
            return {
                ...preval,
                [name]: value
            }
        })


    }

    const loginuser = async (e) => {


        e.preventDefault();
        var { username, password } = inpval;

        // console.log("username: "+username);
        // console.log("password: "+password);

        if (username && password) {

            const res = await fetch("/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username, password
                })

            });

            const data = await res.json();
            // console.log(data);

            if (res.status === 404 || !data) {
                let flash = {};
                if (data){
                    flash = { error: data.message };
                }
                else {
                    flash = { error: "Invalid Email or Password." };
                }
                setflashdata(flash);

            } else {
                navigate('/project');
                // console.log("success");

            }
        }
        else {
            let flash = { error: "Username and password both feilds required" };
            setflashdata(flash);

        }
    }

    return (
        <>

            <Container style={{ marginTop: "3rem" }}>
                <Row className="justify-content-center">
                    <Col sm="6" lg="6" xl="5" xxl="5">
                        <Card>
                            <CardBody className="">
                                <Row>
                                    <Col  >
                                        <div className="mx-auto mb-5">
                                            <h3>Campaign Tracker </h3>
                                        </div>

                                        <h6 className="h5 mb-0 mt-4">Welcome back!</h6>
                                        <p className="text-muted mt-1 mb-4">Enter your email address and password.</p>

                                        <Row>
                                            <Col lg="12">
                                                {
                                                    (() => {
                                                        if (get_flash_data['success']) {
                                                            return (
                                                                <>
                                                                    {/* <div className="alert alert-success"> */}
                                                                    <UncontrolledAlert color="success">
                                                                        <span><strong> Success! </strong>{get_flash_data['success']}</span>
                                                                    </UncontrolledAlert>

                                                                    {/* </div> */}
                                                                </>
                                                            )
                                                        }
                                                        if (get_flash_data['error']) {
                                                            return (
                                                                <>
                                                                    {/* <div className="alert alert-danger"> */}
                                                                    <UncontrolledAlert color="danger">
                                                                        <span><strong> Error! </strong>{get_flash_data['error']}</span>
                                                                    </UncontrolledAlert>

                                                                    {/* </div> */}
                                                                </>
                                                            )
                                                        }
                                                    })()
                                                }
                                            </Col>
                                        </Row>


                                        <FormGroup>
                                            <Label for="username">Username</Label>
                                            <Input
                                                id="username"
                                                name="username"
                                                placeholder="Enter Username"
                                                type="text"
                                                onChange={setdata}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <Label for="password">Password</Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                placeholder="Enter your password"
                                                type="password"
                                                onChange={setdata}
                                            />
                                        </FormGroup>
                                        <Button className="btn btn-primary col-lg-12" onClick={loginuser} color="primary">
                                            Log In
                                        </Button>


                                    </Col>

                                </Row>

                            </CardBody>
                        </Card>

                    </Col>
                </Row>
            </Container>


        </>
    );
};

export default Login;
