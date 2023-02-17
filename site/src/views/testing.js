import React from "react";

const testing = () => {

    fetch('/testing', {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((res) => res.json()
        ).then(json => {
            console.log(json);

        }).catch(err => {
            console.error('error:' + err)
        });




    return (
        <>

        </>
    );
};

export default testing;
