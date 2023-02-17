
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";


const Protected = (props) => {

    const { Component } = props;

    let navigate = useNavigate();

    const [getuserID, setuserID] = React.useState();
    const [getusertype, setusertype] = React.useState();

    useEffect(() => {

        fetch('/gettoken', {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then(async (res) => {
            if (res.status !== 201) {
                // console.log("error");
                navigate('/login');
            }
            else {
                var data = await res.json();
                // console.log(data);

                setuserID(data.userId);
                setusertype(data.usertype);
            }
            // var data = await res.json();
            // setuserID(data);
        }).catch((err) => {
            // setstatus(0);
            console.log(err);
            navigate('/login');

        })

    })

    return (
        <>
            {
                (() => {
                    if (getuserID && getusertype) {
                        return (
                            <>
                                <Component UserID={getuserID} UserType={getusertype} />
                            </>
                        )
                    }
                })()
            }
        </>

    )

}
export default Protected;