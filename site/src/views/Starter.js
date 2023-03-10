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
import ProjectTables from "../components/dashboard/ProjectTable";
import TopCards from "../components/dashboard/TopCards";
import ComponentCard from '../components/ComponentCard';

import Loader from '../components/Loader';

import * as XLSX from 'xlsx';

import millify from "millify";


const Starter = (props) => {

  const { UserID, UserType } = props;

  let navigate = useNavigate();

  if (!UserID) {
    navigate('/login');
  }

  var projectId = 0;

  var { state } = useLocation();

  if (state !== null) {
    projectId = state['projectId'] ? state['projectId'] : 0;
  }

  const [getProjectId, setProjectId] = React.useState(projectId);

  const [get_project_info, setProjectInfo] = React.useState([]);

  const [get_flash_data, setflashdata] = React.useState([]);

  const [loading, setLoading] = React.useState(false);

  if (getProjectId !== projectId) {
    if (projectId !== 0) {
      setProjectId(projectId);
    }
  }

  React.useEffect(() => {
    getProject();
  }, [projectId]);  // eslint-disable-line react-hooks/exhaustive-deps


  React.useEffect(() => {
    if (UserType !== "-1") {
      if (get_project_info.project_users) {
        (get_project_info.project_status !== '1' ? window.location.href = '/projects' : (get_project_info.project_users).includes(UserID) ? console.log() : window.location.href = '/projects')
      }
    }
  });


  const getProject = async () => {

    if (getProjectId !== 0) {

      const project_id = getProjectId;

      const res = await fetch(`/getProject/${project_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();

      if (res.status === 422 || !data) {
        console.log(data);

      } else {
        setProjectInfo(data);
      }
    }
    else {
      navigate('/project',
        {
          state: {
            flash: "select_project"
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

  const [get_reel_data_list, setReelDatalist] = React.useState([]);

  const [get_reel_data_table, setReelDataforTable] = React.useState([]);

  const [get_reel_total_views, setReelTotalViews] = React.useState(0);
  const [get_reel_total_likes, setReelTotalLikes] = React.useState(0);
  const [get_reel_total_comments, setReelTotalComments] = React.useState(0);
  const [get_reel_total_links, setReelTotallinks] = React.useState(0);

  const [value, setValue] = React.useState(0);


  const [getGraphDate, setGraphDate] = React.useState([]);
  const [getGarphData, setGraphData] = React.useState([]);

  const [getuploadLinkGraphDate, setuploadLinkGraphDate] = React.useState([]);
  const [getuploadLinkGarphData, setuploadLinkGraphData] = React.useState([]);


  const [getGarphType, setGraphType] = React.useState('Views');


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

  React.useEffect(() => {
    getReeldata();
    getReeldataforTable()
    getReeldataforGraph()
    getuploadLinkDataforGraph()
  }, [getProjectId]); // eslint-disable-line react-hooks/exhaustive-deps



  const getReeldata = async () => {


    if (getProjectId !== 0) {

      let project_id = getProjectId;

      const res = await fetch(`/getReel/${project_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
      });

      const data = await res.json();
      console.log(data);

      if (res.status === 422 || !data) {
        console.log(data);

      } else {

        if (data) {
          setReelDatalist(data);
          setValue(0);
        }

      }
    }
  }

  const getReeldataforTable = async (check_date_start = '', check_date_end = '') => {

    if (getProjectId !== 0) {

      let start_date = check_date_start;
      let end_date = check_date_end;

      let project_id = getProjectId.toString();

      if (project_id && (start_date || end_date)) {

        const res = await fetch(`/getReelDataforTable`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id, start_date, end_date
          })
        });

        const data = await res.json();

        if (res.status === 422 || !data) {
          console.log(data);

        } else {

          if (data) {
            setReelDataforTable(data);
          }

        }
      }
      else if (project_id) {

        const res = await fetch(`/getReelDataforTable`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id
          })
        });

        const data = await res.json();

        if (res.status === 422 || !data) {
          console.log(data);

        } else {

          if (data) {
            setReelDataforTable(data);
          }

        }
      }
    }
  }

  const getuploadLinkDataforGraph = async (check_date_start = '', check_date_end = '') => {

    if (getProjectId !== 0) {

      let start_date = check_date_start;
      let end_date = check_date_end;

      let project_id = getProjectId.toString();

      if (project_id && (start_date || end_date)) {

        const res = await fetch('/getuploadLinkDataforGrpah', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id, start_date, end_date
          })
        });

        const data = await res.json();

        if (res.status === 422 || !data) {
          console.log(data);

        } else {

          setuploadLinkDataInGraph(data);

        }
      }
      else if (project_id) {

        const res = await fetch(`/getuploadLinkDataforGrpah`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id
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

  const getReeldataforGraph = async (check_date_start = '', check_date_end = '', type = '') => {

    // let value = document.getElementById("search").value;
    // if (typeof e === 'object') {

    //   value = e.target.value;

    // }

    // console.log(value);

    if (getProjectId !== 0) {

      let graphtype = 0

      if (type) {
        setGraphType(type)
        graphtype = type
      }
      else {
        graphtype = getGarphType
      }

      let start_date = check_date_start;
      let end_date = check_date_end;

      let project_id = getProjectId.toString();

      if (project_id && (start_date || end_date)) {

        const res = await fetch('/getReelDetailsforGrpah', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id, start_date, end_date
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
      else if (project_id) {

        const res = await fetch(`/getReelDetailsforGrpah`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            project_id
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
    var reelViews = [];
    var reelLikes = [];
    var reelComments = [];
    let reelLinks = [];
    for (let i = 0; i < data.length; i++) {
      let arraydata = data[i];
      date[i] = arraydata._id;
      link = arraydata.links;
      var dataarray = arraydata.data;
      var totalReelViews = 0;
      var totalReelComments = 0;
      var totalReelLikes = 0;
      for (let index = 0; index < dataarray.length; index++) {
        let reels = dataarray[index];
        if (reels.reelview)
          totalReelViews += parseInt(reels.reelview);
        if (reels.reelcomment)
          totalReelComments += parseInt(reels.reelcomment);
        if (reels.reellike)
          totalReelLikes += parseInt(reels.reellike);
      }
      reelViews.push(totalReelViews);
      reelLikes.push(totalReelLikes);
      reelComments.push(totalReelComments);
      reelLinks.push(link);
    }

    setGraphDate(date)
    setReelTotalViews((reelViews[reelViews.length - 1] ? millify(reelViews[reelViews.length - 1]) : 0));
    setReelTotalLikes((reelLikes[reelLikes.length - 1] ? millify(reelLikes[reelLikes.length - 1]) : 0));
    setReelTotalComments((reelComments[reelComments.length - 1] ? millify(reelComments[reelComments.length - 1]) : 0))
    setReelTotallinks(millify(Math.max(...reelLinks, 0)))

    if (graphtype === 'Views') {
      setGraphData(reelViews)
    }
    if (graphtype === 'Likes') {
      setGraphData(reelLikes)
    }
    if (graphtype === 'Comments') {
      setGraphData(reelComments)
    }
    if (graphtype === 'Traverse Links') {
      setGraphData(reelLinks)
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

  let getReeldatawhere = async (check_date_start = '', check_date_end = '') => {
    let start_date = check_date_start;
    let end_date = check_date_end;

    let project_id = getProjectId;


    if (project_id || start_date || end_date) {
      // console.log(project_id);
      const res = await fetch("/getReel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          project_id, start_date, end_date
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
          setReelDatalist(data);
        }

      }
    }


  }

  function chamgepagedata(start_date, end_date) {
    setReelTotalViews(0);
    setReelTotalLikes(0);
    setReelTotalComments(0);
    setReelDatalist([]);
    setReelDataforTable([]);

    setStartDate(start_date);
    setEndDate(end_date);

    if (start_date) {
      getReeldatawhere(start_date, end_date);
    }
    else {
      getReeldata();
    }

    getReeldataforTable(start_date, end_date);
    getReeldataforGraph(start_date, end_date);
    getuploadLinkDataforGraph(start_date, end_date);
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

  const convertdate = (timestamp) => {
    var theDate = new Date(parseInt(timestamp) * 1000);
    var dateString = theDate.toLocaleString();
    return dateString
  }

  const headers = [
    { label: "S.No", key: "key" },
    { label: "Link", key: "reel_link" },
    { label: "Page Name", key: "reel_page_name" },
    { label: "View", key: "reel_play" },
    { label: "Like", key: "reel_like" },
    { label: "Comment", key: "reel_comment" },
    { label: "Posted Date", key: "reel_date_of_posting" },
  ];

  var data = [];
  if (get_reel_data_list.length > 0) {

    let id = 0;

    for (let element of get_reel_data_list) {
      if (element.doc) {
        element = element.doc;
        id = id + 1;
        data[id] = {
          ...data[id],
          key: id,
          reel_link: (element.reel_link ? element.reel_link : 'NA'),
          reel_page_name: (element.reel_page_name ? element.reel_page_name : 'NA'),
          reel_play: (element.reel_play ? element.reel_play : 'NA'),
          reel_like: (element.reel_like ? element.reel_like : 'NA'),
          reel_comment: (element.reel_comment ? element.reel_comment : 'NA'),
          reel_date_of_posting: (element.reel_date_of_posting ? convertdate(element.reel_date_of_posting) : 'NA')
        }
      }

    }
  }

  // console.log(data);

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
    filename: `Reels_data_${Date.now()}.csv`
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
    var reel_links = {};

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

      if (!sheet_details['Reel Links']) {
        setFileName(null);
        console.log("Please upload correct excelsheet file.")
        document.getElementById("userfile").value = '';
        document.getElementById("userfile_field").innerHTML = "Please upload correct excelsheet file.";
        document.getElementById('userfile_field').style.color = 'red';

        return;
      }
      else {

        reel_links[i] = {
          reel_link: sheet_details['Reel Links'],
        };

        document.getElementById("userfile_field").innerHTML = "";
      }
    }

    setsheetdata(reel_links);
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

        let { reel_link } = sheetdata[i];

        // console.log(reel_link)

        let today = new Date();
        let date = today.toLocaleString('en-GB').split('/');
        let time = today.toLocaleString('en-GB').split('/')[2].split(',');
        date = time[0] + "-" + date[1] + "-" + date[0];
        time = time[1];
        let currentdatetime = date + " " + time;

        let reel_created_at = currentdatetime;

        let reel_is_traverse = 0;
        let cronfunction = 0;
        let reel_upload = 1;

        let project_id = get_project_info.project_id;

        if (reel_link &&
          project_id &&
          reel_created_at) {

          const res = await fetch("/addReelLink", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              reel_link,
              project_id,
              reel_is_traverse,
              reel_upload,
              reel_created_at,
              cronfunction
            })

          });

          const data = await res.json();

          if (res.status === 404 || !data) {
            // console.log(data);
            setLoading(false);
            let flash = { error: "Unable to add Reel Link. Please try again." };
            setflashdata(flash);
            handleRemove()
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

      if (checkupdate === record_numbers) {
        setLoading(false);
        getReeldata();
        let flash = { success: "Excelsheet uploaded successfully." };
        setflashdata(flash);
        handleRemove()
      }
      else if (checkupdate > 0) {
        setLoading(false);
        getReeldata();
        let flash = { success: checkupdate + " Row Inserted, " + checksame + " Link already present" };
        setflashdata(flash);
        handleRemove()
      }
      else {
        setLoading(false);
        getReeldata();
        let flash = { error: "Details Invaild, Please Check the Sheet. " + checksame + " Link already present, " + checkupdate + " Row Inserted" };
        setflashdata(flash);
        handleRemove()
      }
    }

  }

  const upload_link = async (e) => {
    e.preventDefault();
    var { link } = inpval_link;

    let reel_link = link;

    let today = new Date();
    let date = today.toLocaleString('en-GB').split('/');
    let time = today.toLocaleString('en-GB').split('/')[2].split(',');
    date = time[0] + "-" + date[1] + "-" + date[0];
    time = time[1];
    let currentdatetime = date + " " + time;

    let reel_created_at = currentdatetime;

    let reel_is_traverse = 0;

    let reel_upload = 1;

    let cronfunction = 0;

    let project_id = get_project_info.project_id;

    if (reel_link &&
      project_id &&
      reel_created_at) {

      const res = await fetch("/addReelLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reel_link,
          project_id,
          reel_is_traverse,
          reel_upload,
          reel_created_at,
          cronfunction
        })

      });


      let data = await res.json();


      if (res.status === 404 || !data) {
        // console.log(data);
        let flash = { error: "Unable to add Reel Link. Please try again." };
        setflashdata(flash);
        getReeldata();
        setINP_link({ link: '' });
        document.getElementById("link").value = '';
      }
      else if (res.status === 401) {
        // console.log(data);
        let flash = { error: "Link already Present. Please try again with different Link." };
        setflashdata(flash);
        getReeldata();
        setINP_link({ link: '' });
        document.getElementById("link").value = '';
      }
      else {
        let flash = { success: "Link added successfully." };
        setflashdata(flash);
        getReeldata();
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

  // const SearchLink = async (e) => {

  //   let value = '';
  //   if (e) {
  //     value = e.target.value;

  //   }

  //   console.log(value);

  // let user_id = UserID.toString();

  // var res = {};

  // if (UserType === "-1") {
  //     res = await fetch("/getBatchData", {
  //         method: "POST",
  //         headers: {
  //             "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({
  //             value
  //         })
  //     });
  // }
  // else {
  //     res = await fetch("/getBatchData", {
  //         method: "POST",
  //         headers: {
  //             "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({
  //             value, user_id
  //         })
  //     });
  // }


  // const data = await res.json();

  // if (res.status === 422 || !data) {
  //     console.log(data);

  // } else {
  //     setBatchlist(data);

  // }
  // }


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
            title="Project Details"

            children={
              <h5>
                <p>
                  Project Name: {get_project_info.project_name}
                </p>
                <p>
                  Project Start From: {get_project_info.project_starts_on ? convertDate(get_project_info.project_starts_on) : get_project_info.project_starts_on}
                </p>
                {/* <p>
                  Project Ends At: {get_project_info.project_ends_on ? convertDate(get_project_info.project_ends_on) : get_project_info.project_ends_on}
                </p> */}

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
                <NavLink target="_blank" to="/uploads/format/Instagram_Reel_links_template.xlsx">Download Sample File</NavLink>

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
          {/* <Row>
            <Col>
              <FormGroup>
                <Input id="search" name="search" type="text" onChange={getReeldataforGraph} placeholder="Search by Username or Reel Link or Reel Shortcode" />
              </FormGroup>
            </Col>
          </Row> */}

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
            {/* <Col sm="2" lg="2" xl="2" xxl="2">
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
            </Col> */}

            {/* export button */}
            <Col sm="3" lg="3" xl="2" xxl="2"  >
              <FormGroup>
                <CSVLink {...csvReport} id="export_sheet" className="btn btn-primary export">Export Sheet</CSVLink>
              </FormGroup>
            </Col>
          </Row>


          {/* links, views, like and comment buttons */}
          <Row>
            <Col sm="6" lg="3" onClick={() => getReeldataforGraph(get_start_date, get_end_date, 'Traverse Links')}>
              <TopCards
                bg="bg-light-success text-success"
                title="Profit"
                subtitle="Links"
                earning={get_reel_total_links}
                icon="bi bi-link-45deg"

              />
            </Col>
            <Col sm="6" lg="3" onClick={() => getReeldataforGraph(get_start_date, get_end_date, 'Views')}>
              <TopCards
                bg="bg-light-danger text-danger"
                title="Refunds"
                subtitle="Total Views"
                earning={get_reel_total_views}
                icon="bi bi-eye"
              />
            </Col>
            <Col sm="6" lg="3" onClick={() => getReeldataforGraph(get_start_date, get_end_date, 'Likes')}>
              <TopCards
                bg="bg-light-warning text-warning"
                title="New Project"
                subtitle="Total Likes"
                earning={get_reel_total_likes}
                icon="bi bi-heart"
              />
            </Col>
            <Col sm="6" lg="3" onClick={() => getReeldataforGraph(get_start_date, get_end_date, 'Comments')}>
              <TopCards
                bg="bg-light-info text-into"
                title="Sales"
                subtitle="Total Comments"
                earning={get_reel_total_comments}
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
                        <SalesChart type={'Upload Links'} view={Object.values(getuploadLinkGarphData)} date={Object.values(getuploadLinkGraphDate)} />
                      </Col>
                      <Col >
                        <SalesChart type={getGarphType} view={Object.values(getGarphData)} date={Object.values(getGraphDate)} />
                      </Col>
                    </>

                  )
                }
                else {
                  return (
                    <Col >
                      <SalesChart type={getGarphType} view={Object.values(getGarphData)} date={Object.values(getGraphDate)} />
                    </Col>
                  )
                }
              })()
            }

          </Row>

          {/* Table section */}
          <Row>
            <Col lg="12">
              <ProjectTables tabledata={get_reel_data_table} />
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

export default Starter;
