import React from "react";

const RetryReelTraverse = () => {

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


    var url = `/retryTraverseReelData`;

    var options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    };

    let reellink = {};

    fetch(url, options)
        .then((res) => res.json()
        ).then(json => {
            reellink = json;
            console.log(reellink);
            (async () => {
                for (let i = 0; i < reellink.length; i++) {

                    let reel = reellink[i];

                    if (reel.reel_link.split("/")[4]) {

                        let reel_shortcode = reel.reel_link.split("/")[4]

                        // console.log(reel._id);
                        var url = `https://instagram-profile1.p.rapidapi.com/getpost/${reel_shortcode}`;

                        var options = {
                            method: 'GET',
                            headers: {
                                'X-RapidAPI-Key': '29e3a657f0mshd2cf724a6f23862p1cbc59jsn1f05b4efdb57',
                                'X-RapidAPI-Host': 'instagram-profile1.p.rapidapi.com'
                            }
                        };

                        fetch(url, options)
                            .then((res) => res.json()
                            ).then(json => {
                                console.log(reel._id);
                                // console.log(json);
                                if (json.message) {
                                    let reel_error = json.message
                                    let reel_is_traverse = 3

                                    let today = new Date();
                                    let date = today.toLocaleString('en-GB').split('/');
                                    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
                                    date = time[0] + "-" + date[1] + "-" + date[0];
                                    time = time[1];
                                    let currentdatetime = date + " " + time;

                                    let reel_updated_at = currentdatetime

                                    var url = `/updateReelData/${reel._id}`;

                                    var options = {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            reel_error, reel_is_traverse, reel_updated_at
                                        })

                                    }

                                    fetch(url, options)
                                        .then((res) => res.json()
                                        ).then(json => {
                                            console.log(json);

                                        }).catch(err => {
                                            console.error('error:' + err)
                                        });

                                }
                                else if (json.owner) {
                                    let reel_page_name = json.owner['username']
                                    let reel_view = json.media['video_views']
                                    let reel_play = json.media['video_play']
                                    let reel_like = json.media['like']
                                    let reel_comment = json.media['comment_count']
                                    let reel_caption = json.media['caption']
                                    let reel_date_of_posting = json.media['timestamp']
                                    let reel_is_traverse = 1

                                    let today = new Date();
                                    let date = today.toLocaleString('en-GB').split('/');
                                    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
                                    date = time[0] + "-" + date[1] + "-" + date[0];
                                    time = time[1];
                                    let currentdatetime = date + " " + time;

                                    let reel_updated_at = currentdatetime

                                    var updateurl = `/updateReelData/${reel._id}`;

                                    var updateoptions = {
                                        method: "PATCH",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            reel_page_name, reel_view, reel_play, reel_like, reel_comment, reel_caption, reel_date_of_posting, reel_is_traverse, reel_updated_at
                                        })

                                    }

                                    fetch(updateurl, updateoptions)
                                        .then((res) => res.json()
                                        ).then(json => {
                                            console.log(json);
                                        }).catch(err => {
                                            console.error('error:' + err)
                                        });


                                }
                            }).catch(err => {
                                console.error('error:' + err)
                            });

                        await sleep(1500);
                    }
                    else {
                        let reel_error = "link is not correct"
                        let reel_is_traverse = -1

                        let today = new Date();
                        let date = today.toLocaleString('en-GB').split('/');
                        let time = today.toLocaleString('en-GB').split('/')[2].split(',');
                        date = time[0] + "-" + date[1] + "-" + date[0];
                        time = time[1];
                        let currentdatetime = date + " " + time;

                        let reel_updated_at = currentdatetime

                        let url = `/updateReelData/${reel._id}`;

                        let options = {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                reel_error, reel_is_traverse, reel_updated_at
                            })

                        }

                        fetch(url, options)
                            .then((res) => res.json()
                            ).then(json => {
                                console.log(json);
                            }).catch(err => {
                                console.error('error:' + err)
                            });

                    }


                }
                console.log("complete");

            })();

        }).catch(err => {
            console.error('error:' + err)
        });



    return (
        <>

        </>
    );
};

export default RetryReelTraverse;
