import React, { useRef } from "react";
import { NavLink, useNavigate } from 'react-router-dom';
import { CSVLink } from "react-csv";
import {
    Label,
    Input,
    FormGroup,
    Row,
    Col,
    Button,
} from "reactstrap";
// import { Form } from 'reactstrap';
import { UncontrolledAlert } from "reactstrap";

import ComponentCard from '../components/ComponentCard';

import Loader from '../components/Loader';

import * as XLSX from 'xlsx';

import DataTable from "react-data-table-component";

const PageEngagementRate = (props) => {

    const { UserID, UserType } = props;

    let navigate = useNavigate();

    if (!UserID) {
        navigate('/login');
    }


    const [get_batch_list, setBatchlist] = React.useState([]);
    const [get_flash_data, setflashdata] = React.useState([]);

    console.log(get_batch_list)

    const [loading, setLoading] = React.useState(false);

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


    React.useEffect(() => {
        getBatchData();
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps


    const getBatchData = async (e) => {

        let value = '';
        if (e) {
            value = e.target.value;
        }

        let user_id = UserID.toString();

        var res = {};

        if (UserType === "-1") {
            res = await fetch("/getBatchData", {
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
            res = await fetch("/getBatchData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value, user_id
                })
            });
        }


        const data = await res.json();

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setBatchlist(data);

        }
    }


    const [fileName, setFileName] = React.useState(null);
    const [sheetdata, setsheetdata] = React.useState([]);
    const [filerefrencedata, setfilerefrencedata] = React.useState([]);

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
        var page_links = {};

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

            if (!sheet_details['Page Links']) {
                setFileName(null);
                console.log("Please upload correct excelsheet file.")
                document.getElementById("userfile").value = '';
                document.getElementById("userfile_field").innerHTML = "Please upload correct excelsheet file.";
                document.getElementById('userfile_field').style.color = 'red';

                return;
            }
            else {

                page_links[i] = {
                    page_link: sheet_details['Page Links'],
                };

                document.getElementById("userfile_field").innerHTML = "";
            }
        }

        setsheetdata(page_links);
        setfilerefrencedata(myfile.name + "_" + Date.now())
        setFileName(myfile.name);
    }

    const handleRemove = () => {
        setFileName(null);
        setsheetdata(null);
        document.getElementById("userfile").value = '';
    }

    const upload_file = async (e) => {

        e.preventDefault();

        if (Object.keys(sheetdata).length > 0 && fileName && filerefrencedata) {

            setLoading(true);

            var checkupdate = 0;
            var checksame = 0;
            var checkerror = 0;
            const record_numbers = Object.keys(sheetdata).length;
            const isfile = true;

            var user_id = UserID;


            for (let i = 0; i < record_numbers; i++) {

                let { page_link } = sheetdata[i];

                let today = new Date();
                let date = today.toLocaleString('en-GB').split('/');
                let time = today.toLocaleString('en-GB').split('/')[2].split(',');
                date = time[0] + "-" + date[1] + "-" + date[0];
                time = time[1];
                let currentdatetime = date + " " + time;

                let page_created_at = currentdatetime;


                if (page_link &&
                    user_id &&
                    page_created_at) {

                    const res = await fetch("/addPageLink", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            page_link,
                            user_id,
                            page_created_at,
                            record_numbers,
                            fileName,
                            isfile,
                            filerefrencedata
                        })

                    });

                    const data = await res.json();

                    if (res.status === 404 || !data) {
                        // console.log(data);
                        // setLoading(false);

                        // let flash = { error: "Unable to add Page Link. Please try again." };
                        // setflashdata(flash);
                        // handleRemove()
                        // return;
                        checkerror = checkerror + 1
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

            if (checkupdate === record_numbers) {
                setLoading(false);
                let flash = { success: "Excelsheet uploaded successfully." };
                setflashdata(flash);
                handleRemove()
            }
            else if (checkupdate > 0) {
                setLoading(false);
                let flash = { success: checkupdate + " Row Inserted, " + checksame + " Link already present, " + checkerror + " Link Invalid" };
                setflashdata(flash);
                handleRemove()
            }
            else {
                setLoading(false);
                let flash = { error: "Details Invaild, Please Check the Sheet. " + checksame + " Link already present, " + checkupdate + " Row Inserted, " + checkerror + " Link Invalid" };
                setflashdata(flash);
                handleRemove()
            }
        }

    }

    const upload_link = async (e) => {
        e.preventDefault();
        var { link } = inpval_link;

        let page_link = link;

        let today = new Date();
        let date = today.toLocaleString('en-GB').split('/');
        let time = today.toLocaleString('en-GB').split('/')[2].split(',');
        date = time[0] + "-" + date[1] + "-" + date[0];
        time = time[1];
        let currentdatetime = date + " " + time;

        let page_created_at = currentdatetime;

        var user_id = UserID;
        var isfile = false;

        if (page_link &&
            user_id &&
            page_created_at) {

            const res = await fetch("/addPageLink", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    page_link,
                    user_id,
                    page_created_at,
                    isfile,
                })

            });


            let data = await res.json();


            if (res.status === 404 || !data) {
                console.log(data);
                let flash = { error: "Unable to add Page Link. Please try again." };
                setflashdata(flash);
                setINP_link({ link: '' });
                document.getElementById("link").value = '';
            }
            else if (res.status === 401) {
                // console.log(data);
                let flash = { error: "Link already Present. Please try again with different Link." };
                setflashdata(flash);
                setINP_link({ link: '' });
                document.getElementById("link").value = '';
            }
            else {
                let flash = { success: "Link added successfully." };
                setflashdata(flash);
                setINP_link({ link: '' });
                document.getElementById("link").value = '';
            }


        }
        else {
            for (let property in inpval_link) {
                if (!inpval_link[property]) {
                    createElementSpan(property);
                }
            }
        }

    }

    const submitButton = (parameter) => {
        return <Button className="btn" style={{ float: "right", transform: "translateY(-100%)" }} onClick={parameter} color="primary">
            Submit
        </Button>;
    }

    const csvLink = useRef() // setup the ref that we'll use for the hidden CsvLink click once we've updated the data

    const [getPageData, setPageData] = React.useState([]);

    const csvheader = [
        { label: "S.No", key: "key" },
        { label: "Page Link", key: "page_link" },
        { label: "Page Username", key: "page_name" },
        { label: "Followers", key: "page_followers" },
        { label: "Followings", key: "page_following" },
        { label: "Like Engagement Rate", key: "page_like_engagement" },
        { label: "Video Engagement Rate", key: "page_video_engagement" },
    ];

    var data = [];
    if (getPageData.length > 0) {

        let id = 0;
        let key = 0;

        for (const element of getPageData) {
            key = key + 1;
            data[id] = {
                ...data[id],
                key: key,
                page_link: (element.page_link ? element.page_link : 'NA'),
                page_name: (element.page_name ? element.page_name : 'NA'),
                page_followers: (element.page_followers ? element.page_followers : 'NA'),
                page_following: (element.page_following ? element.page_following : 'NA'),
                // page_total_posts: (element.page_total_posts ? element.page_total_posts : 'NA'),
                page_like_engagement: (element.page_like_engagement ? element.page_like_engagement : 'NA'),
                page_video_engagement: (element.page_video_engagement ? element.page_video_engagement : 'NA'),
            }
            id = id + 1;
        }
    }


    const csvReport = {
        data: data,
        headers: csvheader,
        filename: `Page-Engagement-Data_${Date.now()}.csv`,
        className: 'hidden',
        ref: csvLink,
        target: '_blank',
    };


    const getDataforCSV = async (id) => {
        console.log("getDataForCSV")
        console.log("id: " + id)

        var res = await fetch("/getPageData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id
            })
        });

        const data = await res.json();
        console.log(data)

        if (res.status === 422 || !data) {
            console.log(data);

        } else {
            setPageData(data);
            csvLink.current.link.click()

        }
    }

    const getDataforEmail = (id) => {
        console.log("getDataForEmail")
        console.log("id: " + id)
    }


    //  Internally, customStyles will deep merges your customStyles with the default styling.
const customStyles = {
    rows: {
        style: {
            fontSize: '16px'
        },
    },
    headCells: {
        style: {
            
            fontSize: '18px',
            fontWeight: 'bold'

        },
    },
    cells: {
        style: {
            
        },
    },
};

    const dataTableheader = [
        {
            name: "#",
            selector: row => row.key,
            sortable: true,
        },
        {
            name: "File Name",
            selector: row => row.batch_name,
            sortable: true
        },
        {
            name: "Action",
            selector: row => row.action,
            sortable: true,
            right: true
        }
    ];


    var batchdata = [];
    if (get_batch_list.length > 0) {

        let id = 0;
        let key = 0;

        for (const element of get_batch_list) {
            key = key + 1;
            batchdata[id] = {
                ...batchdata[id],
                key: key,
                batch_name: (element.batch_name),
                action: (element.batch_is_traverse === "1" ?
                    <>
                        {/* <div> */}
                            <Button color="light-warning" onClick={() => getDataforCSV(element.batch_id)}>Download</Button>&nbsp; &nbsp;
                            <CSVLink
                                {...csvReport}
                            />
                        {/* </div> */}

                        <Button color="light-success" onClick={() => getDataforEmail(element.batch_id)}>Email</Button>
                    </>
                    : <Button color="light-danger" disabled>Inprogress</Button>
                ),
            }
            id = id + 1;
        }
    }

    var datatablereport = {
        title: "Download Page Enagagement Report",
        columns: dataTableheader,
        data: batchdata,
        defaultSortField: "title",
        pagination: true,
        customStyles: customStyles,
    };

    return (
        <div>
            {loading ? (
                <div className="loader-style" >
                    <Loader />
                </div>
            ) : (
                <div>

                    {/* flash message */}
                    <Row>
                        <Col>
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


                    {/***Top Cards***/}
                    <ComponentCard
                        title="Check Engagement Rate"

                        children={
                            <>
                                <p>
                                    Enter Instagram Page links to Check Engagement Rate.
                                </p>

                            </>

                        }
                    >
                    </ComponentCard>


                    {/* upload link section */}
                    <Row>
                        <Col xl="5" xxl="5">
                            <FormGroup>
                                <Label for="file">File</Label>
                                <Input onChange={(e) => fileUploadBulk(e)}
                                    id="userfile" name="userfile" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .csv" type="file" />
                                {fileName && (<i className="bi bi-x-circle-fill" onClick={handleRemove} style={{ float: "right", margin: "-30px 80px" }} ></i>)}


                                <span id="userfile_field" style={{ color: "red" }}></span>

                                {submitButton(upload_file)}
                            </FormGroup>
                            <FormGroup>
                                <NavLink target="_blank" to="/uploads/format/Instagram_Reel_links_template.xlsx">Download Sample File</NavLink>

                            </FormGroup>
                        </Col>

                        <Col xl="2" xxl="2">

                        </Col>

                        <Col xl="5" xxl="5">
                            <FormGroup>
                                <Label for="link">Enter Link</Label>
                                <Input id="link" name="link" onChange={setdata_link} type="text" />
                                {submitButton(upload_link)}
                            </FormGroup>
                        </Col>

                    </Row>

                    <br />
                    {/* <Row>
                        
                        <Col sm="3" lg="3" xl="4" xxl="4">
                            <FormGroup>
                                <Button color="light-warning" onClick={getResults}>Get Results</Button>
                            </FormGroup>
                        </Col>


                        <Col sm="6" lg="6" xl="6" xxl="6">

                        </Col>


                        
                        <Col sm="3" lg="3" xl="2" xxl="2"  >
                            <FormGroup>
                                <CSVLink {...csvReport} className="btn btn-primary exportpage">Export Sheet</CSVLink>
                            </FormGroup>
                        </Col>
                    </Row> */}

                    <br />
                    <Row>
                        <Col>
                            <FormGroup>
                                <Input id="link" name="link" type="text" onChange={getBatchData} placeholder="Search by File Name or Page username or Page Link" />
                            </FormGroup>
                        </Col>
                    </Row>

                    <br />
                    <Row>
                        <Col>

                            <DataTable
                                {...datatablereport}
                            />
                        </Col>
                    </Row>

                </div>

            )}

        </div>
    );


};

export default PageEngagementRate;
