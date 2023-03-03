import React from "react";
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { CSVLink } from "react-csv";
import {
    Label,
    Input,
    FormGroup,
    Row,
    Col,
    Button,
} from "reactstrap";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import { UncontrolledAlert } from "reactstrap";
import SalesChart from "../components/dashboard/SalesChart";
import LinkChart from "../components/dashboard/LinkChart";
import YoutubeTables from "../components/dashboard/YoutubeTable";
import TopCards from "../components/dashboard/TopCards";
import ComponentCard from '../components/ComponentCard';

import Loader from '../components/Loader';

import * as XLSX from 'xlsx';

import millify from "millify";


const CamapignContentComponent = (props) => {

    const { UserID, UserType } = props;

    let navigate = useNavigate();

    if (!UserID) {
        navigate('/login');
    }

    const pathArray = window.location.pathname.split("/");
    const campaignType = pathArray[1] ? pathArray[1].split("-")[0] : null;

    if (!campaignType) {
        navigate('/project');
    }

    var campaignId = 0;

    var { state } = useLocation();

    if (state !== null) {
        campaignId = state['campaignId'] ? state['campaignId'] : 0;
    }

    const [getCampaignId, setCampaignId] = React.useState(campaignId);

    const [get_campaign_info, setCampaignInfo] = React.useState([]);

    const [get_flash_data, setflashdata] = React.useState([]);

    const [loading, setLoading] = React.useState(false);

    if (getCampaignId !== campaignId) {
        if (campaignId !== 0) {
            setCampaignId(campaignId);
        }
    }

    React.useEffect(() => {
        getCampaign();
    }, [campaignId, campaignType]);  // eslint-disable-line react-hooks/exhaustive-deps


    React.useEffect(() => {
        if (UserType !== "-1") {
            if (get_campaign_info.campaign_users) {
                (get_campaign_info.campaign_status !== '1' ? window.location.href = `/${get_campaign_info.campaign_type}-Campaign` : (get_campaign_info.campaign_users).includes(UserID) ? console.log() : window.location.href = `/${get_campaign_info.campaign_type}-Campaign`)
            }
        }
    });


    const getCampaign = async () => {

        if (getCampaignId !== 0) {

            const campaign_id = getCampaignId;

            const res = await fetch(`/getCampaign/${campaign_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const data = await res.json();

            if (res.status === 422 || !data) {
                console.log(data);

            } else {
                setCampaignInfo(data);
            }
        }
        else {
            navigate(`/${campaignType}-Campaign`,
                {
                    state: {
                        flash: "select_campaign"
                    }
                });
        }

    }

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function convertDate(date_str) {
        let temp_date = date_str.split("-");
        return temp_date[2] + " " + months[Number(temp_date[1]) - 1] + " " + temp_date[0];
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

    let defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate())

    const [date] = React.useState(defaultDate)

    const [get_start_date, setStartDate] = React.useState(0);
    const [get_end_date, setEndDate] = React.useState(0);

    const [get_video_data_list, setVideoDatalist] = React.useState([]);

    const [get_video_data_table, setVideoDataforTable] = React.useState([]);

    const [get_video_total_views, setVideoTotalViews] = React.useState(0);
    const [get_video_total_likes, setVideoTotalLikes] = React.useState(0);
    const [get_video_total_comments, setVideoTotalComments] = React.useState(0);
    const [get_video_total_links, setVideoTotallinks] = React.useState(0);

    const [value, setValue] = React.useState(0);


    const [getGraphDate, setGraphDate] = React.useState([]);
    const [getGarphData, setGraphData] = React.useState([]);

    const [getuploadLinkGraphDate, setuploadLinkGraphDate] = React.useState([]);
    const [getuploadLinkGarphData, setuploadLinkGraphData] = React.useState([]);


    const [getGarphType, setGraphType] = React.useState('Views');

    const [getSearch, setSearch] = React.useState(null);

    // Modal open state
    const [modalDate, setModalDate] = React.useState(false);

    // Toggle for Modal
    const toggleDate = () => setModalDate(!modalDate);


    const [inpval, setINP] = React.useState({
        startDate: '',
        endDate: '',
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

    const [inpval_link, setINP_link] = React.useState({
        link: '',
    })

    const setdata_link = (e) => {
        // console.log(e.target.value);
        const { name, value } = e.target;
        setINP_link((preval) => {
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

    // React.useEffect(() => {
    //     getVideodata();
    //     getVideodataforTable()
    //     getVideodataforGraph()
    //     getuploadLinkDataforGraph()
    // }, [getCampaignId, campaignType]); // eslint-disable-line react-hooks/exhaustive-deps


    React.useEffect(() => {
        getVideodatawhere();
        getVideodataforTable()
        getVideodataforGraph(getGarphType)
        getuploadLinkDataforGraph()
    }, [campaignType, getCampaignId, get_start_date, get_end_date, getSearch]); // eslint-disable-line react-hooks/exhaustive-deps



    // const getVideodata = async () => {


    //     if (getCampaignId !== 0) {

    //         let campaign_id = getCampaignId;

    //         const res = await fetch(`/getVideo/${campaign_id}`, {
    //             method: "GET",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //         });

    //         const data = await res.json();

    //         if (res.status === 422 || !data) {
    //             console.log(data);

    //         } else {

    //             if (data) {
    //                 setVideoDatalist(data);
    //             }

    //         }
    //     }
    // }

    const getVideodataforTable = async () => {

        if (getCampaignId !== 0) {

            let start_date = get_start_date;
            let end_date = get_end_date;

            let searchtype = getSearch;

            let campaign_id = getCampaignId.toString();

            if (campaign_id && (start_date || end_date)) {

                const res = await fetch(`/getVideodataforTable`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        campaign_id, start_date, end_date, searchtype
                    })
                });

                const data = await res.json();

                if (res.status === 422 || !data) {
                    console.log(data);

                } else {

                    if (data) {
                        setVideoDataforTable(data);
                    }

                }
            }
            else if (campaign_id) {

                const res = await fetch(`/getVideodataforTable`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        campaign_id, searchtype
                    })
                });

                const data = await res.json();

                if (res.status === 422 || !data) {
                    console.log(data);

                } else {

                    if (data) {
                        setVideoDataforTable(data);
                    }

                }
            }
        }
    }

    const getuploadLinkDataforGraph = async () => {

        if (getCampaignId !== 0) {

            let start_date = get_start_date;
            let end_date = get_end_date;

            let campaign_id = getCampaignId.toString();

            if (campaign_id && (start_date || end_date)) {

                const res = await fetch('/getuploadLinkDataforGraph', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        campaign_id, start_date, end_date
                    })
                });

                const data = await res.json();

                if (res.status === 422 || !data) {
                    console.log(data);

                } else {

                    setuploadLinkDataInGraph(data);

                }
            }
            else if (campaign_id) {

                const res = await fetch(`/getuploadLinkDataforGraph`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        campaign_id
                    })
                });

                const data = await res.json();

                if (res.status === 422 || !data) {
                    console.log(data);

                } else {

                    setuploadLinkDataInGraph(data);

                }
            }
        }
    }

    const getVideodataforGraph = async (type = '') => {

        if (getCampaignId !== 0) {

            let graphtype = 0

            if (type) {
                setGraphType(type)
                graphtype = type
            }
            else {
                graphtype = getGarphType
            }

            let start_date = get_start_date;
            let end_date = get_end_date;

            let searchtype = getSearch;

            let campaign_id = getCampaignId.toString();

            if (campaign_id && (start_date || end_date)) {

                const res = await fetch('/getVideoDetailsforGrpah', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        campaign_id, start_date, end_date, searchtype
                    })
                });

                const data = await res.json();

                if (res.status === 422 || !data) {
                    console.log(data);

                } else {

                    setDataInGraph(data, graphtype);

                }
            }
            else if (campaign_id) {

                const res = await fetch(`/getVideoDetailsforGrpah`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        campaign_id, searchtype
                    })
                });

                const data = await res.json();
                // console.log(data);

                if (res.status === 422 || !data) {
                    console.log(data);

                } else {

                    setDataInGraph(data, graphtype);

                }
            }
        }
    }

    function setDataInGraph(data, graphtype) {
        if (!data) {
            return
        }
        function comp(a, b) {
            return new Date(a._id).getTime() - new Date(b._id).getTime();
        }
        data.sort(comp);
        let date = {};
        let link = {};
        var videoViews = [];
        var videoLikes = [];
        var videoComments = [];
        let videoLinks = [];
        for (let i = 0; i < data.length; i++) {
            let arraydata = data[i];
            date[i] = arraydata._id;
            link = arraydata.links;
            var dataarray = arraydata.data;
            var totalVideoViews = 0;
            var totalVideoComments = 0;
            var totalVideoLikes = 0;
            for (let index = 0; index < dataarray.length; index++) {
                let videos = dataarray[index];
                if (videos.videoview)
                    totalVideoViews += parseInt(videos.videoview);
                if (videos.videocomment)
                    totalVideoComments += parseInt(videos.videocomment);
                if (videos.videolike)
                    totalVideoLikes += parseInt(videos.videolike);
            }
            videoViews.push(totalVideoViews);
            videoLikes.push(totalVideoLikes);
            videoComments.push(totalVideoComments);
            videoLinks.push(link);
        }

        setGraphDate(date)
        setVideoTotalViews((videoViews[videoViews.length - 1] ? millify(videoViews[videoViews.length - 1]) : 0));
        setVideoTotalLikes((videoLikes[videoLikes.length - 1] ? millify(videoLikes[videoLikes.length - 1]) : 0));
        setVideoTotalComments((videoComments[videoComments.length - 1] ? millify(videoComments[videoComments.length - 1]) : 0))
        setVideoTotallinks(millify(Math.max(...videoLinks, 0)))

        if (graphtype === 'Views') {
            setGraphData(videoViews)
        }
        if (graphtype === 'Likes') {
            setGraphData(videoLikes)
        }
        if (graphtype === 'Comments') {
            setGraphData(videoComments)
        }
        if (graphtype === 'Traverse Links') {
            setGraphData(videoLinks)
        }
    }


    function setuploadLinkDataInGraph(data) {
        if (!data) {
            return
        }
        function comp(a, b) {
            return new Date(a._id).getTime() - new Date(b._id).getTime();
        }
        data.sort(comp);
        let date = {};
        let link = {};
        let uploadLinks = [];

        for (let i = 0; i < data.length; i++) {
            let arraydata = data[i];
            date[i] = arraydata._id;
            link = arraydata.links;
            uploadLinks.push(link);
        }

        setuploadLinkGraphDate(date)
        setuploadLinkGraphData(uploadLinks)
    }

    let getVideodatawhere = async () => {
        let start_date = get_start_date;
        let end_date = get_end_date;

        let campaign_id = getCampaignId;

        let searchtype = getSearch;

        if (campaign_id || start_date || end_date) {
            // console.log(campaign_id);
            const res = await fetch("/getVideo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    campaign_id, start_date, end_date, searchtype
                })
            });

            const data = await res.json();
            // console.log(data);

            if (res.status === 422 || !data) {

                console.log("error ");
                console.log(data);

            } else if (res.status === 404) {

                console.log(data);

            } else {

                if (data) {
                    setVideoDatalist(data);
                }

            }
        }


    }

    function chamgepagedata(start_date, end_date) {
        setVideoTotalViews(0);
        setVideoTotalLikes(0);
        setVideoTotalComments(0);
        setVideoDatalist([]);
        setVideoDataforTable([]);

        setStartDate(start_date);
        setEndDate(end_date);
    }

    function datetime(type, days) {
        if (type === 'currentdate') {
            let today = new Date();
            let date = today.toLocaleString('en-GB').split('/');
            let time = today.toLocaleString('en-GB').split('/')[2].split(',');
            date = time[0] + "-" + date[1] + "-" + date[0];
            return date;
        }
        if (type === 'yesterdaydate') {
            let today = new Date();
            let require_date = new Date(today);
            require_date.setDate(today.getDate() - 1);
            let date = require_date.toLocaleString('en-GB').split('/');
            let time = require_date.toLocaleString('en-GB').split('/')[2].split(',');
            let yesterdaydate = time[0] + "-" + date[1] + "-" + date[0];
            return yesterdaydate;
        }
        if (type === 'customdate') {

            let today = new Date();
            let requiredate = new Date(today);
            requiredate.setDate(today.getDate() - days);
            let date = requiredate.toLocaleString('en-GB').split('/');
            let time = requiredate.toLocaleString('en-GB').split('/')[2].split(',');
            let require_date = time[0] + "-" + date[1] + "-" + date[0];

            return require_date;
        }


    }

    const handleChange = (e) => {

        // console.log(e.target.value);

        let value = e.target.value

        setValue(e.target.value);


        if (value === '0') {

            chamgepagedata()

        } else if (value === '1') {

            let date = datetime('currentdate')

            chamgepagedata(date)


        } else if (value === '2') {

            let date = datetime('yesterdaydate')

            chamgepagedata(date)


        } else if (value === '3') {

            let start_date = datetime('customdate', 15)
            let end_date = datetime('customdate', 1)

            chamgepagedata(start_date, end_date);



        } else if (value === '4') {

            let start_date = datetime('customdate', 30)
            let end_date = datetime('customdate', 1)

            chamgepagedata(start_date, end_date);


        } else if (value === '5') {

            let start_date = datetime('customdate', 90)
            let end_date = datetime('customdate', 1)

            chamgepagedata(start_date, end_date);


        } else if (value === '6') {

            let start_date = datetime('customdate', 182)
            let end_date = datetime('customdate', 1)

            chamgepagedata(start_date, end_date);



        } else if (value === '7') {

            let start_date = datetime('customdate', 365)
            let end_date = datetime('customdate', 1)

            chamgepagedata(start_date, end_date);


        } else if (value === '8') {
            setINP({
                startDate: '',
                endDate: ''
            })
        }
    };

    const selectdate = async (e) => {
        // console.log("dsd");
        e.preventDefault();
        var { startDate, endDate } = inpval;

        if (startDate && endDate) {

            chamgepagedata(startDate, endDate);
        }
        else {
            for (let property in inpval) {
                if (!inpval[property]) {
                    createElementSpan(property);
                }
            }
        }
    }


    const headers = [
        { label: "S.No", key: "key" },
        { label: "Link", key: "video_link" },
        { label: "Channel Name", key: "video_channel_name" },
        { label: "View", key: "video_view" },
        { label: "Like", key: "video_like" },
        { label: "Comment", key: "video_comment" },
        { label: "Video Title", key: "video_title" },
        { label: "Posted Date", key: "video_date_of_posting" },
    ];

    var data = [];
    if (get_video_data_list.length > 0) {

        let id = 0;

        for (var element of get_video_data_list) {
            if (element.doc) {
                element = element.doc;
                id = id + 1;
                data[id] = {
                    ...data[id],
                    key: id,
                    video_link: (element.video_link ? element.video_link : 'NA'),
                    video_channel_name: (element.video_channel_name ? element.video_channel_name : 'NA'),
                    video_view: (element.video_view ? element.video_view : 'NA'),
                    video_like: (element.video_like ? element.video_like : 'NA'),
                    video_comment: (element.video_comment ? element.video_comment : 'NA'),
                    video_title: (element.video_title ? element.video_title : 'NA'),
                    video_date_of_posting: (element.video_date_of_posting ? element.video_date_of_posting : 'NA')
                }
            }
        }
    }

    if (document.getElementById('export_sheet')) {
        if (data.length > 0) {
            document.getElementById('export_sheet').style.display = 'block';
        } else {
            document.getElementById('export_sheet').style.display = 'none';
        }
    }

    const csvReport = {
        data: data,
        headers: headers,
        filename: `Youtube_data_${Date.now()}.csv`
    };

    const [fileName, setFileName] = React.useState(null);
    const [sheetdata, setsheetdata] = React.useState([]);

    // console.log(fileName)
    // console.log(file)
    // console.log(sheetdata)

    const acceptFileType = ["xlsx", "xls", "csv"];

    const checkFileName = (name) => {
        return acceptFileType.includes(name.split(".").pop().toLowerCase());
    }

    const fileUploadBulk = async (e) => {

        // console.log(e.target.files[0]);

        let myfile = e.target.files[0];
        if (!myfile) {
            return;
        }
        if (!checkFileName(myfile.name)) {
            console.log("Invaild File Type");
            setFileName(null);
            document.getElementById("userfile_field").innerHTML = "Upload file format is not acceptable. Upload only .xls or .xlsx file.";
            document.getElementById('userfile_field').style.color = 'red';
            return;
        }

        //read xlsx metadata
        const data = await myfile.arrayBuffer();
        const wb = XLSX.read(data);

        // console.log(wb);

        var mySheetData = {};
        var video_links = {};

        let sheetName = wb.SheetNames[0];   // fisrt sheet name

        const worksheet = wb.Sheets[sheetName];
        const jsondata = XLSX.utils.sheet_to_json(worksheet);
        mySheetData[sheetName] = jsondata;   // collecting data from first sheet  only 

        // console.log(mySheetData[sheetName]);

        if (mySheetData[sheetName].length === 0) {
            console.log("Empty File");
            setFileName(null);
            document.getElementById("userfile_field").innerHTML = "Upload file is Empty. Upload a file with data";
            document.getElementById('userfile_field').style.color = 'red';
            document.getElementById("userfile").value = '';
            return;
        }

        for (let i = 0; i < mySheetData[sheetName].length; i++) {

            let sheet_details = mySheetData[sheetName][i];

            // console.log(sheet_details);

            if (!sheet_details['Video Links']) {
                setFileName(null);
                console.log("Please upload correct excelsheet file.")
                document.getElementById("userfile").value = '';
                document.getElementById("userfile_field").innerHTML = "Please upload correct excelsheet file.";
                document.getElementById('userfile_field').style.color = 'red';

                return;
            }
            else {

                video_links[i] = {
                    video_link: sheet_details['Video Links'],
                };

                document.getElementById("userfile_field").innerHTML = "";
            }
        }

        setsheetdata(video_links);
        setFileName(myfile.name);
    }

    const handleRemove = () => {
        setFileName(null);
        setsheetdata(null);
        document.getElementById("userfile").value = '';
    }

    const upload_file = async (e) => {

        e.preventDefault();

        if (Object.keys(sheetdata).length > 0) {

            setLoading(true);

            var checkupdate = 0;
            var checksame = 0;
            const record_numbers = Object.keys(sheetdata).length;


            for (let i = 0; i < record_numbers; i++) {

                let { video_link } = sheetdata[i];

                // console.log(video_link)

                // let today = new Date();
                // let require_date = new Date(today);
                // require_date.setDate(today.getDate() - 1);
                // let date = require_date.toLocaleString('en-GB').split('/');
                // let time = require_date.toLocaleString('en-GB').split('/')[2].split(',');
                // // let yesterdaydate = time[0] + "-" + date[1] + "-" + date[0];

                let today = new Date();
                let date = today.toLocaleString('en-GB').split('/');
                let time = today.toLocaleString('en-GB').split('/')[2].split(',');
                date = time[0] + "-" + date[1] + "-" + date[0];
                time = time[1];
                let currentdatetime = date + " " + time;


                let link_created_at = currentdatetime;

                let link_is_traverse = 0;
                let cronfunction = 0;
                let link_upload = 1;

                let campaign_id = get_campaign_info.campaign_id;

                if (video_link &&
                    campaign_id &&
                    link_created_at) {

                    const res = await fetch("/addCampaignLink", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            video_link,
                            campaign_id,
                            link_is_traverse,
                            link_upload,
                            link_created_at,
                            cronfunction
                        })

                    });

                    const data = await res.json();

                    if (res.status === 404 || !data) {
                        // console.log(data);
                        setLoading(false);
                        let flash = { error: "Unable to add Links. Please try again." };
                        setflashdata(flash);
                        handleRemove();
                        handleSearchRemove();
                        return;
                    }

                    else if (res.status === 401) {
                        // console.log(Link Already present.);
                        checksame = checksame + 1;
                    }
                    else {
                        checkupdate = checkupdate + 1;
                    }

                }
                else {
                    console.log("Please fill the correct data in excel sheet");
                }

            }

            let flash = {};

            if (checkupdate === record_numbers) {
                flash = { success: "Excelsheet uploaded successfully." };
            }
            else if (checkupdate > 0) {
                flash = { success: checkupdate + " Row Inserted, " + checksame + " Link already present" };
            }
            else {
                flash = { error: "Details Invaild, Please Check the Sheet. " + checksame + " Link already present, " + checkupdate + " Row Inserted" };
            }

            setLoading(false);
            setflashdata(flash);
            handleRemove();
            handleSearchRemove();
        }

    }

    const upload_link = async (e) => {
        e.preventDefault();
        var { link } = inpval_link;

        let video_link = link;

        let today = new Date();
        let date = today.toLocaleString('en-GB').split('/');
        let time = today.toLocaleString('en-GB').split('/')[2].split(',');
        date = time[0] + "-" + date[1] + "-" + date[0];
        time = time[1];
        let currentdatetime = date + " " + time;

        let link_created_at = currentdatetime;

        let link_is_traverse = 0;

        let link_upload = 1;

        let cronfunction = 0;

        let campaign_id = get_campaign_info.campaign_id;

        if (video_link &&
            campaign_id &&
            link_created_at) {

            const res = await fetch("/addCampaignLink", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    video_link,
                    campaign_id,
                    link_is_traverse,
                    link_upload,
                    link_created_at,
                    cronfunction
                })

            });


            let data = await res.json();

            let flash = {};

            if (res.status === 404 || !data) {
                if (data === null)
                    data = "Unable to add Link. Please try again."
                flash = { error: data };

            }
            else if (res.status === 401) {
                if (data === null)
                    data = "Link already Present. Please try again with different Link."
                flash = { error: data };

            }
            else {
                flash = { success: "Link added successfully." };

            }

            setflashdata(flash);
            setINP_link({ link: '' });
            document.getElementById("link").value = '';
            handleSearchRemove();


        }
        else {
            for (let property in inpval_link) {
                if (!inpval_link[property]) {
                    createElementSpan(property);
                }
            }
        }

    }

    const YoutubeUrl = url => {
        const regexes = {
            video: /^.*(?:(?:youtu\.be\/|v\/|video\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|v(?:i)?=))([^#]*).*/,
            shorts: /^.*(?:(\/shorts\/))([^#]*).*/,
            channel: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:c\/|user\/|@)?|youtube\.com\/)([^#]*)/
        };
        for (const [type, regex] of Object.entries(regexes)) {
            const match = url.match(regex);
            if (match) {
                return {
                    data: match[2] || match[5] || (match[1] && match[1].replace(/^@/, '')),
                    type
                };
            }
        }
        return false;
    };

    const SearchLink = async (e) => {

        let value = document.getElementById("search").value;
        if (typeof e === 'object') {
            value = e.target.value;
        }

        if (value) {
            let val = YoutubeUrl(value);
            console.log(val);
            if (val.type === 'shorts' || val.type === 'video') {
                setSearch(val.data)
            }
            else {
                let flash = { error: "Search Incorrect!" };
                setflashdata(flash);
                handleSearchRemove()
            }
        }
        else {
            handleSearchRemove()
        }
    }

    const handleSearchRemove = () => {
        setSearch(null);
        document.getElementById("search").value = '';
        // getReeldataforGraph(getGarphType);
    }


    return (
        <div>
            {loading ? (
                <div className="loader-style" >
                    <Loader />
                </div>
            ) : (
                <div>

                    {/***Top Cards***/}
                    <ComponentCard
                        title="Campaign Details"

                        children={
                            <h5>
                                <p>
                                    Campaign Name: {get_campaign_info.campaign_name}
                                </p>
                                <p>
                                    Campaign Start From: {get_campaign_info.campaign_starts_on ? convertDate(get_campaign_info.campaign_starts_on) : get_campaign_info.campaign_starts_on}
                                </p>
                            </h5>

                        }
                    >
                    </ComponentCard>


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

                    {/* upload link section */}
                    <Row>
                        <Col xl="4" xxl="4">
                            <FormGroup>
                                <Label for="file">File</Label>
                                <Input onChange={(e) => fileUploadBulk(e)}
                                    id="userfile" name="userfile" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .csv" type="file" />
                                {fileName && (<i className="bi bi-x-circle-fill" onClick={handleRemove} style={{ float: "right", margin: "-30px 80px" }} ></i>)}


                                <span id="userfile_field" style={{ color: "red" }}></span>

                                <Button className="btn" style={{ float: "right", transform: "translateY(-100%)" }} onClick={upload_file} color="primary">
                                    Submit
                                </Button>
                            </FormGroup>
                            <FormGroup>
                                <NavLink target="_blank" to="/uploads/format/Youtube_Video_links_template.xlsx">Download Sample File</NavLink>

                            </FormGroup>
                        </Col>

                        <Col xl="4" xxl="4">

                        </Col>

                        <Col xl="4" xxl="4">
                            <FormGroup>
                                <Label for="link">Enter Link</Label>
                                <Input id="link" name="link" onChange={setdata_link} type="text" />
                                <Button className="btn" style={{ float: "right", transform: "translateY(-100%)" }} onClick={upload_link} color="primary">
                                    Submit
                                </Button>
                            </FormGroup>
                        </Col>

                    </Row>
                    {/* <br /> */}


                    {/* search button */}
                    <Row>
                        <Col>
                            <FormGroup>
                                <Input id="search" name="search" type="text" onChange={SearchLink} placeholder="Search by Video Link...." />
                                {getSearch && (<i className="bi bi-x-circle-fill" onClick={handleSearchRemove} style={{ float: "right", margin: "-30px 10px" }} ></i>)}
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row>

                        {/* filter section */}
                        <Col sm="3" lg="3" xl="4" xxl="4">
                            <FormGroup>
                                <Label for="filterSelect">Filter</Label>
                                <Input id="filterSelect" name="filterSelect" value={value} onChange={handleChange} type="select">
                                    <option value="0" >All Data</option>
                                    <option value="1" >Today</option>
                                    <option value="2" >Yesterday</option>
                                    <option value="3" >15 Days</option>
                                    <option value="4" >30 Days</option>
                                    <option value="5" >3 Months</option>
                                    <option value="6" >6 Months</option>
                                    <option value="7" >1 Year</option>
                                    <option value="8" >Custom Dates</option>

                                </Input>
                            </FormGroup>
                        </Col>

                        {
                            (() => {
                                if (value === '8') {
                                    return (
                                        <>
                                            <Col sm="2" lg="2" xl="2" xxl="2">
                                                <Form >
                                                    <FormGroup>
                                                        <Label for="startDate">From</Label>
                                                        <Input type="date" name="startDate" id="startDate" max={date.toLocaleDateString('en-CA')} onChange={setdata} placeholder="date placeholder" />
                                                    </FormGroup>
                                                </Form>
                                            </Col>
                                            <Col sm="2" lg="2" xl="2" xxl="2">
                                                <Form >
                                                    <FormGroup>
                                                        <Label for="endDate">To</Label>
                                                        <Input type="date" name="endDate" id="endDate" max={date.toLocaleDateString('en-CA')} onChange={setdata} placeholder="date placeholder" />
                                                    </FormGroup>
                                                </Form>
                                            </Col>
                                            <Col sm="2" lg="2" xl="2" xxl="2">
                                                <Button color="primary search" onClick={selectdate}>Search</Button>
                                            </Col>
                                        </>
                                    )
                                }
                                else {
                                    return (
                                        <>
                                            <Col sm="6" lg="6" xl="6" xxl="6">

                                            </Col>
                                        </>
                                    )
                                }
                            })()
                        }

                        {/* export button */}
                        <Col sm="3" lg="3" xl="2" xxl="2"  >
                            <FormGroup>
                                <CSVLink {...csvReport} id="export_sheet" className="btn btn-primary export">Export Sheet</CSVLink>
                            </FormGroup>
                        </Col>
                    </Row>


                    {/* links, views, like and comment buttons */}
                    <Row>
                        <Col sm="6" lg="3" onClick={() => getVideodataforGraph('Traverse Links')}>
                            <TopCards
                                bg="bg-light-success text-success"
                                title="Profit"
                                subtitle="Links"
                                earning={get_video_total_links}
                                icon="bi bi-link-45deg"

                            />
                        </Col>
                        <Col sm="6" lg="3" onClick={() => getVideodataforGraph('Views')}>
                            <TopCards
                                bg="bg-light-danger text-danger"
                                title="Refunds"
                                subtitle="Total Views"
                                earning={get_video_total_views}
                                icon="bi bi-eye"
                            />
                        </Col>
                        <Col sm="6" lg="3" onClick={() => getVideodataforGraph('Likes')}>
                            <TopCards
                                bg="bg-light-warning text-warning"
                                title="New Project"
                                subtitle="Total Likes"
                                earning={get_video_total_likes}
                                icon="bi bi-heart"
                            />
                        </Col>
                        <Col sm="6" lg="3" onClick={() => getVideodataforGraph('Comments')}>
                            <TopCards
                                bg="bg-light-info text-into"
                                title="Sales"
                                subtitle="Total Comments"
                                earning={get_video_total_comments}
                                icon="bi bi-chat-dots"
                            />
                        </Col>
                    </Row>


                    {/* Graph section  */}
                    <Row>
                        {
                            (() => {
                                if (getGarphType === 'Traverse Links') {
                                    return (
                                        <>
                                            <Col >
                                                {getuploadLinkGarphData.length > 0 && <LinkChart type={'Upload Links'} view={Object.values(getuploadLinkGarphData)} date={Object.values(getuploadLinkGraphDate)} />}
                                            </Col>
                                            <Col >
                                                {getGarphData.length > 0 && <LinkChart type={getGarphType} view={Object.values(getGarphData)} date={Object.values(getGraphDate)} />}
                                            </Col>
                                        </>

                                    )
                                }
                                else {
                                    return (
                                        <Col >
                                            {getGarphData.length > 0 && <SalesChart type={getGarphType} view={Object.values(getGarphData)} date={Object.values(getGraphDate)} />}
                                        </Col>
                                    )
                                }
                            })()
                        }

                    </Row>

                    {/* Table section */}
                    <Row>
                        <Col lg="12">
                            {get_video_data_table.length > 0 && <YoutubeTables tabledata={get_video_data_table} />}
                        </Col>
                    </Row>


                    {/* date modal code start  */}

                    <Modal isOpen={modalDate} centered={true} fade={true} toggle={toggleDate}>
                        <ModalHeader toggle={toggleDate}>Date Range</ModalHeader>
                        <ModalBody>
                            {/* <h4></h4> */}
                            <Form >
                                <FormGroup>
                                    <Label for="startDate">From</Label>
                                    <Input type="date" name="startDate" id="startDate" max={date.toLocaleDateString('en-CA')} onChange={setdata} placeholder="date placeholder" />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="endDate">To</Label>
                                    <Input type="date" name="endDate" id="endDate" max={date.toLocaleDateString('en-CA')} onChange={setdata} placeholder="date placeholder" />
                                </FormGroup>
                            </Form>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={selectdate}>Search</Button>
                            <Button color="secondary" onClick={toggleDate}>Cancel</Button>
                        </ModalFooter>
                    </Modal>

                </div>

            )}

        </div>
    );
};

export default CamapignContentComponent;
